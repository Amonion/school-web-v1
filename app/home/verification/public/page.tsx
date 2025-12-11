'use client'
import { useEffect, useState } from 'react'
import { validateInputs } from '@/lib/validation'
import { appendForm, FetchResponse, validateUsername } from '@/lib/helpers'
import Image from 'next/image'
import { useRef } from 'react'
import { CameraIcon } from 'lucide-react'
import _debounce from 'lodash/debounce'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import { useTheme } from '@/context/ThemeProvider'
import { BioUserStore } from '@/src/zustand/user/BioUser'
import PictureDisplay from '@/components/Home/Media/PictureDisplay'
import BioEditor from '@/components/Home/BioEditor'
import apiRequest from '@/lib/axios'
import { useRouter } from 'next/navigation'
import CustomBtn from '@/components/CustomBtn'

export default function SetSocial() {
  const [media, setMedia] = useState<File | string | null>(null)
  const [picture, setPicture] = useState<File | string | null>(null)
  const { bioUser } = AuthStore()
  const { setMessage } = MessageStore()
  const url = '/biousers/'
  const { theme } = useTheme()
  const [text, setText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { updateMyBioUser, setForm, loading, bioUserForm } = BioUserStore()
  const { setAlert } = AlartStore()
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  )
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const profileInputRef = useRef<HTMLInputElement>(null)
  const [previewProfileUrl, setPreviewProfileUrl] = useState<string | null>(
    null
  )
  const router = useRouter()

  useEffect(() => {
    if (!navigator.geolocation) {
      setMessage(
        'Sorry, geolocation is not supported by your browser. Try another browser or device.',
        false
      )
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setLocation({ lat: latitude, lng: longitude })
      },
      (err) => {
        console.error('Geolocation error:', err)

        switch (err.code) {
          case err.PERMISSION_DENIED:
            setMessage('User denied the request for Geolocation.', false)
            break
          case err.POSITION_UNAVAILABLE:
            setMessage('Location information is unavailable.', false)
            break
          case err.TIMEOUT:
            setMessage('The request to get user location timed out.', false)
            break
          default:
            setMessage('An unknown error occurred.', false)
            break
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 20000, // increase timeout to 20s
        maximumAge: 0,
      }
    )
  }, [])

  useEffect(() => {
    if (bioUser) {
      setIntro(String(bioUser.bioUserIntro))
      setForm('bioUserUsername', bioUser.bioUserUsername)
    }
  }, [bioUser])

  const handleSubmit = async () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setLocation({ lat: latitude, lng: longitude })
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setMessage('User denied the request for Geolocation.', false)
            break
          case err.POSITION_UNAVAILABLE:
            setMessage('Location information is unavailable.', false)
            break
          case err.TIMEOUT:
            setMessage('The request to get user location timed out.', false)
            break
          default:
            setMessage('An unknown error occurred.', false)
            break
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 20000, // increase timeout to 20s
        maximumAge: 0,
      }
    )
    if (!location) {
      setMessage(
        'Please turn on your location to continue your verification.',
        false
      )
      return
    }

    const inputsToValidate = [
      {
        name: 'bioUserIntro',
        value: text,
        rules: { blank: false, maxLength: 120 },
        field: 'Intro',
      },
      {
        name: 'location',
        value: JSON.stringify(location),
        rules: { blank: true },
        field: 'Please set your location',
      },
      {
        name: 'action',
        value: 'Public',
        rules: { blank: false, maxLength: 120 },
        field: 'Public',
      },
      {
        name: 'isPublic',
        value: true,
        rules: { blank: false, maxLength: 120 },
        field: 'Public',
      },
      {
        name: 'isChanged',
        value: true,
        rules: { blank: false, maxLength: 120 },
        field: 'Public',
      },
      {
        name: 'bioUserUsername',
        value: bioUserForm.bioUserUsername,
        rules: { blank: true, minLength: 3, maxLength: 60 },
        field: 'Username',
      },
      {
        name: 'bioUserMedia',
        value: media,
        rules: { blank: false, maxSize: 10 },
        field: 'Media',
      },
      {
        name: 'bioUserPicture',
        value: picture,
        rules: { blank: false, maxSize: 10 },
        field: 'Display picture',
      },
    ]

    const { messages } = validateInputs(inputsToValidate)
    const getFirstNonEmptyMessage = (
      messages: Record<string, string>
    ): string | null => {
      for (const key in messages) {
        if (messages[key].trim() !== '') {
          return messages[key]
        }
      }
      return null
    }

    const firstNonEmptyMessage = getFirstNonEmptyMessage(messages)
    if (firstNonEmptyMessage) {
      setMessage(firstNonEmptyMessage, false)
      return
    }
    const data = appendForm(inputsToValidate)

    setAlert(
      'Warning',
      'You cannot change the username after your account has been after submission and verification!',
      true,
      () => submitData(data)
    )
  }

  const handleUsernameSearch = _debounce(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.trim()
      const usernameRegex = /^[a-zA-Z0-9._]+$/
      if (!usernameRegex.test(value)) {
        setMessage(
          'Username can only contain letters, numbers, underscores, and dots.',
          false
        )
        setIsLoading(false)
        return
      }
      const validation = validateUsername(value)
      if (!validation.valid) {
        setMessage(validation.message, false)
        setIsLoading(false)
        return
      }
      setIsLoading(true)

      const response = await apiRequest<FetchResponse>(
        `/users/username/${value}`
      )

      const results = response?.data
      if (results) {
        setIsLoading(false)
        setMessage('Sorry! This username is already taken', false)
        setForm('bioUserUsername', '')
      } else {
        setIsLoading(false)
        setMessage('Great! The username is available', true)
        setForm('bioUserUsername', value)
      }
    },
    1000
  )

  const submitData = async (data: FormData) => {
    updateMyBioUser(`${url}${bioUser?._id}`, data, setMessage, () =>
      router.replace(`/home/verification/education`)
    )
  }

  const setIntro = (content: string) => {
    setText(content)
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleProfileUploadClick = () => {
    profileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const localUrl = URL.createObjectURL(file)
      setPreviewUrl(localUrl)
      setMedia(file)
    }
  }

  const handleProfileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const localUrl = URL.createObjectURL(file)
      setPreviewProfileUrl(localUrl)
      setPicture(file)
    }
  }

  return (
    <>
      <div className="relative mt-10 w-full sm:h-64 h-[170px] xs:h-[200px] rounded-xl bg-[var(--secondary)] overflow-hidden mb-5 ">
        {/* <div className=" flex absolute z-10 w-full h-full items-start justify-start p-3 bg-black/10"></div> */}

        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Profile Background"
            fill
            className="object-cover"
            priority
          />
        ) : bioUser?.bioUserMedia ? (
          <PictureDisplay source={String(bioUser.bioUserMedia)} />
        ) : (
          <Image
            src={
              theme === 'dark'
                ? '/images/DLogoback.png'
                : '/images/Logoback.png'
            }
            alt="Profile Background"
            fill
            className="object-cover"
            priority
          />
        )}

        {/* Circular Upload Button */}
        <button
          onClick={handleUploadClick}
          className="absolute inset-0 m-auto z-20 mb-5 sm:w-16 sm:h-16 w-12 h-12 bg-[var(--primary)] hover:text-white hover:bg-[var(--custom)] rounded-full flex items-center justify-center backdrop-blur-sm border border-[var(--border)] transition"
        >
          <CameraIcon className="w-6 h-6" />
        </button>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <div className="w-full relative h-[150px] mb-5 flex items-center justify-center flex-col">
        <button
          onClick={handleProfileUploadClick}
          className="inset-0 mx-auto mb-2  w-24 h-24 overflow-hidden bg-[var(--primary)] hover:text-white hover:bg-[var(--custom)] rounded-full flex items-center justify-center backdrop-blur-sm border border-[var(--border)] transition"
        >
          {previewProfileUrl ? (
            <Image
              src={previewProfileUrl}
              alt="Profile Background"
              fill
              className="object-cover"
              priority
            />
          ) : (
            bioUser?.bioUserPicture && (
              <PictureDisplay source={String(bioUser.bioUserPicture)} />
            )
          )}
          <CameraIcon className="w-6 h-6" />
        </button>
        <div className="text-center">Upload Public Photo</div>
        <input
          type="file"
          accept="image/*"
          ref={profileInputRef}
          className="hidden"
          onChange={handleProfileFileChange}
        />
      </div>

      {!bioUser?.isVerified ? (
        <div className="relative mb-5">
          <input
            className="form-input"
            name="username"
            onChange={handleUsernameSearch}
            type="text"
            placeholder={`${
              bioUser?.bioUserUsername
                ? bioUser.bioUserUsername
                : 'Enter your username'
            }`}
          />
          {isLoading && (
            <i className="bi bi-opencollective absolute top-1 right-1 loading text-[var(--custom-color)]"></i>
          )}
        </div>
      ) : (
        <div className="mb-5">
          <div className="form-input mb-5">{bioUser.bioUserUsername}</div>
        </div>
      )}

      <div className="mb-5">
        <div className="form-input mb-5">{bioUser?.bioUserDisplayName}</div>
      </div>

      <BioEditor value={text} onChange={(content) => setIntro(content)} />

      <CustomBtn
        label="Save Changes"
        loading={loading}
        onClick={handleSubmit}
      />
    </>
  )
}
