'use client'
import Link from 'next/link'
import { appendForm, validateUsername } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import QuillEditor from '@/components/Team/Editor/QuillEditor'
import { useState, useEffect } from 'react'
import NotificationStore from '@/src/zustand/team/Notification'
import { MessageStore } from '@/src/zustand/msgStore'
import { Notification } from '@/src/interface/team/interface'

const CreateNotification: React.FC = () => {
  const url = '/messages/notifications'
  let itemId: string | null = null
  const [content, setContent] = useState<string>('')
  const [isEditing, setIsEditing] = useState(false)
  const [id, setId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const { setMessage } = MessageStore()
  const {
    formData,
    setForm,
    getItems,
    results,
    resetForm,
    loading,
    updateItem,
    postItem,
  } = NotificationStore()

  useEffect(() => {
    resetForm()
  }, [])

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
          const fetchedItems = NotificationStore.getState().results.find(
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
      }
    }

    initialize()
  }, [itemId, results, getItems])

  const populateFields = (item: Notification) => {
    setContent(item.content)
    setForm('content', item.content)
    setForm('name', item.name)
    setForm('title', item.title)
    setForm('greetings', item.greetings)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(name as keyof typeof formData, value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    const isUsernameValid = validateUsername(formData.name)
    if (!isUsernameValid) {
      setMessage(
        'Sorry! invalid notification name, no space is allowed.',
        false
      )
      return
    }
    const inputsToValidate = [
      {
        name: 'greetings',
        value: formData.greetings,
        rules: { blank: true, minLength: 3, maxLength: 100 },
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
        value: formData.title,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Notification title field',
      },

      {
        name: 'name',
        value: formData.name,
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
          {name ? `Update ${name}` : `Create Notification`}
        </div>
        <div className="grid-2 grid-lay">
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Notification Name
            </label>
            <input
              className="form-input"
              name="name"
              value={formData.name}
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
              value={formData.title}
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
              value={formData.greetings}
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
                Create Notification
              </button>
              <Link
                href="/team/messages/notifications"
                className="custom_btn ml-auto "
              >
                Notification Tables
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default CreateNotification
