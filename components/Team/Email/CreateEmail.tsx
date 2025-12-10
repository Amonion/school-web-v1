'use client'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import QuillEditor from '@/components/Team/Editor/QuillEditor'
import { useState } from 'react'
import { MessageStore } from '@/src/zustand/notification/Message'
import EmailStore from '@/src/zustand/notification/Email'
import { AuthStore } from '@/src/zustand/user/AuthStore'
const CreateEmailForm: React.FC = () => {
  const url = '/emails/'
  const [content, setContent] = useState<string>('')
  const { setMessage } = MessageStore()
  const {
    emailForm,
    loading,
    setShowEmailForm,
    setForm,
    updateItem,
    postItem,
  } = EmailStore()
  const { user } = AuthStore()

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(name as keyof typeof emailForm, value)
  }

  const handleFileChange =
    (key: keyof typeof emailForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files ? e.target.files[0] : null
      setForm(key, file)
    }

  const handleSubmit = async (e: React.FormEvent) => {
    const inputsToValidate = [
      {
        name: 'greetings',
        value: emailForm.greetings,
        rules: { blank: false },
        field: 'Greetings field',
      },
      {
        name: 'content',
        value: content,
        rules: { blank: false },
        field: 'Email Content field',
      },
      {
        name: 'picture',
        value: emailForm.picture,
        rules: { blank: false, maxSize: 3 },
        field: 'Email banner',
      },
      {
        name: 'title',
        value: emailForm.title,
        rules: { blank: false, minLength: 3 },
        field: 'Email title field',
      },
      {
        name: 'note',
        value: emailForm.note,
        rules: { blank: false },
        field: 'Email note field',
      },
      {
        name: 'name',
        value: emailForm.name,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: 'Email name field',
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
    if (emailForm._id) {
      updateItem(`${url}${emailForm._id}/`, data, setMessage, () =>
        setShowEmailForm(false)
      )
    } else {
      await postItem(url, data, setMessage, () => setShowEmailForm(false))
    }
  }

  return (
    <>
      <div
        onClick={() => setShowEmailForm(false)}
        className="fixed bg-black/50  w-full h-full flex items-center justify-center z-40 top-0 left-0"
      >
        <div
          onClick={(e) => {
            e.stopPropagation()
          }}
          className="flex max-w-[1300px]"
        >
          <div className="card_body sharp">
            <div className="custom_sm_title">
              {emailForm._id ? `Update Emails` : `Create Email`}
            </div>
            <div className="grid-2 grid-lay">
              {user && user.staffRanking > 19 ? (
                <div className="flex flex-col">
                  <label className="label" htmlFor="">
                    Email Name
                  </label>
                  <input
                    className="form-input"
                    name="name"
                    value={emailForm.name}
                    onChange={handleInputChange}
                    type="text"
                    placeholder="Enter email name"
                  />
                </div>
              ) : (
                <div className="flex flex-col">
                  <label className="label" htmlFor="">
                    Email Name
                  </label>
                  <input
                    className="form-input"
                    name="name"
                    value={emailForm.name}
                    onChange={handleInputChange}
                    type="text"
                    placeholder="Enter email name"
                  />
                </div>
              )}
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Email Title
                </label>
                <input
                  className="form-input"
                  type="text"
                  name="title"
                  value={emailForm.title}
                  onChange={handleInputChange}
                  placeholder="Enter email title"
                />
              </div>
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Email Greetings
                </label>
                <input
                  className="form-input"
                  type="text"
                  name="greetings"
                  value={emailForm.greetings}
                  onChange={handleInputChange}
                  placeholder="Enter email greeting"
                />
              </div>
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Email Note
                </label>
                <input
                  className="form-input"
                  name="note"
                  value={emailForm.note}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="Enter email note"
                />
              </div>
            </div>

            <QuillEditor
              contentValue={content}
              onChange={(content) => setContent(content)}
            />

            <div className="table_action gap-5">
              {loading ? (
                <button className="custom_btn">
                  <i className="bi bi-opencollective loading"></i>
                  Processing...
                </button>
              ) : (
                <>
                  <label htmlFor="banner" className="custom_btn ">
                    <input
                      className="input-file"
                      type="file"
                      name="picture"
                      id="banner"
                      accept="image/*"
                      onChange={handleFileChange('picture')}
                    />
                    <i className="bi bi-cloud-arrow-up text-2xl mr-2"></i>
                    Upload
                  </label>
                  <button className="custom_btn" onClick={handleSubmit}>
                    {emailForm._id ? 'Update Email' : 'Create Email'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CreateEmailForm
