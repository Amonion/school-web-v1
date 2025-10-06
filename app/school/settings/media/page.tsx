'use client'
import Image from 'next/image'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { useState, useEffect, useRef } from 'react'
import { useTheme } from '@/context/ThemeProvider'
import { useRouter } from 'next/navigation'
import SchoolStore from '@/src/zustand/school/School'
import { MessageStore } from '@/src/zustand/notification/Message'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { CameraIcon } from 'lucide-react'
import PictureDisplay from '@/components/Home/Media/PictureDisplay'

const CreateSchool: React.FC = () => {
  const url = '/schools/'
  const { schoolData, setForm, getSchool, loading, updateItem } = SchoolStore()
  const { setMessage } = MessageStore()
  const { bioUserState, bioUser } = AuthStore()
  const [isCompleted, setIsCompleted] = useState(false)
  const { theme } = useTheme()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const profileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleProfileUploadClick = () => {
    profileInputRef.current?.click()
  }

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const mediaUrl = URL.createObjectURL(file)
      setIsCompleted(true)
      setForm('mediaPreview', mediaUrl)
      setForm('media', file)
    } else {
      setIsCompleted(false)
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const logoUrl = URL.createObjectURL(file)
      setIsCompleted(true)
      setForm('logoPreview', logoUrl)
      setForm('logo', file)
    } else {
      setIsCompleted(false)
    }
  }

  useEffect(() => {
    if (bioUserState && bioUserState.activeOffice !== null) {
      if (schoolData.username !== bioUserState.activeOffice.username) {
        getSchool(`${url}${bioUserState.activeOffice.username}`)
      }
    } else {
      router.push('/utils')
    }
  }, [])

  useEffect(() => {
    if (
      schoolData.name &&
      schoolData.username &&
      schoolData.levels &&
      schoolData.country &&
      schoolData.state &&
      schoolData.area &&
      schoolData.idCard &&
      schoolData.document
    ) {
      setIsCompleted(true)
    } else {
      setIsCompleted(false)
    }
  }, [schoolData])

  const handleSubmit = async () => {
    const inputsToValidate = [
      {
        name: 'officeId',
        value: schoolData.officeId,
        rules: { blank: true, maxLength: 100 },
        field: 'Office Id',
      },
      {
        name: 'description',
        value: schoolData.description,
        rules: { blank: true, minLength: 20, maxLength: 100 },
        field: 'School Description',
      },
      {
        name: 'media',
        value: schoolData.media,
        rules: { blank: true, maxLength: 100 },
        field: 'Media Picture',
      },
      {
        name: 'logo',
        value: schoolData.logo,
        rules: { blank: true, maxLength: 100 },
        field: 'Logo Picture',
      },
      {
        name: 'bioUserId',
        value: String(bioUser?._id),
        rules: { blank: true, maxLength: 100 },
        field: 'User ',
      },
      {
        name: 'bioUserUsername',
        value: String(bioUser?.bioUserUsername),
        rules: { blank: true, maxLength: 100 },
        field: 'Username',
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
    updateItem(`${url}${schoolData._id}`, data, setMessage)
  }

  return (
    <>
      <div className="card_body sharp mb-auto min-h-[75vh] flex flex-1 flex-col">
        <div className="w-full text-[var(--text-secondary)] text-xl sm:text-2xl mb-4 flex justify-center text-center ">
          School Media Settings
        </div>

        <div className="flex flex-col w-full max-w-[600px] mx-auto">
          <div className="relative w-full sm:h-64 h-[170px] xs:h-[200px] rounded-xl bg-[var(--secondary)] overflow-hidden mb-5 ">
            {schoolData.mediaPreview ? (
              <Image
                src={schoolData.mediaPreview}
                alt="Profile Background"
                fill
                className="object-cover"
                priority
              />
            ) : schoolData.media ? (
              <PictureDisplay source={String(schoolData.media)} />
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
              onChange={handleMediaChange}
            />
          </div>

          <div className="w-full relative h-[150px] mb-5 flex items-center justify-center flex-col">
            <button className="mx-auto mb-2  max-w-24 min-h-24 overflow-hidden rounded-full flex items-center justify-center border border-[var(--border)]">
              {schoolData.logoPreview ? (
                <Image
                  src={schoolData.logoPreview}
                  alt="Profile Background"
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                schoolData.logo && (
                  <PictureDisplay source={String(schoolData.logo)} />
                )
              )}
            </button>
            <div onClick={handleProfileUploadClick} className="text-center btn">
              Upload School Logo
            </div>
            <input
              type="file"
              accept="image/*"
              ref={profileInputRef}
              className="hidden"
              onChange={handleLogoChange}
            />
          </div>

          <div className="mb-5">
            <div className="form-input mb-5">{schoolData.username}</div>
          </div>
          <div className="mb-5">
            <div className="form-input mb-5">{schoolData.name}</div>
          </div>
          <textarea
            value={schoolData.description}
            onChange={(e) => setForm('description', e.target.value)}
            name=""
            placeholder="Write school description, like motto"
            className="form-input max-h-[150px]"
          ></textarea>
        </div>

        <div className="justify-center mt-5 flex flex-wrap">
          {loading ? (
            <button className="custom_btn neutral">
              <i className="bi bi-opencollective loading"></i>
              Processing...
            </button>
          ) : (
            <>
              <button
                className={`custom_btn neutral ${
                  isCompleted ? '' : 'disabled'
                }`}
                onClick={() => {
                  if (isCompleted) {
                    handleSubmit()
                  }
                }}
              >
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default CreateSchool
