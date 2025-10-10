'use client'
import Link from 'next/link'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { useState, useEffect } from 'react'
import ExpensesStore from '@/src/zustand/team/Expenses'
import { MessageStore } from '@/src/zustand/msgStore'
import { Expenses } from '@/src/interface/team/interface'
import QuillEditor from '@/components/Team/Editor/QuillEditor'

const CreateExpenses: React.FC = () => {
  const url = '/company/expenses/'
  let itemId: string | null = null
  const {
    formData,
    setForm,
    getItems,
    loading,
    postItem,
    results,
    resetForm,
    updateItem,
  } = ExpensesStore()

  const [isEditing, setIsEditing] = useState(false)
  const [id, setId] = useState<string | null>('')
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const { setMessage } = MessageStore()
  const [currentPage] = useState(1)
  const [page_size] = useState(5)
  const [sort] = useState('-createdAt')
  const [queryParams] = useState(
    `?page_size=${page_size}&page=${currentPage}&ordering=${sort}`
  )

  useEffect(() => {
    resetForm()
  }, [])

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
        const existingItem = results.find((item) => item._id === itemId)
        if (existingItem) {
          populateFields(existingItem)
        } else {
          await getItems(`${url}`)
          const fetchedItems = ExpensesStore.getState().results.find(
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

  const populateFields = (item: Expenses) => {
    setContent(item.description)
    setForm('name', item.name)
    setForm('amount', item.amount)
    setForm('receipt', item.receipt)
    setForm('description', item.description)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(name as keyof typeof formData, value)
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
        name: 'name',
        value: formData.name,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Expenses field',
      },
      {
        name: 'amount',
        value: formData.amount,
        rules: { blank: true, maxLength: 1000 },
        field: 'Amount field',
      },
      {
        name: 'receipt',
        value: formData.receipt,
        rules: { blank: false, maxSize: 10 },
        field: 'Receipt file',
      },

      {
        name: 'description',
        value: content,
        rules: { blank: false, maxLength: 1000 },
        field: 'Description field',
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
      updateItem(`${url}${id}${queryParams}`, data, setMessage)
    } else {
      postItem(`${url}${queryParams}`, data, setMessage)
    }
  }

  return (
    <>
      <div className="card_body">
        <div className="custom_sm_title">
          {name ? `Update ${name}` : `Create Expenses`}
        </div>

        <div className="grid-2 grid-lay">
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Name
            </label>
            <input
              className="form-input"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter name"
            />
          </div>
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Amount
            </label>
            <input
              className="form-input"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              type="number"
              placeholder="Enter amount"
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
              <label htmlFor="receipt" className="custom_btn ">
                <input
                  className="input-file"
                  type="file"
                  name="receipt"
                  id="receipt"
                  accept="image/*"
                  onChange={handleFileChange('receipt')}
                />
                <i className="bi bi-cloud-arrow-up text-2xl mr-2"></i>
                Receipt
              </label>

              <button className="custom_btn" onClick={handleSubmit}>
                Submit
              </button>
              <Link
                href="/team/company/expenses"
                className="custom_btn ml-auto "
              >
                Expenses Table
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default CreateExpenses
