'use client'
import Link from 'next/link'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { useState, useEffect } from 'react'
import PaymentStore from '@/src/zustand/team/Payment'
import { MessageStore } from '@/src/zustand/msgStore'
import { Payment } from '@/src/interface/team/interface'
import QuillEditor from '@/components/Team/Editor/QuillEditor'
import { apiRequest } from '@/lib/axios'
const CreatePlace: React.FC = () => {
  const url = '/places/payments/'
  let itemId: string | null = null
  const {
    formData,
    setForm,
    getPayments,
    getAPayment,
    loading,
    postItem,
    results,
    resetForm,
    updateItem,
  } = PaymentStore()
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

  interface Response {
    id?: string
    country: string
    countryFlag: string
    countrySymbol: string
    currency: string
    currencySymbol: string
  }

  useEffect(() => {
    if (formData._id) {
      setContent(formData.description)
    }
  }, [formData])

  useEffect(() => {
    const fetchPlace = async () => {
      const query = window.location.search
      const pId = new URLSearchParams(query).get('pId')
      if (pId) {
        const response = await apiRequest<Response>(`/places/${pId}`)
        if (response?.data) {
          const data = response?.data
          setForm('placeId', pId)
          setForm('country', data.country.trim())
          setForm('countryFlag', data.countryFlag)
          setForm('countrySymbol', data.countrySymbol.trim())
          setForm('currency', data.currency.trim())
          setForm('currencySymbol', data.currencySymbol.trim())
        }
      }
    }
    fetchPlace()
    resetForm()
  }, [])

  useEffect(() => {
    const query = window.location.search
    itemId = new URLSearchParams(query).get('id')
    const name = new URLSearchParams(query).get('name')
    setId(itemId)

    const initialize = async () => {
      if (itemId !== null) {
        setName(String(name))
        setId(itemId)
        setIsEditing(true)
        const existingItem = results.find((item) => item._id === itemId)
        if (existingItem) {
          populateFields(existingItem)
        } else {
          await getAPayment(`${url}${itemId}`)
        }
      } else {
        setId(null)
        setIsEditing(false)
        setName('')
      }
    }

    initialize()
  }, [itemId, results, getPayments])

  const populateFields = (item: Payment) => {
    setContent(item.description)
    setForm('name', item.name)
    setForm('title', item.title)
    setForm('description', item.description)
    setForm('duration', item.duration)
    setForm('durationName', item.durationName)
    setForm('country', item.country)
    setForm('amount', item.amount)
    setForm('logo', item.logo)
    setForm('charge', item.charge)
    setForm('countryFlag', item.countryFlag)
    setForm('placeId', item.placeId)
    setForm('description', item.description)
    setForm('countrySymbol', item.countrySymbol)
    setForm('currency', item.currency)
    setForm('currencySymbol', item.currencySymbol)
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
        field: 'Payment field',
      },
      {
        name: 'duration',
        value: formData.duration,
        rules: { blank: false, maxLength: 100 },
        field: 'Duration field',
      },
      {
        name: 'durationName',
        value: formData.durationName,
        rules: { blank: false, maxLength: 100 },
        field: 'Duration name',
      },
      {
        name: 'title',
        value: formData.title,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Title field',
      },
      {
        name: 'country',
        value: formData.country,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: 'Country field',
      },
      {
        name: 'placeId',
        value: formData.placeId,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: 'Place Id',
      },
      {
        name: 'amount',
        value: formData.amount,
        rules: { blank: true, maxLength: 1000 },
        field: 'Amount field',
      },
      {
        name: 'charge',
        value: formData.charge,
        rules: { blank: false, maxLength: 1000 },
        field: 'Charge field',
      },
      {
        name: 'logo',
        value: formData.logo,
        rules: { blank: false, maxSize: 10 },
        field: 'Logo file',
      },
      {
        name: 'description',
        value: content,
        rules: { blank: false, maxLength: 1000 },
        field: 'Description field',
      },
      {
        name: 'countrySymbol',
        value: formData.countrySymbol,
        rules: { blank: true, maxLength: 1000 },
        field: 'Country symbol field',
      },
      {
        name: 'currency',
        value: formData.currency,
        rules: { blank: true, maxLength: 1000 },
        field: 'Currency field',
      },
      {
        name: 'currencySymbol',
        value: formData.currencySymbol,
        rules: { blank: true, maxLength: 1000 },
        field: 'Currency symbol field',
      },
      {
        name: 'countryFlag',
        value: formData.countryFlag,
        rules: { blank: true, maxSize: 5 },
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
      updateItem(`${url}${id}${queryParams}`, data, setMessage)
    } else {
      postItem(`${url}${queryParams}&return=many`, data, setMessage)
    }
  }

  return (
    <>
      <div className="card_body">
        <div className="custom_sm_title">
          {name ? `Update ${name}` : `Create Payment`}
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
              Title
            </label>
            <input
              className="form-input"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter payment title"
            />
          </div>
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Amount
            </label>
            <input
              className="form-input"
              name="amount"
              value={formData.amount > 0 ? formData.amount : ''}
              onChange={handleInputChange}
              type="number"
              placeholder="Enter amount"
            />
          </div>
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Charge
            </label>
            <input
              className="form-input"
              name="charge"
              value={formData.charge > 0 ? formData.charge : ''}
              onChange={handleInputChange}
              type="number"
              placeholder="Enter charge"
            />
          </div>
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Duration
            </label>
            <input
              className="form-input"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              type="number"
              placeholder="Enter duration"
            />
          </div>
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Duration Name
            </label>
            <input
              className="form-input"
              name="durationName"
              value={formData.durationName}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter duration name"
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
              <label htmlFor="banner" className="custom_btn ">
                <input
                  className="input-file"
                  type="file"
                  name="logo"
                  id="banner"
                  accept="image/*"
                  onChange={handleFileChange('logo')}
                />
                <i className="bi bi-cloud-arrow-up text-2xl mr-2"></i>
                Payment Logo
              </label>
              <button className="custom_btn" onClick={handleSubmit}>
                Create Payment
              </button>
              <Link
                href={`/team/places/payments/?id=${formData.placeId}&country=${formData.country}`}
                className="custom_btn ml-auto "
              >
                Payment Table
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default CreatePlace
