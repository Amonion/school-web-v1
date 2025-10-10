'use client'
import Link from 'next/link'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { MessageStore } from '@/src/zustand/notification/Message'
import CompanyStore from '@/src/zustand/app/Company'

const CreateCompany: React.FC = () => {
  const url = '/company/'
  const { companyForm, setForm, loading, updateItem } = CompanyStore()
  const { setMessage } = MessageStore()

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(name as keyof typeof companyForm, value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    const inputsToValidate = [
      {
        name: 'id',
        value: companyForm._id,
        rules: { blank: false, maxLength: 100 },
        field: 'Email field',
      },
      {
        name: 'email',
        value: companyForm.email,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Email field',
      },
      {
        name: 'name',
        value: companyForm.name,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Name field',
      },
      {
        name: 'headquaters',
        value: companyForm.headquaters,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: 'Headquaters field',
      },
      {
        name: 'newVersionLink',
        value: companyForm.newVersionLink,
        rules: { blank: false, maxLength: 1000 },
        field: 'New Version field',
      },
      {
        name: 'newVersion',
        value: companyForm.newVersion,
        rules: { blank: false, maxLength: 1000 },
        field: 'New Version field',
      },
      {
        name: 'phone',
        value: companyForm.phone,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: 'Phone Id',
      },
      {
        name: 'finalInstruction',
        value: companyForm.finalInstruction,
        rules: { blank: false, minLength: 3, maxLength: 10000 },
        field: 'Instruction Id',
      },
      {
        name: 'domain',
        value: companyForm.domain,
        rules: { blank: false, maxLength: 1000 },
        field: 'Domain field',
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
    updateItem(`${url}`, data, setMessage)
  }

  return (
    <>
      <div className="card_body sharp h-full">
        <div className="custom_sm_title">Update Company</div>

        <div className="grid-2 grid-lay">
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Name
            </label>
            <input
              className="form-input"
              name="name"
              value={companyForm.name}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter name"
            />
          </div>
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Domain
            </label>
            <input
              className="form-input"
              name="domain"
              value={companyForm.domain}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter domain"
            />
          </div>
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Email
            </label>
            <input
              className="form-input"
              name="email"
              value={companyForm.email}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter email"
            />
          </div>
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Phone
            </label>
            <input
              className="form-input"
              name="phone"
              value={companyForm.phone}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter phone"
            />
          </div>
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Allow New Signup
            </label>
            <div
              onClick={() => setForm('allowSignUp', !companyForm.allowSignUp)}
              className="custom_btn line neutral"
            >
              <div
                className={`checkbox ${
                  companyForm.allowSignUp ? 'active' : ''
                }`}
              >
                {companyForm.allowSignUp && (
                  <i className="bi bi-check text-white text-lg"></i>
                )}
              </div>
              {`${companyForm.allowSignUp ? 'Yes' : 'No'} `}{' '}
              {companyForm.allowSignUp}
            </div>
          </div>
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Headquaters
            </label>
            <input
              className="form-input"
              name="headquaters"
              value={companyForm.headquaters}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter headquaters"
            />
          </div>
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              New Version
            </label>
            <input
              className="form-input"
              name="newVersion"
              value={companyForm.newVersion}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter new version"
            />
          </div>
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              New Version Link
            </label>
            <input
              className="form-input"
              name="newVersionLink"
              value={companyForm.newVersionLink}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter new version link"
            />
          </div>
        </div>

        <div className="flex flex-col mb-2">
          <label className="label" htmlFor="">
            Welcome Note
          </label>
          <textarea
            value={companyForm.finalInstruction}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Write welcome note"
            name="finalInstruction"
            id=""
          ></textarea>
        </div>

        <div className="table-action flex flex-wrap">
          {loading ? (
            <button className="custom_btn">
              <i className="bi bi-opencollective loading"></i>
              Processing...
            </button>
          ) : (
            <>
              <button className="custom_btn" onClick={handleSubmit}>
                Submit
              </button>
              <Link href="/team/company" className="custom_btn ">
                Staff Table
              </Link>
              <Link href="/team/company/branches" className="custom_btn">
                Branches Table
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default CreateCompany
