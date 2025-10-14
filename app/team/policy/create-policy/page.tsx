'use client'
import Link from 'next/link'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { useState, useEffect } from 'react'
import QuillEditor from '@/components/Team/Editor/QuillEditor'
import { MessageStore } from '@/src/zustand/notification/Message'
import { Policy, PolicyStore } from '@/src/zustand/app/Policy'

const CreatePolicy: React.FC = () => {
  const url = '/company/policy/'
  let itemId: string | null = null
  const {
    policyForm,
    setForm,
    getPolicy,
    loading,
    postPolicy,
    policies,
    updatePolicy,
  } = PolicyStore()
  const [isEditing, setIsEditing] = useState(false)
  const [id, setId] = useState<string | null>('')
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const { setMessage } = MessageStore()
  const [currentPage] = useState(1)
  const [page_size] = useState(20)
  const [sort] = useState('-createdAt')
  const [queryParams] = useState(
    `?page_size=${page_size}&page=${currentPage}&ordering=${sort}`
  )

  useEffect(() => {
    const query = window.location.search
    itemId = new URLSearchParams(query).get('id')
    setId(itemId)
    const name = new URLSearchParams(query).get('name')

    const initialize = async () => {
      if (itemId !== null) {
        setName(String(name))
        setId(itemId)
        setIsEditing(true)
        const existingItem = policies.find((item) => item._id === itemId)
        if (existingItem) {
          populateFields(existingItem)
        } else {
          await getPolicy(`${url}`, setMessage)
        }
      } else {
        setId(null)
        setIsEditing(false)
        setName('')
      }
    }

    initialize()
  }, [itemId, policies])

  const populateFields = (item: Policy) => {
    setForm('title', item.title)
    setForm('name', item.name)
    setForm('category', item.category)
    setContent(item.content)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(name as keyof typeof policyForm, value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    const inputsToValidate = [
      {
        name: 'title',
        value: policyForm.title,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Title field',
      },
      {
        name: 'category',
        value: policyForm.category,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Category field',
      },
      {
        name: 'name',
        value: policyForm.name,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: 'Name field',
      },

      {
        name: 'content',
        value: content,
        rules: { blank: true, minLength: 20 },
        field: 'Content field',
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
      updatePolicy(`${url}${id}${queryParams}`, data, setMessage)
    } else {
      postPolicy(`${url}${queryParams}`, data, setMessage)
    }
  }

  return (
    <>
      <div className="card_body">
        <div className="custom_sm_title">
          {name ? `Update ${name}` : `Create Policy`}
        </div>

        <div className="grid-2 grid-lay">
          <div className="flex flex-col relative">
            <label className="label" htmlFor="">
              Name
            </label>
            <input
              className="form-input"
              name="name"
              value={policyForm.name}
              onChange={handleInputChange}
              type="text"
              placeholder="Policy Name"
            />
          </div>

          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Title
            </label>
            <input
              className="form-input"
              name="title"
              value={policyForm.title}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter title"
            />
          </div>

          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Category
            </label>
            <input
              className="form-input"
              name="category"
              value={policyForm.category}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter category"
            />
          </div>
        </div>

        <QuillEditor
          contentValue={content}
          onChange={(content) => setContent(content)}
        />

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
              <Link href="/team/policy" className="custom_btn ml-auto ">
                Policy Table
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default CreatePolicy
