'use client'
import Link from 'next/link'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { useState, useEffect } from 'react'
import QuillEditor from '@/components/Team/Editor/QuillEditor'
import { apiRequest } from '@/lib/axios'
import DocumentStore, { Document } from '@/src/zustand/place/Document'
import { MessageStore } from '@/src/zustand/notification/Message'

const CreateDocument: React.FC = () => {
  const url = '/places/documents'
  let itemId: string | null = null
  const [isEditing, setIsEditing] = useState(false)
  const [id, setId] = useState<string | null>('')
  const [content, setContent] = useState<string>('')
  const [name, setName] = useState('')
  const { setMessage } = MessageStore()
  const {
    formData,
    setForm,
    getDocument,
    loading,
    documents,
    resetForm,
    updateItem,
    postItem,
  } = DocumentStore()

  interface Response {
    id?: string
    country: string
  }

  useEffect(() => {
    const fetchPlace = async () => {
      const query = window.location.search
      const pId = new URLSearchParams(query).get('pId')
      if (pId) {
        const response = await apiRequest<Response>(`/places/${pId}`)
        if (response?.data) {
          const data = response?.data
          setForm('placeId', pId)
          setForm('country', data.country)
        }
      }
    }
    fetchPlace()
    resetForm()
  }, [])

  useEffect(() => {
    const query = window.location.search
    itemId = new URLSearchParams(query).get('id')
    setId(itemId)
    const name = new URLSearchParams(query).get('name')
    const country = new URLSearchParams(query).get('country')
    const pId = new URLSearchParams(query).get('pId')

    if (country && pId) {
      setForm('placeId', pId)
      setForm('country', country)
    }

    const initialize = async () => {
      if (itemId !== null) {
        setName(String(name))
        setId(itemId)
        setIsEditing(true)
        const existingItem = documents.find((item) => item._id === itemId)
        if (existingItem) {
          populateFields(existingItem)
        } else {
          await getDocument(`${url}/${itemId}`, setMessage)
        }
      } else {
        setId(null)
        setIsEditing(false)
        setName('')
      }
    }

    initialize()
  }, [itemId])

  const populateFields = (item: Document) => {
    setContent(item.description)
    setForm('required', item.required)
    setForm('placeId', item.placeId)
    setForm('country', item.country)
    setForm('name', item.name)
    setForm('picture', item.picture)
    setForm('description', item.description)
    setForm('countryFlag', item.countryFlag)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(name as keyof typeof formData, value)
  }

  const select = (state: boolean) => {
    setForm('required', !state)
  }

  const handleFileChange =
    (key: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files ? e.target.files[0] : null
      setForm(key, file)
    }

  const handleSubmit = async (e: React.FormEvent) => {
    const inputsToValidate = [
      {
        name: 'country',
        value: formData.country,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: 'Country field',
      },
      {
        name: 'description',
        value: content,
        rules: { blank: false, maxLength: 1000 },
        field: 'Description field',
      },
      {
        name: 'picture',
        value: formData.picture,
        rules: { blank: false, maxSize: 10 },
        field: 'Picture file',
      },
      {
        name: 'name',
        value: formData.name,
        rules: { blank: true, maxLength: 1000 },
        field: 'Document Name',
      },
      {
        name: 'required',
        value: formData.required,
        rules: { blank: false, maxLength: 1000 },
        field: 'Required',
      },
      {
        name: 'placeId',
        value: formData.placeId,
        rules: { blank: false, maxLength: 1000 },
        field: 'Place Id',
      },
      {
        name: 'countryFlag',
        value: formData.countryFlag,
        rules: { blank: false, maxSize: 5 },
        field: 'Country flag',
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
      updateItem(`${url}/${id}`, data, setMessage)
    } else {
      await postItem(`${url}`, data, setMessage)
    }
  }

  return (
    <>
      <div className="card_body">
        <div className="custom_sm_title">
          {name ? `Update ${name}` : `Create Document`}
        </div>

        <div className="flex flex-col mb-2">
          <label className="label" htmlFor="">
            Name
          </label>
          <div className="flex">
            <input
              className="form-input"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter Name"
            />
            <div
              onClick={() => select(formData.required)}
              className={`${
                formData.required ? 'bg-[var(--custom-color)]' : ''
              } option_ticker`}
            >
              {formData.required && (
                <i className="bi bi-check-lg text-white text-2xl"></i>
              )}
            </div>
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
                Picture
              </label>
              <button className="custom_btn" onClick={handleSubmit}>
                Create Document
              </button>
              <Link
                href={`/team/places/documents?id=${formData.placeId}&country=${formData.country}`}
                className="custom_btn ml-auto "
              >
                Document Table
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default CreateDocument
