'use client'
import { useEffect, useState } from 'react'
import { appendForm } from '@/lib/helpers'
import { BioUserStore } from '@/src/zustand/user/BioUser'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import { validateInputs } from '@/lib/validation'
import { useRouter } from 'next/navigation'

export default function Related() {
  const [isRelatedEdit, setRelatedEdit] = useState(false)
  const { bioUserForm, setForm, loading, updateMyBioUser } = BioUserStore()
  const { bioUser, bioUserState, user } = AuthStore()
  const { setMessage } = MessageStore()
  const url = '/users/bio-user/'
  const { setAlert } = AlartStore()
  const router = useRouter()

  useEffect(() => {
    if (!bioUserState) return
    if (!bioUserState.isRelated) {
      setRelatedEdit(true)
    } else {
      setRelatedEdit(false)
    }
  }, [bioUserState])

  useEffect(() => {
    if (bioUser) {
      BioUserStore.setState({ bioUserForm: bioUser })
    }
  }, [])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(name as keyof typeof bioUserForm, value)
  }

  const submitData = async (data: FormData) => {
    updateMyBioUser(`${url}${bioUserForm?._id}`, data, setMessage, () =>
      router.replace(`/home/verification/document`)
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    if (user && user.isVerified) {
      setMessage('To update these information, please contact support', false)
      return
    }
    const inputsToValidate = [
      {
        name: 'motherName',
        value: bioUserForm.motherName.trim(),
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Mother name',
      },
      {
        name: 'occupation',
        value: bioUserForm.occupation.trim(),
        rules: { blank: true, minLength: 2, maxLength: 100 },
        field: 'Occupation',
      },
      {
        name: 'nextKinName',
        value: bioUserForm.nextKinName.trim(),
        rules: { blank: true, minLength: 2, maxLength: 100 },
        field: 'Next kin',
      },
      {
        name: 'nextKinPhoneNumber',
        value: bioUserForm.nextKinPhoneNumber.trim(),
        rules: { blank: true, minLength: 2, maxLength: 100 },
        field: 'Next of kin phone',
      },

      {
        name: 'isRelated',
        value: true,
        rules: { blank: false, maxLength: 100 },
        field: 'isRelated',
      },
      {
        name: 'action',
        value: 'Related',
        rules: { blank: false, maxLength: 100 },
        field: 'Related',
      },
      {
        name: 'ID',
        value: String(user?._id),
        rules: { blank: true },
        field: 'ID ',
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

    setAlert(
      'Warning',
      'You will need to contact support to edit this information after verification is approved!',
      true,
      () => submitData(data)
    )
  }

  return (
    <>
      {isRelatedEdit ? (
        <div>
          <div className="grid-2 grid-lay">
            <div className="flex flex-col relative">
              <label className="label" htmlFor="">
                Occupation
              </label>
              <input
                className="form-input"
                name="occupation"
                value={bioUserForm.occupation}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter occupation"
              />
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Mother Maiden Name
              </label>
              <input
                className="form-input"
                name="motherName"
                value={bioUserForm.motherName}
                onChange={handleInputChange}
                type="text"
                placeholder="Mother's maiden name"
              />
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Next of Kin
              </label>
              <input
                className="form-input"
                name="nextKinName"
                value={bioUserForm.nextKinName}
                onChange={handleInputChange}
                type="text"
                placeholder="Next of kin"
              />
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Next of Kin Phone
              </label>
              <input
                className="form-input"
                name="nextKinPhoneNumber"
                value={bioUserForm.nextKinPhoneNumber}
                onChange={handleInputChange}
                type="text"
                placeholder="Next of kin phone number"
              />
            </div>
          </div>

          {loading ? (
            <div className="btn">
              <i className="bi bi-opencollective loading  text-md"></i>
              <div>Processing...</div>
            </div>
          ) : (
            <div onClick={handleSubmit} className="btn">
              Submit Form
            </div>
          )}
        </div>
      ) : (
        <div className="round_box mb-5 ">
          <div className="grid-2 grid-lay mx-1">
            <div className="">
              <div className="text-sm">Occupation</div>
              <div className="selected_item text-[var(--text-secondary)]">
                {bioUser?.occupation}
              </div>
            </div>

            <div className="">
              <div className="text-sm"> Mother Maiden Name</div>
              <div className="selected_item text-[var(--text-secondary)]">
                {bioUser?.motherName}
              </div>
            </div>

            <div className="">
              <div className="text-sm">Next of Kin</div>
              <div className="selected_item text-[var(--text-secondary)]">
                {bioUser?.nextKinName}
              </div>
            </div>

            <div className="">
              <div className="text-sm">Next of Kin Phone</div>
              <div className="selected_item text-[var(--text-secondary)]">
                {bioUser?.nextKinPhoneNumber}
              </div>
            </div>
          </div>

          <div onClick={() => setRelatedEdit(true)} className="btn">
            Edit this Information
          </div>
        </div>
      )}
    </>
  )
}
