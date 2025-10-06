'use client'
import Link from 'next/link'
import {
  appendForm,
  createUsernameSearchHandler,
  getFileType,
  removeFileFromS3,
  uploadFile,
} from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { useEffect, useState } from 'react'

import AdCard from '@/components/Utility/Ad/AdCard'
import UserQuillEditor from '@/components/Utility/Editor/UserQuillEditor'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Spinner from '@/components/LoadingAnimations/Spinner'
import AdHeader from '@/components/Utility/Ad/AdHeader'
import AdStore from '@/src/zustand/finance/Ad'
import { Post, PostEmpty } from '@/src/zustand/post/Post'
import { MessageStore } from '@/src/zustand/notification/Message'
import { AuthStore } from '@/src/zustand/user/AuthStore'

type file = {
  type: string
  source: string
  preview: string
  width: number
  height: number
}

const CreateUserAd: React.FC = () => {
  const url = '/ads'
  const { itemFormData, setItemForm, postItem, loadingAds } = AdStore()
  const [isLoading, setIsLoading] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isChanged, setIsChanged] = useState(false)
  const [adPost, setAdPost] = useState<Post>(PostEmpty)
  const [files, setFiles] = useState<file[]>([])
  const [loading, setLoading] = useState(false)
  const [percents, setPercents] = useState<number[]>([])
  const [text, setText] = useState('')
  const { setMessage, baseURL } = MessageStore()
  const router = useRouter()
  const { user } = AuthStore()

  const MAX_FILE_SIZE_MB = 10

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setItemForm(name as keyof typeof itemFormData, value)
    if (name.trim().length > 3) {
      setIsChanged(true)
    } else {
      setIsChanged(false)
    }
  }

  const handleUsernameSearch = createUsernameSearchHandler({
    setMessage,
    setIsLoading,
  })

  const searchUsername = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const url = `/users/username/${value}`
    const result = await handleUsernameSearch(value, url)
    if (!result) {
      setItemForm('username', value.trim())
      setIsChanged(true)
    } else {
      setItemForm('username', '')
      setIsChanged(false)
    }
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      if (file) {
        setItemForm('picture', file)
        setIsChanged(true)
      }
      const imageUrl = URL.createObjectURL(file)
      setAdPost((prev) => ({
        ...prev,
        picture: imageUrl,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    if (!user) return
    const inputsToValidate = [
      {
        name: 'picture',
        value: itemFormData.picture,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Picture',
      },
      {
        name: 'displayName',
        value: itemFormData.displayName,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Ad Display name',
      },
      {
        name: 'media',
        value: JSON.stringify(files),
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: 'Media',
      },
      {
        name: 'user',
        value: user.username,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: 'User',
      },
      {
        name: 'isEditing',
        value: true,
        rules: { blank: true, maxLength: 1000 },
        field: 'User',
      },
      {
        name: 'email',
        value: user.email,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: 'Email',
      },
      {
        name: 'userId',
        value: user._id,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: 'User ID',
      },
      {
        name: 'username',
        value: itemFormData.username,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: 'Ad username',
      },
      {
        name: 'description',
        value: itemFormData.description.replace(/<[^>]*>/g, '')
          ? itemFormData.description
          : null,
        rules: { blank: false, maxLength: 1000 },
        field: 'Description',
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

    e.preventDefault()
    const data = appendForm(inputsToValidate)
    postItem(`${url}`, data, setMessage, () =>
      router.push(`/utils/ads/create-ad-target`)
    )
  }

  const handleRemoveFile = (index: number, source: string) => {
    return removeFileFromS3(index, source, baseURL, setFiles)
  }

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files) {
      const files = event.target.files
      const filesArray = Array.from(files)

      const hasVideo = filesArray.some((file) => file.type.startsWith('video/'))
      if (hasVideo && filesArray.length > 1) {
        setMessage('You can only upload one video at a time.', false)
        return
      }
      for (let i = 0; i < files.length; i++) {
        const el = files[i]
        const type = getFileType(el)

        const tooLarge = filesArray.find(
          (file) => file.size > MAX_FILE_SIZE_MB * 1024 * 1024
        )
        if (tooLarge) {
          setMessage(
            `"${tooLarge.name}" is larger than ${MAX_FILE_SIZE_MB}MB. Please select smaller files.`,
            false
          )
          return
        }

        await uploadFile(
          el,
          i,
          type,
          baseURL,
          setFiles,
          setPercents,
          setLoading
        )
      }
    }
  }

  useEffect(() => {
    if (
      (files.length > 0 || itemFormData._id) &&
      itemFormData.username &&
      itemFormData.displayName &&
      itemFormData.picture
    ) {
      setIsCompleted(true)
    } else {
      setIsCompleted(false)
    }
  }, [files.length, itemFormData])

  useEffect(() => {
    if (files.length > 0) {
      setAdPost((prev) => ({
        ...prev,
        media: files,
      }))
      setIsChanged(true)
    } else {
      setIsChanged(false)
    }
  }, [files.length])

  useEffect(() => {
    if (itemFormData._id) {
      setAdPost((prev) => ({
        ...prev,
        media: itemFormData.media,
      }))
    }
  }, [itemFormData._id])

  return (
    <>
      <div className="mb-5">
        {/* <div className="flex flex-col items-end mb-3">
          <div className="flex text-lg sm:text-xl">
            {' '}
            <span className="text-[var(--custom)] mr-2">1/4</span>{' '}
            {`Create Ads`}
          </div>
          <div className="grid grid-cols-4 w-full gap-2">
            <div className="h-[2px] rounded-[5px] bg-[var(--custom)]"></div>
            <div className="h-[2px] rounded-[5px] bg-[var(--custom)]"></div>
            <div className="h-[2px] rounded-[5px] bg-[var(--custom)]"></div>
            <div className="h-[2px] rounded-[5px] bg-[var(--custom)]"></div>
          </div>
        </div> */}

        <AdHeader page={1} title="Create Ad" />
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="flex card_body overflow-auto w-full sm:w-auto flex-col items-center">
            <AdCard
              post={{
                ...adPost,
                picture:
                  itemFormData.picture === ''
                    ? '/images/active-icon.png'
                    : adPost.picture
                    ? adPost.picture
                    : String(itemFormData.picture),
                displayName:
                  itemFormData.displayName === ''
                    ? 'Your Business Ad Name'
                    : itemFormData.displayName,
                username:
                  itemFormData.username === ''
                    ? 'Your_Business_Ad_Username'
                    : itemFormData.username,
                content:
                  itemFormData.description &&
                  itemFormData.description.replace(/<[^>]*>/g, '')
                    ? itemFormData.description
                    : '',
              }}
            />

            <div className="flex flex-col my-5 items-center">
              {isLoading || loading ? (
                <Spinner size={50} />
              ) : (
                <label
                  htmlFor="avatar-upload"
                  className="relative group cursor-pointer"
                >
                  <div className="w-16 h-16 justify-center items-center flex rounded-full border-2 border-[var(--border)] overflow-hidden">
                    <i className="bi bi-cloud-upload text-2xl text-[var(--custom)]"></i>
                  </div>
                </label>
              )}
              <div className="text-center w-full mt-2">
                Upload Ad Profile Picture
              </div>
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                name="picture"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {files.map((file, index) => (
                <div key={index} className="w-20">
                  <div className="relative w-20 h-20 overflow-hidden rounded-[5px] mb-[-10px]">
                    <button
                      onClick={() => handleRemoveFile(index, file.source)}
                      className="absolute top-1 right-1 z-20 bg-[var(--white-gray)] text-white rounded-full p-1 w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ✕
                    </button>

                    {file.type.includes('image') ? (
                      file.source ? (
                        <Image
                          src={file.source}
                          alt="Media"
                          width={0}
                          sizes="100vw"
                          height={0}
                          style={{ width: '100%', height: '100%' }}
                          objectFit="cover"
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-700 flex justify-center items-center">
                          <i className="bi bi-image text-xl text-[var(--custom-color)]"></i>
                        </div>
                      )
                    ) : file.type.includes('video') ? (
                      <div className="flex items-center justify-center w-full h-full">
                        <Image
                          src={file.preview}
                          alt="Media"
                          width={0}
                          sizes="100vw"
                          height={0}
                          style={{ width: '100%', height: '100%' }}
                          objectFit="cover"
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-gray-700">
                        <i className="bi bi-play-circle text-xl text-[var(--custom-color)]"></i>
                      </div>
                    )}
                  </div>
                  {percents.length > 0 && (
                    <progress
                      value={percents[index]}
                      max="100"
                      className="w-full rounded-[3px] h-[3px] overflow-hidden"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="card_body w-full sm:w-auto">
            <div className="grid grid-lay">
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Business Name
                </label>
                <input
                  className="form-input"
                  name="displayName"
                  value={itemFormData.displayName}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="Enter ad business name"
                />
              </div>

              <div className="flex flex-col relative">
                <label className="label" htmlFor="">
                  Business Username
                </label>
                <div className="relative">
                  <input
                    className="form-input"
                    name="name"
                    onChange={searchUsername}
                    type="text"
                    placeholder="Enter business username"
                  />
                  {isLoading && (
                    <i className="bi bi-opencollective absolute top-1 right-1 loading text-[var(--custom-color)]"></i>
                  )}
                </div>
              </div>
            </div>

            <UserQuillEditor
              contentValue={text}
              onChange={(text) => {
                setItemForm('description', text)
                setText(text)
              }}
            />

            <div className="flex flex-col items-center">
              <label
                htmlFor="media"
                className={`${
                  isLoading || loading ? 'disabled' : ''
                } custom_btn`}
              >
                {!loading && !isLoading && (
                  <input
                    className="input-file"
                    type="file"
                    id="media"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFileUpload}
                  />
                )}
                {loading || isLoading ? (
                  <span className="mr-2">
                    <Spinner size={30} />
                  </span>
                ) : (
                  <i className="bi bi-cloud-arrow-up text-2xl mr-2"></i>
                )}
                Upload Ad Media
              </label>
              <div className="text-center text-sm text-[var(--custom)] mt-2">
                Each media files should not be more than 10mb and you can upload
                up to 3 media.
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="card_body mt-auto flex justify-end">
        {loading || loadingAds ? (
          <div className={`custom_btn neutral disabled`}>Processing</div>
        ) : isCompleted && !isChanged ? (
          <Link
            href={'/utils/ads/create-ad-target'}
            className={`custom_btn neutral`}
          >
            Next
          </Link>
        ) : isCompleted && isChanged ? (
          <div onClick={handleSubmit} className={`custom_btn neutral`}>
            Save & Proceed
          </div>
        ) : (
          <div className={`custom_btn neutral disabled`}>Save & Proceed</div>
        )}
      </div>
    </>
  )
}

export default CreateUserAd
