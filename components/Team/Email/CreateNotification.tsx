'use client'
import { appendForm, validateUsername } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import QuillEditor from '@/components/Team/Editor/QuillEditor'
import { useState, useEffect } from 'react'
import { MessageStore } from '@/src/zustand/notification/Message'
import NotificationStore from '@/src/zustand/notification/NotificationTemplate'

const CreateNotificationTemplate: React.FC = () => {
  const url = '/notifications/templates'
  const [content, setContent] = useState<string>('')
  const { setMessage } = MessageStore()
  const {
    notificationTemplateForm,
    loading,
    setShowForm,
    setForm,
    updateItem,
    postItem,
  } = NotificationStore()

  useEffect(() => {
    setContent(notificationTemplateForm.content)
  }, [notificationTemplateForm._id])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(name as keyof typeof notificationTemplateForm, value.trim())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    const isUsernameValid = validateUsername(notificationTemplateForm.name)
    if (!isUsernameValid) {
      setMessage(
        'Sorry! invalid notification name, no space is allowed.',
        false
      )
      return
    }
    const inputsToValidate = [
      {
        name: 'officeUsername',
        value: 'Schooling',
        rules: { blank: true, maxLength: 100 },
        field: 'Greetings field',
      },
      {
        name: 'greetings',
        value: notificationTemplateForm.greetings,
        rules: { blank: true, maxLength: 100 },
        field: 'Greetings field',
      },
      {
        name: 'content',
        value: content,
        rules: { blank: true, minLength: 3 },
        field: 'Notification Content field',
      },

      {
        name: 'title',
        value: notificationTemplateForm.title,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Notification title field',
      },

      {
        name: 'name',
        value: notificationTemplateForm.name,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Notification name field',
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
    if (notificationTemplateForm._id) {
      updateItem(
        `${url}/${notificationTemplateForm._id}/?officeUsername=Schooling`,
        data,
        setMessage,
        () => setShowForm(false)
      )
    } else {
      await postItem(`${url}/?officeUsername=Schooling`, data, setMessage, () =>
        setShowForm(false)
      )
    }
  }

  return (
    <>
      <div
        onClick={() => setShowForm(false)}
        className="fixed bg-black/50  w-full h-full flex items-center justify-center z-40 top-0 left-0"
      >
        <div
          onClick={(e) => {
            e.stopPropagation()
          }}
          className="flex max-w-[800px]"
        >
          <div className="card_body sharp">
            <div className="custom_sm_title">
              {notificationTemplateForm._id
                ? `Update Notification`
                : `Create Notification`}
            </div>
            <div className="grid-2 grid-lay">
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Notification Name
                </label>
                <input
                  className="form-input"
                  name="name"
                  value={notificationTemplateForm.name}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="Enter notification name"
                />
              </div>
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Notification Title
                </label>
                <input
                  className="form-input"
                  type="text"
                  name="title"
                  value={notificationTemplateForm.title}
                  onChange={handleInputChange}
                  placeholder="Enter notification title"
                />
              </div>
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Notification Greetings
                </label>
                <input
                  className="form-input"
                  type="text"
                  name="greetings"
                  value={notificationTemplateForm.greetings}
                  onChange={handleInputChange}
                  placeholder="Enter notification greeting"
                />
              </div>
            </div>

            <QuillEditor
              contentValue={content}
              onChange={(content) => setContent(content)}
            />

            <div className="table_action">
              {loading ? (
                <button className="custom_btn">
                  <i className="bi bi-opencollective loading"></i>
                  Processing...
                </button>
              ) : (
                <>
                  <button className="custom_btn" onClick={handleSubmit}>
                    {notificationTemplateForm._id
                      ? 'Edit Notification'
                      : 'Create Notification'}
                  </button>
                  <div
                    onClick={() => setShowForm(false)}
                    className="custom_btn ml-auto "
                  >
                    Close Form
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CreateNotificationTemplate
