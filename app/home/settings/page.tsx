'use client'
import { useEffect, useState } from 'react'
import { validateInputs } from '@/lib/validation'
import { appendForm } from '@/lib/helpers'
import Image from 'next/image'
import { useRef } from 'react'
import { CameraIcon } from 'lucide-react'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { MessageStore } from '@/src/zustand/notification/Message'
import { useTheme } from '@/context/ThemeProvider'
import BioEditor from '@/components/Home/BioEditor'
import { UserStore } from '@/src/zustand/user/User'

export default function SetSocial() {
  // const [loading, setLoading] = useState(false);
  const [canSend, setCanSend] = useState(false)
  const [media, setMedia] = useState<File | string | null>(null)
  const [picture, setPicture] = useState<File | string | null>(null)
  const { user } = AuthStore()
  const { setMessage } = MessageStore()
  const url = '/users'
  const { theme } = useTheme()
  const [text, setText] = useState('')
  const { updateMyUser, loading } = UserStore()

  const [displayName, setDisplayName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const profileInputRef = useRef<HTMLInputElement>(null)
  const [previewProfileUrl, setPreviewProfileUrl] = useState<string | null>(
    null
  )

  useEffect(() => {
    if (user) {
      setPreviewProfileUrl(String(user.picture))
      setPreviewUrl(String(user.media))
      setIntro(user.intro)
      setDisplayName(user.displayName)
      setCanSend(false)
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    const inputsToValidate = [
      {
        name: 'ID',
        value: String(user?._id),
        rules: { blank: true, maxLength: 100 },
        field: 'User Id',
      },
      {
        name: 'intro',
        value: text,
        rules: { blank: false, maxLength: 120 },
        field: 'Intro',
      },
      {
        name: 'action',
        value: 'Profile',
        rules: { blank: false, maxLength: 120 },
        field: 'Profile',
      },
      {
        name: 'displayName',
        value: displayName,
        rules: { blank: false, maxLength: 60 },
        field: 'Display name',
      },
      {
        name: 'media',
        value: media,
        rules: { blank: false, maxSize: 10 },
        field: 'Media',
      },
      {
        name: 'picture',
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
    e.preventDefault()
    const data = appendForm(inputsToValidate)
    try {
      updateMyUser(`${url}/${user?.username}`, data, setMessage)
    } catch (error) {
      console.log(error)
    }
  }

  const setIntro = (content: string) => {
    setText(content)
    if (content.length > 0) {
      setCanSend(true)
    } else {
      setCanSend(false)
    }
  }

  const setName = (content: string) => {
    setDisplayName(content)
    if (content.length > 0) {
      setCanSend(true)
    } else {
      setCanSend(false)
    }
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
      setCanSend(true)
      setMedia(file)
    } else {
      setCanSend(false)
    }
  }

  const handleProfileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const localUrl = URL.createObjectURL(file)
      setPreviewProfileUrl(localUrl)
      setCanSend(true)
      setPicture(file)
    } else {
      setCanSend(false)
    }
  }

  return (
    <>
      <div className="relative w-full sm:h-64 h-[170px] xs:h-[200px] rounded-xl bg-[var(--secondary)] overflow-hidden mb-5 ">
        <div className=" flex absolute z-10 w-full h-full items-start justify-start p-3 bg-black/10"></div>

        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Profile Background"
            fill
            className="object-cover"
            priority
          />
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

      <div className="w-full relative h-[150px] mb-3 flex items-center justify-center flex-col">
        <button
          onClick={handleProfileUploadClick}
          className="inset-0 mx-auto mb-2  w-24 h-24 overflow-hidden bg-[var(--primary)] hover:text-white hover:bg-[var(--custom)] rounded-full flex items-center justify-center backdrop-blur-sm border border-[var(--border)] transition"
        >
          {previewProfileUrl && (
            <Image
              src={previewProfileUrl}
              alt="Profile Background"
              fill
              className="object-cover"
              priority
            />
          )}
          <CameraIcon className="w-6 h-6" />
        </button>
        <div className="text-center">Upload Profile Photo</div>
        <input
          type="file"
          accept="image/*"
          ref={profileInputRef}
          className="hidden"
          onChange={handleProfileFileChange}
        />
      </div>

      <div className="mb-3">
        {' '}
        <div className="form-input mb-3">{user?.username}</div>
      </div>
      <div className="mb-3">
        <input
          className="form-input"
          name="displayName"
          value={displayName}
          onChange={(e) => setName(e.target.value)}
          type="text"
          placeholder="Write you display name"
        />
      </div>

      <BioEditor value={text} onChange={(content) => setIntro(content)} />

      {loading ? (
        <div className="btn">
          <i className="bi bi-opencollective loading  text-md"></i>
          <div>Processing...</div>
        </div>
      ) : (
        <>
          {canSend && (
            <div onClick={handleSubmit} className="btn mb-5">
              Save Changes
            </div>
          )}
        </>
      )}
    </>
  )
}
