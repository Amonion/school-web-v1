'use client'
import { useEffect } from 'react'
import { validateInputs } from '@/lib/validation'
import { appendForm } from '@/lib/helpers'
import { MessageStore } from '@/src/zustand/notification/Message'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { UserSettingsStore } from '@/src/zustand/user/UserSettings'

export default function SetNotification() {
  const { user } = AuthStore()
  const { setMessage } = MessageStore()
  const {
    userSettingsForm,
    loading,
    getUserSettings,
    toggleNotification,
    updateUserSettings,
  } = UserSettingsStore()
  const url = '/users/settings/'

  useEffect(() => {
    getUserSettings(`${url}${user?._id}`, setMessage)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    const inputsToValidate = [
      {
        name: 'userSettingsForm',
        value: JSON.stringify(userSettingsForm),
        rules: { blank: false },
        field: 'Notifications',
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
    updateUserSettings(`${url}${user?._id}`, data, setMessage)
  }

  return (
    <>
      <div className="round_box mb-5">
        <div className="mb-5">
          <div className="norm_sm_title mb-2 text-[var(--text-secondary)] flex">
            Job Posting{' '}
            <button
              onClick={() => toggleNotification('jobPosting')}
              className={`switch_btn ml-auto ${
                userSettingsForm.jobPosting ? 'active' : ''
              }`}
              aria-label="Toggle Job Posting"
            >
              <div
                className={`switch_ball ${
                  userSettingsForm.jobPosting ? 'active' : ''
                }`}
              />
            </button>
          </div>

          <div className="text-sm border-b border-b-[var(--border)] pb-2">
            You will easily receive job notifications related to your field of
            study and occupation you filled in your profile settings.
          </div>
        </div>

        <div className="mb-5">
          <div className="norm_sm_title mb-2 text-[var(--text-secondary)] flex">
            Friend Requests{' '}
            <button
              onClick={() => toggleNotification('friendRequest')}
              className={`switch_btn ml-auto ${
                userSettingsForm.friendRequest ? 'active' : ''
              }`}
              aria-label="Toggle Job Posting"
            >
              <div
                className={`switch_ball ${
                  userSettingsForm.friendRequest ? 'active' : ''
                }`}
              />
            </button>
          </div>

          <div className="text-sm border-b border-b-[var(--border)] pb-2">
            You will easily received job notifications related to your field of
            study and occupation you filled in your profile settings.
          </div>
        </div>

        <div className="mb-5">
          <div className="norm_sm_title mb-2 text-[var(--text-secondary)] flex">
            New Message{' '}
            <button
              onClick={() => toggleNotification('newMessage')}
              className={`switch_btn ml-auto ${
                userSettingsForm.newMessage ? 'active' : ''
              }`}
              aria-label="Toggle Job Posting"
            >
              <div
                className={`switch_ball ${
                  userSettingsForm.newMessage ? 'active' : ''
                }`}
              />
            </button>
          </div>

          <div className="text-sm border-b border-b-[var(--border)] pb-2">
            You will easily received job notifications related to your field of
            study and occupation you filled in your profile settings.
          </div>
        </div>

        <div className="mb-5">
          <div className="norm_sm_title mb-2 text-[var(--text-secondary)] flex">
            New Follower{' '}
            <button
              onClick={() => toggleNotification('newFollower')}
              className={`switch_btn ml-auto ${
                userSettingsForm.newFollower ? 'active' : ''
              }`}
              aria-label="Toggle Job Posting"
            >
              <div
                className={`switch_ball ${
                  userSettingsForm.newFollower ? 'active' : ''
                }`}
              />
            </button>
          </div>

          <div className="text-sm border-b border-b-[var(--border)] pb-2">
            You will easily received job notifications related to your field of
            study and occupation you filled in your profile settings.
          </div>
        </div>

        <div className="mb-5">
          <div className="norm_sm_title mb-2 text-[var(--text-secondary)] flex">
            Post Reply{' '}
            <button
              onClick={() => toggleNotification('postReply')}
              className={`switch_btn ml-auto ${
                userSettingsForm.postReply ? 'active' : ''
              }`}
              aria-label="Toggle Job Posting"
            >
              <div
                className={`switch_ball ${
                  userSettingsForm.postReply ? 'active' : ''
                }`}
              />
            </button>
          </div>

          <div className="text-sm border-b border-b-[var(--border)] pb-2">
            You will easily received job notifications related to your field of
            study and occupation you filled in your profile settings.
          </div>
        </div>

        <div className="mb-5">
          <div className="norm_sm_title mb-2 text-[var(--text-secondary)] flex">
            Notification Sound{' '}
            <button
              onClick={() => toggleNotification('sound')}
              className={`switch_btn ml-auto ${
                userSettingsForm.sound ? 'active' : ''
              }`}
              aria-label="Toggle Job Posting"
            >
              <div
                className={`switch_ball ${
                  userSettingsForm.sound ? 'active' : ''
                }`}
              />
            </button>
          </div>

          <div className="text-sm border-b border-b-[var(--border)] pb-2">
            You will easily received job notifications related to your field of
            study and occupation you filled in your profile settings.
          </div>
        </div>

        {loading ? (
          <div className="btn">
            <i className="bi bi-opencollective loading  text-md"></i>
            <div>Processing...</div>
          </div>
        ) : (
          <div onClick={handleSubmit} className="btn">
            Save Information
          </div>
        )}
      </div>
    </>
  )
}
