import axios from 'axios'
import _debounce from 'lodash/debounce'
import apiRequest from './axios'
import { UAParser } from 'ua-parser-js'

export interface FetchResponse {
  message: string
  count: number
  page_size: number
  length: number
}

interface UsernameSearchParams {
  setMessage: (message: string, success: boolean) => void
  setIsLoading: (loading: boolean) => void
}
type file = {
  type: string
  source: string
  preview: string
  width: number
  height: number
}

let pdfjs: typeof import('pdfjs-dist') | null = null

export const toDateTimeLocal = (value: string | Date | null): string => {
  if (!value) return ''
  const date = typeof value === 'string' ? new Date(value) : value
  return date.toISOString().slice(0, 16)
}

export const getRemainingTime = (startAt: string | Date) => {
  const startTime = new Date(startAt).getTime()
  const now = Date.now()
  return Math.max(startTime - now, 0)
}

export async function loadPdfJs() {
  if (!pdfjs) {
    const mod = await import('pdfjs-dist')
    mod.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.js'
    pdfjs = mod
  }
  return pdfjs
}

export async function getPdfPageCount(file: File): Promise<number> {
  const buffer = await file.arrayBuffer()
  const text = new TextDecoder().decode(buffer)

  // Regex to find the page count from /Count entries in the PDF
  const matches = text.match(/\/Count\s+(\d+)/g)
  if (!matches) return 0

  // Get the largest count value — usually the total pages
  const counts = matches.map((m) => parseInt(m.replace('/Count', '').trim()))
  return Math.max(...counts)
}

export const createUsernameSearchHandler = ({
  setMessage,
  setIsLoading,
}: UsernameSearchParams) =>
  _debounce(async (value: string, url: string): Promise<string> => {
    const trimmedValue = value.trim()
    const validation = validateUsername(trimmedValue)

    if (!validation.valid) {
      setMessage(validation.message, false)
      setIsLoading(false)
      return ''
    }

    setIsLoading(true)

    const response = await apiRequest<FetchResponse>(url)
    const results = response?.data

    if (results) {
      setMessage('Sorry! This username is already taken', false)
      setIsLoading(false)
      return ''
    } else {
      setMessage('Great! The username is available', true)
      setIsLoading(false)
      return trimmedValue
    }
  }, 1000)

export async function removeFileFromS3(
  index: number,
  source: string,
  baseURL: string,
  setFiles: React.Dispatch<React.SetStateAction<file[]>>
) {
  try {
    const fileKey = source.split('.com/')[1]
    await axios.post(`${baseURL}s3-delete-file`, { fileKey })
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
  } catch (error) {
    console.error('Failed to delete file from S3:', error)
    throw error
  }
}

export const handlePendingFileUpload = async (
  file: File | Blob,
  baseURL: string,
  onProgress?: (percent: number) => void,
  filePages: number = 0,
  duration: number = 0
): Promise<{
  type: string
  name: string
  duration: number
  pages: number
  size: number
  source: string
}> => {
  try {
    const fileName = file instanceof File ? file.name : `blob-${Date.now()}`
    const fileSize = file.size
    const fileType = file.type || 'application/octet-stream'
    const type = getFileType(file as File)

    // Get presigned URL from backend
    const { data } = await axios.post(`${baseURL}s3-presigned-url`, {
      fileName,
      fileType,
    })

    const { uploadUrl } = data

    // Upload file to S3
    await axios.put(uploadUrl, file, {
      headers: { 'Content-Type': fileType },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100
          )
          onProgress(percent)
        }
      },
    })

    const cleanUrl = uploadUrl.split('?')[0]

    const uploadedFile = {
      type,
      name: fileName,
      duration,
      pages: filePages,
      size: fileSize,
      source: cleanUrl,
    }

    return uploadedFile
  } catch (error) {
    console.error('❌ Upload failed:', error)
    throw error
  }
}

export function capitalizeFirstLetter(str: string) {
  if (!str) return '' // handle empty string
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export async function uploadFile(
  file: File,
  index: number,
  type: string,
  baseURL: string,
  setFiles: React.Dispatch<React.SetStateAction<file[]>>,
  setPercents: React.Dispatch<React.SetStateAction<number[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
): Promise<string | undefined> {
  try {
    setLoading(true)

    const getMediaDimensions = (): Promise<{ width: number; height: number }> =>
      new Promise((resolve, reject) => {
        if (type.includes('image')) {
          const img = new window.Image()
          img.onload = () => resolve({ width: img.width, height: img.height })
          img.onerror = reject
          img.src = URL.createObjectURL(file)
        } else if (type.includes('video')) {
          const video = document.createElement('video')
          video.preload = 'metadata'
          video.onloadedmetadata = () => {
            URL.revokeObjectURL(video.src)
            resolve({ width: video.videoWidth, height: video.videoHeight })
          }
          video.onerror = reject
          video.src = URL.createObjectURL(file)
        } else {
          resolve({ width: 0, height: 0 })
        }
      })

    const { width, height } = await getMediaDimensions()

    const { data: filePresign } = await axios.post(
      `${baseURL}s3-presigned-url`,
      {
        fileName: file.name,
        fileType: file.type,
      }
    )

    const { uploadUrl: fileUploadUrl } = filePresign

    await axios.put(fileUploadUrl, file, {
      headers: { 'Content-Type': file.type },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100
          )
          setPercents((prev) => {
            const updated = [...prev]
            updated[index] = percent
            return updated
          })
        }
      },
    })

    const publicFileUrl = fileUploadUrl.split('?')[0]
    let publicThumbUrl = publicFileUrl

    if (type.includes('video')) {
      const video = document.createElement('video')
      video.src = URL.createObjectURL(file)
      video.crossOrigin = 'anonymous'
      video.preload = 'metadata'
      video.muted = true
      video.playsInline = true

      const canvas = document.createElement('canvas')

      await new Promise((resolve, reject) => {
        video.onloadedmetadata = () => {
          video.currentTime = Math.min(1, video.duration / 2)
        }

        video.onseeked = () => {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight

          const ctx = canvas.getContext('2d')
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)

          canvas.toBlob(async (blob) => {
            if (!blob) return reject('Failed to create thumbnail blob.')

            const thumbFileName =
              file.name.replace(/\.[^/.]+$/, '') + '-thumb.jpg'

            const { data: thumbPresign } = await axios.post(
              `${baseURL}s3-presigned-url`,
              {
                fileName: thumbFileName,
                fileType: 'image/jpeg',
              }
            )

            const { uploadUrl: thumbUploadUrl } = thumbPresign

            await axios.put(thumbUploadUrl, blob, {
              headers: { 'Content-Type': 'image/jpeg' },
            })

            publicThumbUrl = thumbUploadUrl.split('?')[0]
            resolve(true)
          }, 'image/jpeg')
        }

        video.onerror = () => reject('Error loading video for thumbnail.')
      })
    }

    setFiles((prevs) => {
      const updated = [...prevs]
      updated[index] = {
        type,
        source: publicFileUrl,
        preview: publicThumbUrl,
        width,
        height,
      }
      return updated
    })

    return publicFileUrl
  } catch (error) {
    console.error('Upload failed:', error)
  } finally {
    setLoading(false)
  }
}

export const getAge = (dob: string | Date): number => {
  const birthDate = new Date(dob)
  const today = new Date()

  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()

  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

export const countText = (content: string): number => {
  const plainText = content.replace(/<[^>]+>/g, '')
  return plainText.trim().length
}

export const isStringLengthValid = (
  content: string,
  length: number
): boolean => {
  if (content.replace(/<[^>]*>/g, '').trim().length < length) {
    return false
  } else {
    return true
  }
}

export const getDeviceInfo = () => {
  const parser = new UAParser()
  const result = parser.getResult()

  return {
    os: result.os.name || 'Unknown OS',
    osVersion: result.os.version || '',
    browser: result.browser.name || 'Unknown Browser',
    browserVersion: result.browser.version || '',
    device: result.device.model || 'Desktop',
  }
}

export async function handleFileUploadWithProgress(
  event: React.ChangeEvent<HTMLInputElement>,
  baseURL: string,
  getFileType: (file: File) => string,
  setFiles: React.Dispatch<React.SetStateAction<file[]>>,
  setPercents: React.Dispatch<React.SetStateAction<number[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
  if (event.target.files) {
    const files = event.target.files
    for (let i = 0; i < files.length; i++) {
      const el = files[i]
      const type = getFileType(el)
      await uploadFile(el, i, type, baseURL, setFiles, setPercents, setLoading)
    }
  }
}

export const addQuery = (
  input: string,
  startWith: string,
  replacement: string
) => {
  if (!input) {
    return replacement
  }
  if (!input.includes(startWith)) {
    return `${input}${replacement}`
  }
  const regex = new RegExp(`${startWith}[^&]*&`, 'g')
  return input.replace(regex, replacement)
}

export const appendForm = (inputs: Input[]): FormData => {
  const data = new FormData()

  inputs.forEach((el) => {
    if (el.value !== null && el.value !== undefined) {
      if (el.value instanceof File) {
        // Append file object directly
        data.append(el.name, el.value)
      } else {
        // Convert other types to string and append
        data.append(el.name, String(el.value).trim())
      }
    }
  })

  return data
}

export const calculateRemainingTime = (endTime: Date): CountdownState => {
  const formatTime = (time: number): string => time.toString().padStart(2, '0')
  const now = new Date()
  const timeDifference = endTime.getTime() - now.getTime()

  if (timeDifference <= 0) {
    return { countdown: 'Expired', isExpired: true }
  }

  const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24))
  const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((timeDifference / (1000 * 60)) % 60)
  const seconds = Math.floor((timeDifference / 1000) % 60)

  // Include all units, with leading zeros
  const countdown = `${formatTime(days * 24 + hours)}:${formatTime(
    minutes
  )}:${formatTime(seconds)}`

  return {
    countdown,
    isExpired: false,
  }
}

export const cleanQuery = (queryString: string): string => {
  return queryString.endsWith('&') ? queryString.slice(0, -1) : queryString
}

export function formatMoney(num: number): string {
  if (num < 100_000) {
    // Add commas (e.g. 5,000)
    return num.toLocaleString()
  } else if (num < 1_000_000) {
    // Thousands (K)
    return (num / 1_000).toFixed(num % 1_000 === 0 ? 0 : 1) + 'K'
  } else if (num < 1_000_000_000) {
    // Millions (M)
    return (num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1) + 'M'
  } else {
    // Billions (B)
    return (
      (num / 1_000_000_000).toFixed(num % 1_000_000_000 === 0 ? 0 : 1) + 'B'
    )
  }
}

export const formatCount = (num: number): string => {
  if (!num) {
    return '0'
  }
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B'
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M'
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K'
  return num.toString()
}

export const formatDate = (dateInput: Date | string): string => {
  const date = new Date(dateInput)

  // Months array
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]

  // Get the day, month, and year
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()

  // Determine the day suffix
  const getDaySuffix = (day: number): string => {
    if (day % 10 === 1 && day !== 11) return 'st'
    if (day % 10 === 2 && day !== 12) return 'nd'
    if (day % 10 === 3 && day !== 13) return 'rd'
    return 'th'
  }

  // Format the date
  return `${month} ${day}${getDaySuffix(day)}, ${year}`
}

export const formatDateToDDMMYY = (
  dateInput: Date | null | number | string
): string => {
  if (dateInput) {
    const date = new Date(dateInput)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = String(date.getFullYear()).slice(-2)
    return `${day}/${month}/${year}`
  } else {
    return `Incorrect Date`
  }
}

export const formatRelativeDate = (dateInput: Date | string): string => {
  const now = new Date()
  const date = new Date(dateInput)

  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 0) {
    return 'now'
  }

  const minute = 60
  const hour = 3600
  const day = 86400
  const week = 604800
  const month = 2592000 // ~30 days
  const year = 31536000 // 365 days

  if (diffInSeconds < minute) {
    return 'now'
  } else if (diffInSeconds < hour) {
    const minutes = Math.floor(diffInSeconds / minute)
    return `${minutes} min${minutes !== 1 ? 's' : ''}`
  } else if (diffInSeconds < day) {
    const hours = Math.floor(diffInSeconds / hour)
    return `${hours} hr${hours !== 1 ? 's' : ''}`
  } else if (diffInSeconds < week) {
    const days = Math.floor(diffInSeconds / day)
    return `${days} day${days !== 1 ? 's' : ''}`
  } else if (diffInSeconds < month) {
    const weeks = Math.floor(diffInSeconds / week)
    return `${weeks} wk${weeks !== 1 ? 's' : ''}`
  } else if (diffInSeconds < year) {
    const months = Math.floor(diffInSeconds / month)
    return `${months} mo${months !== 1 ? 's' : ''}`
  } else {
    const years = Math.floor(diffInSeconds / year)
    return `${years} yr${years !== 1 ? 's' : ''}`
  }
}

export const formatTimeTo12Hour = (dateInput: Date | null | number): string => {
  if (dateInput) {
    const date = new Date(dateInput)
    let hours = date.getHours()
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12 || 12
    return `${hours}:${minutes} ${ampm}`
  } else {
    return `Incorrect Date`
  }
}

export const getExtension = (type: string): string => {
  const extension = type.substring(type.lastIndexOf('.')).toLowerCase()

  if (extension.includes('doc')) {
    return '/files/doc.png'
  } else if (extension.includes('csv')) {
    return '/files/csv.png'
  } else if (extension.includes('ppt')) {
    return '/files/ppt.png'
  } else if (extension.includes('xls')) {
    return '/files/xls.png'
  } else if (extension.includes('pdf')) {
    return '/files/pdf.png'
  } else {
    return '/files/file.png'
  }
}

export const getFileType = (file: File): string => {
  const fileName = file.name || ''
  const ext = fileName.includes('.')
    ? fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase()
    : ''

  const mimeTypes: { [key: string]: string } = {
    // Images
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    avif: 'image/avif',
    bmp: 'image/bmp',
    svg: 'image/svg+xml',

    // Videos
    mp4: 'video/mp4',
    webm: 'video/webm',
    ogg: 'video/ogg',
    avi: 'video/x-msvideo',
    mpeg: 'video/mpeg',
    mov: 'video/quicktime',

    // Audio
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    aac: 'audio/aac',
    oga: 'audio/ogg',

    // Documents
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    csv: 'text/csv',
    zip: 'application/zip',
    rar: 'application/vnd.rar',
    txt: 'text/plain',
  }

  return mimeTypes[ext] || file.type || 'application/octet-stream'
}

export const handleFileUpload = async (
  event: React.ChangeEvent<HTMLInputElement>,
  baseURL: string,
  setFiles: React.Dispatch<
    React.SetStateAction<
      {
        type: string
        name: string
        duration: number
        pages: number
        size: number
        source: string
      }[]
    >
  >,
  setPercents: React.Dispatch<React.SetStateAction<number[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  filePages: number,
  duration: number
) => {
  if (event.target.files) {
    const files = event.target.files
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileName = files[i].name
      const fileSize = files[i].size
      const type = getFileType(file)

      try {
        setLoading(true)
        const { data } = await axios.post(`${baseURL}s3-presigned-url`, {
          fileName: file.name,
          fileType: file.type,
        })

        const { uploadUrl } = data

        setFiles((prevs) => {
          const updated = [...prevs]
          updated[i] = {
            type,
            name: fileName,
            duration: duration,
            pages: filePages,
            size: fileSize,
            source: '',
          }
          return updated
        })

        await axios.put(uploadUrl, file, {
          headers: { 'Content-Type': file.type },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round(
                (progressEvent.loaded / progressEvent.total) * 100
              )
              setPercents((prev) => {
                const updated = [...prev]
                updated[i] = percent
                return updated
              })
            }
          },
        })

        const cleanUrl = uploadUrl.split('?')[0]

        setFiles((prevs) => {
          const updated = [...prevs]
          updated[i] = {
            type,
            name: fileName,
            size: fileSize,
            duration: duration,
            pages: filePages,
            source: cleanUrl,
          }
          return updated
        })

        setLoading(false)
      } catch (error) {
        console.error('❌ Upload failed:', error)
        setLoading(false)
      }
    }
  }
}

export const handleRemoveFile = async (
  index: number,
  source: string,
  baseURL: string,
  setFiles: React.Dispatch<
    React.SetStateAction<
      {
        type: string
        name: string
        duration: number
        pages: number
        size: number
        source: string
      }[]
    >
  >
) => {
  try {
    const fileKey = source.split('.com/')[1]
    await axios.post(`${baseURL}s3-delete-file`, { fileKey })
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
  } catch (error) {
    console.error('Failed to delete file from S3:', error)
  }
}

export const truncateString = (
  input: string,
  maxLength: number = 50
): string => {
  if (input.length > maxLength) {
    return input.slice(0, maxLength) + '...'
  }
  return input
}

export const truncateStringNormal = (
  input: string,
  maxLength: number
): string => {
  if (input.length > maxLength) {
    return input.substring(0, maxLength)
  }
  return input
}

interface Input {
  name: string
  value: string | number | boolean | File | null | Date
}

type CountdownState = {
  countdown: string
  isExpired: boolean
}

export const validateUsername = (username: string) => {
  const regex = /^[\w!@#$%^&*()_+={}\[\]:;"'<>,.?/|\\~`]{2,}$/
  if (regex.test(username)) {
    return { valid: true, message: 'Valid username' }
  } else {
    return {
      valid: false,
      message:
        'Invalid username. It should contain at least 2 alphanumeric characters, underscore or special symbols without spaces or hyphens.',
    }
  }
}
