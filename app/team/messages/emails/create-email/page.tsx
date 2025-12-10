'use client'
import Link from 'next/link'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import QuillEditor from '@/components/Team/Editor/QuillEditor'
import { useState, useEffect } from 'react'
import { MessageStore } from '@/src/zustand/notification/Message'
import EmailStore, { Email } from '@/src/zustand/notification/Email'
import { AuthStore } from '@/src/zustand/user/AuthStore'

const CreateEmail: React.FC = () => {
  const url = '/messages/'
  let itemId: string | null = null
  const [content, setContent] = useState<string>('')
  const [isEditing, setIsEditing] = useState(false)
  const [id, setId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const { setMessage } = MessageStore()
  const {
    emailForm,
    setForm,
    getItems,
    results,
    resetForm,
    loading,
    updateItem,
    postItem,
  } = EmailStore()
  const { user } = AuthStore()

  useEffect(() => {
    const query = window.location.search
    itemId = new URLSearchParams(query).get('id')
    const name = new URLSearchParams(query).get('name')

    const initialize = async () => {
      if (itemId !== null) {
        setName(String(name))
        setId(itemId)
        setIsEditing(true)
        const existingItem = results.find((item) => item._id === itemId)
        if (existingItem) {
          populateFields(existingItem)
        } else {
          await getItems(`${url}`, setMessage)
          const fetchedItems = EmailStore.getState().results.find(
            (item) => item._id === itemId
          )
          if (fetchedItems) {
            populateFields(fetchedItems)
          } else {
            console.warn('Place with the specified ID was not found.')
          }
        }
      } else {
        setId(null)
        setIsEditing(false)
        setName('')
        resetForm()
      }
    }

    initialize()
  }, [itemId, results, getItems])

  const populateFields = (item: Email) => {
    setContent(item.content)
    setForm('content', item.content)
    setForm('name', item.name)
    setForm('title', item.title)
    setForm('picture', item.picture)
    setForm('greetings', item.greetings)
    setForm('note', item.note)
  }

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
    if (isEditing) {
      updateItem(`${url}${id}/`, data, setMessage)
    } else {
      await postItem(url, data, setMessage)
    }
  }

  return (
    <>
      <div className="card_body">
        <div className="custom_sm_title">
          {name ? `Update ${name}` : `Create Email`}
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

        <div className="table_action">
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
                Create Email
              </button>
              <Link
                href="/team/messages/emails"
                className="custom_btn ml-auto "
              >
                Email Tables
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default CreateEmail
