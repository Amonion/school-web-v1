'use client'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SchoolStore from '@/src/zustand/school/School'
import { MessageStore } from '@/src/zustand/notification/Message'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { Check, Copy } from 'lucide-react'

const CreateSchool: React.FC = () => {
  const url = '/schools/'
  const { schoolData, getSchool, loading, updateItem } = SchoolStore()
  const { setMessage } = MessageStore()
  const { bioUserState, bioUser } = AuthStore()
  const [domain, setDomain] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [copied1, setCopied1] = useState(false)
  const router = useRouter()
  const studentLink = `https://${domain}/home/school/${schoolData.username}/?user=student`
  const staffLink = `https://${domain}/home/school/${schoolData.username}/?user=staff`

  useEffect(() => {
    if (bioUserState && bioUserState.activeOffice !== null) {
      if (schoolData.username !== bioUserState.activeOffice.username) {
        getSchool(`${url}${bioUserState.activeOffice.username}`)
      }
    } else {
      router.push('/utils')
    }
    if (typeof window !== 'undefined') {
      setDomain(window.location.hostname)
    }
  }, [])

  const handleCopy = async (type: string) => {
    try {
      await navigator.clipboard.writeText(
        type === 'student' ? studentLink : staffLink
      )
      if (type === 'student') {
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      } else {
        setCopied1(true)
        setTimeout(() => setCopied1(false), 1500)
      }
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleRegistration = (type: string) => {
    SchoolStore.setState((prev) => {
      return {
        schoolData: {
          ...prev.schoolData,
          staffRegistration:
            type === 'staff'
              ? !prev.schoolData.staffRegistration
              : prev.schoolData.staffRegistration,
          studentRegistration:
            type === 'student'
              ? !prev.schoolData.studentRegistration
              : prev.schoolData.studentRegistration,
        },
      }
    })
    if (type) {
    }
  }

  const handleSubmit = async () => {
    const inputsToValidate = [
      {
        name: 'name',
        value: schoolData.name,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'School field',
      },
      {
        name: 'staffRegistration',
        value: schoolData.staffRegistration,
        rules: { blank: false, maxLength: 100 },
        field: 'Staff registration',
      },
      {
        name: 'studentRegistration',
        value: schoolData.studentRegistration,
        rules: { blank: false, maxLength: 100 },
        field: 'Student registration',
      },
      {
        name: 'bioUserId',
        value: String(bioUser?._id),
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Bio user id',
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
          School Basic Settings
        </div>
        <div className="grid md:grid-cols-2 gap-4 mb-10 w-full">
          <div className="relative">
            <label htmlFor="">Continent</label>
            <div className="form-input">{schoolData.continent}</div>
          </div>
          <div className="relative">
            <label htmlFor="">Country</label>
            <div className="form-input">{schoolData.country}</div>
          </div>
          <div className="relative">
            <label htmlFor="">State</label>
            <div className="form-input">{schoolData.state}</div>
          </div>
          <div className="relative">
            <label htmlFor="">Area</label>
            <div className="form-input">{schoolData.area}</div>
          </div>

          <div className="relative">
            <label htmlFor="">Name</label>
            <div className="form-input">{schoolData.name}</div>
          </div>
          <div className="relative">
            <label htmlFor="">Username</label>
            <div className="form-input">{schoolData.username}</div>
          </div>
          <div className="relative">
            <label htmlFor="">Address</label>
            <input
              name="address"
              disabled
              value={schoolData.address}
              type="text"
              placeholder="Enter school address"
              className="form-input"
            />
          </div>
          <div className="relative">
            <label htmlFor="">Phone</label>
            <input
              value={schoolData.phone}
              type="text"
              name="phone"
              disabled
              placeholder="Enter school phone number"
              className="form-input"
            />
          </div>
          <div className="relative">
            <label htmlFor="">Email</label>
            <input
              value={schoolData.email}
              type="text"
              disabled
              name="email"
              placeholder="Enter school email"
              className="form-input"
            />
          </div>
          <div className="relative">
            <label htmlFor=""> Academic Levels</label>
            <div className="flex items-center mt-1 flex-wrap">
              {schoolData.levels.map((item, index) => (
                <div
                  key={index}
                  className="px-2 py-[1px] rounded-[25px] mb-1 mr-2 border text-sm border-[var(--border)]"
                >
                  {item.levelName}
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="flex justify-between">
              <label htmlFor="">Student Registration Link</label>
              <div
                onClick={() => handleCopy('student')}
                className="cursor-pointer text-[var(--custom)] transition-transform hover:scale-110"
              >
                {copied ? (
                  <Check size={18} className="text-green-500 animate-bounce" />
                ) : (
                  <Copy size={18} />
                )}
              </div>
            </div>
            <div className="relative mb-3">
              <input
                value={studentLink}
                type="text"
                readOnly
                className="form-input pr-10"
              />
            </div>
            <div className="norm_sm_title flex">
              <div className="">Enable Student Registration</div>
              <button
                onClick={() => handleRegistration('student')}
                className={`switch_btn ml-auto ${
                  schoolData.studentRegistration ? 'active' : ''
                }`}
                aria-label="Toggle Job Posting"
              >
                <div
                  className={`switch_ball ${
                    schoolData.studentRegistration ? 'active' : ''
                  }`}
                />
              </button>
            </div>
          </div>
          <div className="relative">
            <div className="flex justify-between">
              <label htmlFor="">Staff Registration Link</label>
              <div
                onClick={() => handleCopy('staff')}
                className="cursor-pointer text-[var(--custom)] transition-transform hover:scale-110"
              >
                {copied1 ? (
                  <Check size={18} className="text-green-500 animate-bounce" />
                ) : (
                  <Copy size={18} />
                )}
              </div>
            </div>
            <div className="relative mb-3">
              <input
                value={staffLink}
                type="text"
                readOnly
                className="form-input pr-10"
              />
            </div>
            <div className="norm_sm_title flex">
              <div className="">Enable Staff Registration</div>
              <button
                onClick={() => handleRegistration('staff')}
                className={`switch_btn ml-auto ${
                  schoolData.staffRegistration ? 'active' : ''
                }`}
                aria-label="Toggle Job Posting"
              >
                <div
                  className={`switch_ball ${
                    schoolData.staffRegistration ? 'active' : ''
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="justify-center flex flex-wrap">
          {loading ? (
            <button className="custom_btn neutral">
              <i className="bi bi-opencollective loading"></i>
              Processing...
            </button>
          ) : (
            <>
              <button className={`custom_btn neutral`} onClick={handleSubmit}>
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
