'use client'
import { useEffect } from 'react'
import { validateInputs } from '@/lib/validation'
import { appendForm } from '@/lib/helpers'
import Link from 'next/link'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import { BioUserSettingsStore } from '@/src/zustand/user/BioUserSettings'

export default function SetSocial() {
  const { bioUser, bioUserSettings, logout } = AuthStore()
  const { setMessage } = MessageStore()
  const url = '/users/bio-user/settings/'
  const { setAlert } = AlartStore()
  const {
    bioUserSettingsForm,
    loading,
    deleteMyAccount,
    updateBioUserSettings,
    toggleVisibility,
  } = BioUserSettingsStore()

  useEffect(() => {
    if (!bioUserSettings) return
    BioUserSettingsStore.setState({ bioUserSettingsForm: bioUserSettings })
  }, [bioUserSettings])

  const handleSubmit = async (e: React.FormEvent) => {
    const inputsToValidate = [
      {
        name: 'bioUserSettings',
        value: JSON.stringify(bioUserSettingsForm),
        rules: { blank: true },
        field: 'Settings',
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
    updateBioUserSettings(`${url}${bioUser._id}`, data, setMessage)
  }

  const handleDeleteAccount = () => {
    setAlert(
      'Warning',
      'You are about to delete your account, including all your social data, are you sure you want to continue?',
      true,
      () => submitData()
    )
  }

  const submitData = () => {
    deleteMyAccount(`/users/bio-user/${bioUser?._id}`, setMessage)
    logout()
  }
  return (
    <>
      <div className="round_box mb-5">
        <div className="m-1 mb-5">
          <div className="text-lg text-[var(--text-secondary)] mb-3 flex">
            Who sees my profile
          </div>

          <div className="m-1 mb-5">
            <div className="norm_sm_title mb-5 flex">
              Your Government
              <button
                className={`switch_btn ml-auto active`}
                aria-label="Toggle Job Posting"
              >
                <div className={`switch_ball active`} />
              </button>
            </div>

            <div className="norm_sm_title mb-5 flex">
              Your Institution
              <button
                className={`switch_btn ml-auto active`}
                aria-label="Toggle Job Posting"
              >
                <div className={`switch_ball active`} />
              </button>
            </div>

            <div className="norm_sm_title mb-5 flex">
              Single Employer
              <button
                onClick={() => toggleVisibility('bioVisibility', 'single')}
                className={`switch_btn ml-auto ${
                  bioUserSettingsForm?.bioVisibility.single ? 'active' : ''
                }`}
                aria-label="Toggle Job Posting"
              >
                <div
                  className={`switch_ball ${
                    bioUserSettingsForm?.bioVisibility.single ? 'active' : ''
                  }`}
                />
              </button>
            </div>

            <div className="norm_sm_title mb-5 flex">
              Company Employer
              <button
                onClick={() => toggleVisibility('bioVisibility', 'company')}
                className={`switch_btn ml-auto ${
                  bioUserSettingsForm?.bioVisibility.company ? 'active' : ''
                }`}
                aria-label="Toggle Job Posting"
              >
                <div
                  className={`switch_ball ${
                    bioUserSettingsForm?.bioVisibility.company ? 'active' : ''
                  }`}
                />
              </button>
            </div>

            <div className="text-sm border-b border-b-[var(--border)] pb-2">
              Your information is visible only to authorized groups you permit.
              Your government and current institution have exclusive rights.
            </div>
          </div>
        </div>

        <div className="m-1 mb-5">
          <div className="text-lg text-[var(--text-secondary)] mb-3 flex">
            Who sees my education history{' '}
          </div>

          <div className="m-1 mb-5">
            <div className="norm_sm_title mb-5 flex">
              Your Government
              <button
                className={`switch_btn ml-auto active`}
                aria-label="Toggle Job Posting"
              >
                <div className={`switch_ball active`} />
              </button>
            </div>

            <div className="norm_sm_title mb-5 flex">
              Your Institution
              <button
                className={`switch_btn ml-auto active`}
                aria-label="Toggle Job Posting"
              >
                <div className={`switch_ball active`} />
              </button>
            </div>

            <div className="norm_sm_title mb-5 flex">
              Single Employer
              <button
                onClick={() =>
                  toggleVisibility('educationVisibility', 'single')
                }
                className={`switch_btn ml-auto ${
                  bioUserSettingsForm?.educationVisibility.single
                    ? 'active'
                    : ''
                }`}
                aria-label="Toggle Job Posting"
              >
                <div
                  className={`switch_ball ${
                    bioUserSettingsForm?.educationVisibility.single
                      ? 'active'
                      : ''
                  }`}
                />
              </button>
            </div>

            <div className="norm_sm_title mb-5 flex">
              Company Employer
              <button
                onClick={() =>
                  toggleVisibility('educationVisibility', 'company')
                }
                className={`switch_btn ml-auto ${
                  bioUserSettingsForm?.educationVisibility.company
                    ? 'active'
                    : ''
                }`}
                aria-label="Toggle Job Posting"
              >
                <div
                  className={`switch_ball ${
                    bioUserSettingsForm?.educationVisibility.company
                      ? 'active'
                      : ''
                  }`}
                />
              </button>
            </div>

            <div className="text-sm border-b border-b-[var(--border)] pb-2">
              Your information is visible only to authorized groups you permit.
              Your government and current institution have exclusive rights.
            </div>
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

      {loading ? (
        <div className="btn">
          <i className="bi bi-opencollective loading  text-md"></i>
          <div>Processing...</div>
        </div>
      ) : (
        <div>
          <p className="text-sm text-red-500 mb-3">
            Deleting your account will delete all your social data. However,
            data used during your verification will be retained following our
            <Link
              href="/terms-conditions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline ml-1 mr-1"
            >
              Terms and Conditions
            </Link>
            on user verification.
          </p>
          <div onClick={handleDeleteAccount} className="btn">
            Delete My Account
          </div>
        </div>
      )}
    </>
  )
}
