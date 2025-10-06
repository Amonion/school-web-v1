'use client'
import Link from 'next/link'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { useState, useEffect } from 'react'
import AdStore from '@/src/zustand/team/Ad'
import { MessageStore } from '@/src/zustand/msgStore'
import { Ad } from '@/src/interface/team/interface'
import QuillEditor from '@/components/Team/Editor/QuillEditor'
import { apiRequest } from '@/lib/axios'

const durations = [
  { name: 'Week', days: 7 },
  { name: 'Month', days: 30 },
  { name: 'Year', days: 365 },
]
const distributions = ['Local', 'National', 'International']

const CreateAd: React.FC = () => {
  const url = '/places/ads/'
  let itemId: string | null = null
  const {
    itemFormData,
    setItemForm,
    loadingAds,
    postItem,
    itemResults,
    resetForm,
    updateItem,
  } = AdStore()
  const [isDistributionList, setDistributionList] = useState(false)
  const [isDurationList, setDurationList] = useState(false)
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
    countrySymbol: string
    currency: string
    currencySymbol: string
  }

  useEffect(() => {
    const fetchPlace = async () => {
      const query = window.location.search
      const pId = new URLSearchParams(query).get('pId')
      if (pId) {
        const response = await apiRequest<Response>(`/places/${pId}`)
        if (response?.data) {
          const data = response?.data
          setItemForm('placeId', pId)
          setItemForm('country', data.country)
          setItemForm('countrySymbol', data.countrySymbol)
          setItemForm('currency', data.currency)
          setItemForm('currencySymbol', data.currencySymbol)
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

    const initialize = async () => {
      if (itemId !== null) {
        setName(String(name))
        setId(itemId)
        setIsEditing(true)
        const existingItem = itemResults.find((item) => item._id === itemId)
        if (existingItem) {
          populateFields(existingItem)
        } else {
          const fetchedItems = AdStore.getState().itemResults.find(
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
  }, [itemId, itemResults])

  const populateFields = (item: Ad) => {
    setContent(item.description)
    setItemForm('country', item.country)
    setItemForm('category', item.category)
    setItemForm('picture', item.picture)
    setItemForm('duration', item.duration)
    setItemForm('currency', item.currency)
    setItemForm('currencySymbol', item.currencySymbol)
    setItemForm('countrySymbol', item.countrySymbol)
    setItemForm('placeId', item.placeId)
    setItemForm('description', item.description)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setItemForm(name as keyof typeof itemFormData, value)
  }

  const handleFileChange =
    (key: keyof typeof itemFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files ? e.target.files[0] : null
      setItemForm(key, file)
    }

  const handleSubmit = async (e: React.FormEvent) => {
    const inputsToValidate = [
      {
        name: 'country',
        value: itemFormData.country,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: 'Country field',
      },
      {
        name: 'placeId',
        value: itemFormData.placeId,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: 'Place Id',
      },
      {
        name: 'duration',
        value: itemFormData.duration,
        rules: { blank: false, maxLength: 1000 },
        field: 'Duration field',
      },
      {
        name: 'price',
        value: itemFormData.amount,
        rules: { blank: false, maxLength: 1000 },
        field: 'Price field',
      },
      {
        name: 'currency',
        value: itemFormData.currency,
        rules: { blank: false, maxLength: 1000 },
        field: 'Currency field',
      },
      {
        name: 'picture',
        value: itemFormData.picture,
        rules: { blank: true, minLength: 2, maxSize: 10 },
        field: 'Picture file',
      },
      {
        name: 'currencySymbol',
        value: itemFormData.currencySymbol,
        rules: { blank: false },
        field: 'Currency Symbol file',
      },
      {
        name: 'countrySymbol',
        value: itemFormData.countrySymbol,
        rules: { blank: false },
        field: 'Country symbol',
      },
      {
        name: 'description',
        value: content,
        rules: { blank: false, maxLength: 100000 },
        field: 'Description field',
      },
      {
        name: 'category',
        value: itemFormData.category,
        rules: { blank: false, maxLength: 1000 },
        field: 'Category field',
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
          {name ? `Update ${name}` : `Create Ads`}
        </div>

        <div className="grid-2 grid-lay">
          <div className="flex flex-col relative">
            <label className="label" htmlFor="">
              Ad Duration
            </label>
            <div
              onClick={() => setDurationList(!isDurationList)}
              className="form-input cursor-pointer"
            >
              {itemFormData.duration
                ? itemFormData.duration
                : 'Select Duration'}
            </div>
            {isDurationList && (
              <div className="input_drop">
                {durations.map((item, index) => (
                  <div
                    onClick={() => {
                      setDurationList(false)
                      setItemForm('duration', item.days)
                      setItemForm('durationName', item.name)
                    }}
                    key={index}
                    className="input_drop_list"
                  >
                    {item.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col relative">
            <label className="label" htmlFor="">
              Ad Distribution
            </label>
            <div
              onClick={() => setDistributionList(!isDistributionList)}
              className="form-input cursor-pointer"
            >
              {itemFormData.distribution
                ? itemFormData.distribution
                : 'Select Distribution'}
            </div>
            {isDistributionList && (
              <div className="input_drop">
                {distributions.map((item, index) => (
                  <div
                    onClick={() => {
                      setDistributionList(false)
                      setItemForm('distribution', item)
                    }}
                    key={index}
                    className="input_drop_list"
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Category
            </label>
            <input
              className="form-input"
              name="category"
              value={itemFormData.category}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter category"
            />
          </div>

          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Price
            </label>
            <input
              className="form-input"
              name="price"
              value={itemFormData.amount}
              onChange={handleInputChange}
              type="number"
              placeholder="Enter price"
            />
          </div>

          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Duration
            </label>
            <input
              className="form-input"
              name="duration"
              value={itemFormData.duration}
              onChange={handleInputChange}
              type="number"
              placeholder="Enter duration"
            />
          </div>
        </div>

        <QuillEditor
          contentValue={content}
          onChange={(content) => setContent(content)}
        />

        <div className="table-action flex flex-wrap">
          {loadingAds ? (
            <button className="custom_btn">
              <i className="bi bi-opencollective loadingAds"></i>
              Processing...
            </button>
          ) : (
            <>
              <label htmlFor="picture" className="custom_btn ">
                <input
                  className="input-file"
                  type="file"
                  name="picture"
                  id="picture"
                  accept="image/*"
                  onChange={handleFileChange('picture')}
                />
                <i className="bi bi-cloud-arrow-up text-2xl mr-2"></i>
                Picture
              </label>

              <button className="custom_btn" onClick={handleSubmit}>
                Submit
              </button>
              <Link
                href={`/team/places/adds?id=${itemFormData.placeId}&country=${itemFormData.country}`}
                className="custom_btn ml-auto "
              >
                Ads Table
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default CreateAd
