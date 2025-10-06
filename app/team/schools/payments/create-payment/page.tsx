'use client'
import Link from 'next/link'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { useState, useEffect } from 'react'
import SchoolPaymentStore from '@/src/zustand/team/SchoolPayment'
import SchoolStore from '@/src/zustand/team/School'
import { MessageStore } from '@/src/zustand/msgStore'
import { SchoolPayment, School } from '@/src/interface/team/interface'
import QuillEditor from '@/components/Team/Editor/QuillEditor'

const CreatePayment: React.FC = () => {
  const url = '/schools/payments'
  let itemId: string | null = null
  const {
    formData,
    setForm,
    getSchoolPayments,
    loading,
    postItem,
    results,
    resetForm,
    updateItem,
  } = SchoolPaymentStore()
  const { searchedSchools, searchSchool } = SchoolStore()
  const [isEditing, setIsEditing] = useState(false)
  const [id, setId] = useState<string | null>('')
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [isResultList, setResultList] = useState(false)
  const [isSearchInput, setSearchInput] = useState(true)
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
          await getSchoolPayments(`${url}`, setMessage)
          const fetchedItems = SchoolPaymentStore.getState().results.find(
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
  }, [itemId, results, getSchoolPayments])

  const populateFields = (item: SchoolPayment) => {
    setContent(item.description)
    setForm('name', item.name)
    setForm('school', item.school)
    setForm('country', item.country)
    setForm('schoolId', item.schoolId)
    setForm('schoolLogo', item.schoolLogo)
    setForm('charge', item.charge)
    setForm('amount', item.amount)
    setForm('placeId', item.placeId)
    setForm('description', item.description)
    setForm('_id', item._id)
    setForm('placeId', item.placeId)
    setSearchInput(false)
  }

  const validateSearchInput = () => {
    if (searchedSchools.length === 0 && formData.school) {
      setSearchInput(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(name as keyof typeof formData, value)
  }

  const handleResultClick = (item: School) => {
    setForm('schoolId', item._id)
    setForm('placeId', item.placeId)
    setForm('schoolLogo', String(item.logo))
    setForm('country', item.country)
    setForm('school', item.name)
    setForm('currency', item.currency)
    setForm('currencySymbol', item.currencySymbol)
    setResultList(false)
    setSearchInput(false)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setResultList(true)
    searchSchool(`/schools/search/?name=${value}`)
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
        name: 'currency',
        value: formData.currency,
        rules: { blank: false, maxLength: 1000 },
        field: 'Currency field',
      },
      {
        name: 'currencySymbol',
        value: formData.currencySymbol,
        rules: { blank: false, maxLength: 1000 },
        field: 'Currency symbol field',
      },
      {
        name: 'charge',
        value: formData.charge,
        rules: { blank: true, minLength: 1, maxLength: 1000 },
        field: 'Charge field',
      },

      {
        name: 'schoolLogo',
        value: formData.schoolLogo,
        rules: { blank: true, minLength: 2, maxSize: 10 },
        field: 'Logo file',
      },
      {
        name: 'description',
        value: content,
        rules: { blank: false, maxLength: 1000 },
        field: 'Description field',
      },
      {
        name: 'amount',
        value: formData.amount,
        rules: { blank: true, minLength: 1, maxLength: 1000 },
        field: 'Amount field',
      },
      {
        name: 'schoolId',
        value: formData.schoolId,
        rules: { blank: true, maxLength: 1000 },
        field: 'School logo field',
      },
      {
        name: 'school',
        value: formData.school,
        rules: { blank: true, maxLength: 1000 },
        field: 'School field',
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
      updateItem(`${url}/${id}${queryParams}`, data, setMessage)
    } else {
      postItem(`${url}${queryParams}`, data, setMessage)
    }
  }

  return (
    <>
      <div className="card_body">
        <div className="custom_sm_title">
          {name ? `Update ${name}` : `Create School Payment`}
        </div>

        <div className="grid-2 grid-lay">
          <div className="flex flex-col relative">
            <label className="label" htmlFor="">
              School Name
            </label>
            {isSearchInput ? (
              <input
                className="form-input"
                name="school"
                onChange={handleSearch}
                onBlur={validateSearchInput}
                type="text"
                placeholder="Search school"
              />
            ) : (
              <div onClick={() => setSearchInput(true)} className="form-input">
                {formData.school}
              </div>
            )}
            {isResultList && (
              <div className="input_drop">
                {searchedSchools.map((item, index) => (
                  <div
                    onClick={() => handleResultClick(item)}
                    key={index}
                    className="input_drop_list"
                  >
                    {item.name}
                  </div>
                ))}
              </div>
            )}
          </div>
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
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Charge
            </label>
            <input
              className="form-input"
              name="charge"
              value={formData.charge}
              onChange={handleInputChange}
              type="number"
              placeholder="Enter charge"
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
              <Link
                href="/team/schools/payments"
                className="custom_btn ml-auto "
              >
                School Payments Table
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default CreatePayment
