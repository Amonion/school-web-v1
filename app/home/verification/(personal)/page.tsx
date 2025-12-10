'use client'
import { useEffect, useState } from 'react'
import { formatDateToDDMMYY } from '@/lib/helpers'
import { appendForm } from '@/lib/helpers'
import { BioUserStore } from '@/src/zustand/user/BioUser'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import Capture from '@/components/Home/Verification/Capture'
import { validateInputs } from '@/lib/validation'
import PictureDisplay from '@/components/Home/Media/PictureDisplay'
import { useRouter } from 'next/navigation'
import InputMask from 'react-input-mask'
import { isValid, parse } from 'date-fns'
import CustomBtn from '@/components/CustomBtn'

// import NotificationStore from "@/src/zustand/users/Notification";

export default function UserBio() {
  const { bioUserForm, setForm, setBioUser, updateMyBioUser, loading } =
    BioUserStore()
  const { bioUserState, user, bioUser } = AuthStore()
  const { setMessage } = MessageStore()
  const { setAlert } = AlartStore()
  const [isBioEdit, setIsBioEdit] = useState(false)
  const url = '/biousers/'
  const router = useRouter()
  const [dob, setDob] = useState('')

  useEffect(() => {
    if (bioUserState?.isBio) {
      setIsBioEdit(false)
    } else {
      setIsBioEdit(true)
    }
  }, [bioUserState])

  useEffect(() => {
    if (isBioEdit && bioUser) {
      setBioUser(bioUser)
    }
  }, [isBioEdit, bioUser])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setDob(value)

    if (value.length === 10 && !value.includes('_')) {
      const parsed = parse(value, 'dd/MM/yyyy', new Date())
      if (!isValid(parsed)) {
        setForm('dateOfBirth', null)
        setMessage('Invalid date! Please enter a valid date of birth', false)
      } else {
        setForm('dateOfBirth', parsed)
      }
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target

    if (name === 'dateOfBirth') {
      const selectedDate = new Date(value)
      const tenYearsAgo = new Date()
      tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 2)

      if (selectedDate > tenYearsAgo) {
        setMessage('Date of Birth must be at least 2 years ago.', false)
        return
      }
    }

    setForm(name as keyof typeof bioUserForm, value)
  }

  const submitData = async (data: FormData) => {
    updateMyBioUser(`${url}${bioUser?._id}`, data, setMessage, () =>
      router.replace(`/home/verification/origin`)
    )
  }

  const handleSubmit = async () => {
    if (user && user.isVerified) {
      setMessage('To update these information, please contact support', false)
      return
    }

    const inputsToValidate = [
      {
        name: 'firstName',
        value: bioUserForm.firstName.trim(),
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'First Name',
      },
      {
        name: 'middleName',
        value: bioUserForm.middleName.trim(),
        rules: { blank: true, minLength: 2, maxLength: 100 },
        field: 'Middle Name',
      },
      {
        name: 'lastName',
        value: bioUserForm.lastName.trim(),
        rules: { blank: true, minLength: 2, maxLength: 100 },
        field: 'Last Name',
      },
      {
        name: 'ID',
        value: String(user?._id),
        rules: { blank: true },
        field: 'ID ',
      },
      {
        name: 'gender',
        value: bioUserForm.gender,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Gender',
      },
      {
        name: 'dateOfBirth',
        value: bioUserForm.dateOfBirth,
        rules: { blank: true, maxLength: 100 },
        field: 'Date of Birth',
      },
      {
        name: 'maritalStatus',
        value: bioUserForm.maritalStatus,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Marital Status',
      },
      {
        name: 'action',
        value: 'Bio',
        rules: { blank: true, minLength: 1 },
        field: 'Bio Data',
      },
      {
        name: 'isBio',
        value: true,
        rules: { blank: true, minLength: 1 },
        field: 'Bio Data',
      },
      {
        name: 'passport',
        value: bioUserForm.passport,
        rules: { blank: true, maxSize: 20 },
        field: 'Passport',
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
      'You will need to contact support to edit this information after verification is approved!',
      true,
      () => submitData(data)
    )
  }

  return (
    <>
      {isBioEdit ? (
        <div>
          <div className="grid-2 grid-lay">
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                First Name
              </label>
              <input
                className="form-input"
                name="firstName"
                value={bioUserForm.firstName}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter first name"
              />
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Middle Name
              </label>
              <input
                className="form-input"
                name="middleName"
                value={bioUserForm.middleName}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter middle name"
              />
            </div>
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Last Name
              </label>
              <input
                className="form-input"
                name="lastName"
                value={bioUserForm.lastName}
                onChange={handleInputChange}
                type="text"
                placeholder="Enter last name"
              />
            </div>

            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Date of Birth
              </label>
              {/* <div className="flex justify-between">
                <div className="form-input sm w-input mr-6">
                  {bioUserForm.dateOfBirth
                    ? `${formatDateToDDMMYY(bioUserForm.dateOfBirth)}`
                    : `Set Date of Birth`}
                </div>

                <label
                  className="ml-auto rounded-[5px] relative cursor-pointer flex justify-center items-center px-4 h-10 bg-[var(--border-background)]"
                  htmlFor="date"
                >
                  <i className="cursor-pointer bi bi-calendar-week absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"></i>
                  <input
                    id="date"
                    className="sm opacity-0 w-8"
                    name="dateOfBirth"
                    // max={getMaxDateForDOB()}
                    type="date"
                    onChange={handleInputChange}
                  />
                </label>
              </div> */}
              <InputMask
                mask="99/99/9999"
                value={dob}
                name="dateOfBirth"
                onChange={handleChange}
                placeholder="dd/mm/yyyy"
                className="form-input"
              />
            </div>

            <div className="flex justify-between">
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Gender
                </label>
                <div className="flex items-center">
                  <div
                    className="radio"
                    onClick={() => setForm('gender', 'Male')}
                  >
                    <div className="radio_circle">
                      {bioUserForm.gender === 'Male' && (
                        <div className="radio_dot"></div>
                      )}
                    </div>
                    Male
                  </div>
                  <div
                    className="radio"
                    onClick={() => setForm('gender', 'Female')}
                  >
                    <div className="radio_circle">
                      {bioUserForm.gender === 'Female' && (
                        <div className="radio_dot"></div>
                      )}
                    </div>
                    Female
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Marital Status
                </label>
                <div className="flex items-center">
                  <div
                    className="radio"
                    onClick={() => setForm('maritalStatus', 'Single')}
                  >
                    <div className="radio_circle">
                      {bioUserForm.maritalStatus === 'Single' && (
                        <div className="radio_dot"></div>
                      )}
                    </div>
                    Single
                  </div>
                  <div
                    className="radio"
                    onClick={() => setForm('maritalStatus', 'Married')}
                  >
                    <div className="radio_circle">
                      {bioUserForm.maritalStatus === 'Married' && (
                        <div className="radio_dot"></div>
                      )}
                    </div>
                    Married
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Capture />
          <CustomBtn
            label="Submit Form"
            loading={loading}
            onClick={handleSubmit}
          />
        </div>
      ) : (
        <div className="round_box mb-5">
          <div className="grid-2 grid-lay mx-1">
            <div className="">
              <div className="text-sm">First Name</div>
              <div className="selected_item text-[var(--text-secondary)]">
                {bioUser?.firstName}
              </div>
            </div>

            <div className="">
              <div className="text-sm">Middle Name</div>
              <div className="selected_item text-[var(--text-secondary)]">
                {bioUser?.middleName}
              </div>
            </div>

            <div className="">
              <div className="text-sm">Last Name</div>
              <div className="selected_item text-[var(--text-secondary)]">
                {bioUser?.lastName}
              </div>
            </div>

            <div className="">
              <div className="text-sm">Date of Birth</div>
              <div className="selected_item text-[var(--text-secondary)]">
                {formatDateToDDMMYY(String(bioUser?.dateOfBirth))}
              </div>
            </div>

            <div className="">
              <div className="text-sm">Gender</div>
              <div className="selected_item text-[var(--text-secondary)]">
                {bioUser?.gender}
              </div>
            </div>

            <div className="">
              <div className="text-sm">Marital Status</div>
              <div className="selected_item text-[var(--text-secondary)]">
                {bioUser?.maritalStatus}
              </div>
            </div>
          </div>

          <div className="flex justify-center mb-5">
            {bioUser?.passport && (
              <div
                style={{
                  borderRadius: '5px',
                  width: '200px',
                  height: '200px',
                  objectFit: 'cover',
                  maxHeight: '200px',
                  maxWidth: '200px',
                  overflow: 'hidden',
                }}
              >
                <PictureDisplay source={String(bioUser.passport)} />
              </div>
            )}
          </div>

          <CustomBtn
            label="Edit this Information"
            loading={false}
            onClick={() => setIsBioEdit(true)}
          />
        </div>
      )}
    </>
  )
}
