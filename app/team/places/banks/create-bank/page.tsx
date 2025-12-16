'use client'
import Link from 'next/link'
import { appendForm, FetchResponse } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { useState, useEffect } from 'react'
import _debounce from 'lodash/debounce'
import apiRequest from '@/lib/axios'
import CountryStore from '@/src/zustand/place/CountryOrigin'
import BankStore from '@/src/zustand/finance/Bank'
import { MessageStore } from '@/src/zustand/notification/Message'

const CreateBank: React.FC = () => {
  const url = '/places/banks/'
  let itemId: string | null = null
  const [isEditing, setIsEditing] = useState(false)
  const [id, setId] = useState<string | null>('')
  const [pId, setPid] = useState<string | null>('')
  const [name, setName] = useState('')
  const { setMessage } = MessageStore()
  const [isUsernameInput, setUsernameInput] = useState(true)
  const [isUsernameTaken, setUsername] = useState(false)

  const { country, getCountry, loadingCountries, updateItem, postItem } =
    CountryStore()
  const { setBankForm, itemFormData, getBank, resetBankForm } = BankStore()

  useEffect(() => {
    resetBankForm()
  }, [])

  useEffect(() => {
    const query = window.location.search
    itemId = new URLSearchParams(query).get('id')
    setId(itemId)
    const countryId = new URLSearchParams(query).get('pId')
    const countryName = new URLSearchParams(query).get('country')
    const initialize = async () => {
      if (countryId !== null) {
        setPid(countryId)
        setName(String(countryName))
        await getCountry(`/places/${countryId}`, setMessage)
      }
      if (itemId !== null) {
        setIsEditing(true)
        setId(itemId)
        setUsernameInput(false)
        getBank(`${url}${itemId}`, setMessage)
      } else {
        setId(null)
        setIsEditing(false)
      }
    }

    initialize()
  }, [itemId])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setBankForm(name as keyof typeof itemFormData, value)
  }

  const handleFileChange =
    (key: keyof typeof itemFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files ? e.target.files[0] : null
      setBankForm(key, file)
    }

  const handleUsernameSearch = _debounce(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      const response = await apiRequest<FetchResponse>(
        `/places/banks/?username=${value}`
      )
      const results = response?.data
      if (results && results?.length > 0) {
        setUsername(true)
        setMessage('Sorry! this username is already taken', false)
      } else {
        setMessage('Great! the bank username is available', true)
        setUsername(false)
        setBankForm('username', value)
      }
    },
    1000
  )

  const validateUsernameInput = () => {
    setTimeout(() => {
      setUsernameInput(false)
    }, 500)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    if (isUsernameTaken) {
      setMessage(`Please select another bank username.`, false)
      return
    }
    const inputsToValidate = !isEditing
      ? [
          {
            name: 'country',
            value: country.country,
            rules: { blank: true, maxLength: 1000 },
            field: 'Country field',
          },
          {
            name: 'continent',
            value: country.continent,
            rules: { blank: true, maxLength: 1000 },
            field: 'Continent field',
          },
          {
            name: 'countryFlag',
            value: country.countryFlag,
            rules: { blank: true, minLength: 3, maxLength: 1000 },
            field: 'countryFlag field',
          },
          {
            name: 'placeId',
            value: pId,
            rules: { blank: true, maxLength: 1000 },
            field: 'Place Id',
          },
          {
            name: 'name',
            value: itemFormData.name,
            rules: { blank: true, minLength: 2, maxLength: 1000 },
            field: 'Bank name',
          },
          {
            name: 'username',
            value: itemFormData.username,
            rules: { blank: true, minLength: 2, maxLength: 1000 },
            field: 'Bank username',
          },
          {
            name: 'picture',
            value: itemFormData.picture,
            rules: { blank: false, maxSize: 10 },
            field: 'Bank Picture',
          },
        ]
      : [
          {
            name: 'name',
            value: itemFormData.name,
            rules: { blank: true, minLength: 2, maxLength: 1000 },
            field: 'Bank name',
          },
          {
            name: 'username',
            value: itemFormData.username,
            rules: { blank: true, minLength: 2, maxLength: 1000 },
            field: 'Bank username',
          },
          {
            name: 'picture',
            value: itemFormData.picture,
            rules: { blank: false, maxSize: 10 },
            field: 'Bank Picture',
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
      await postItem(`${url}`, data, setMessage)
    }
  }

  return (
    <>
      <div className="card_body">
        <div className="custom_sm_title">
          {name ? `Update Bank` : `Create Bank`}
        </div>

        <div className="grid-2 grid-lay">
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Continent
            </label>
            {country.continent ? (
              <div className="form-input">{country.continent}</div>
            ) : (
              <div className="form-input">{itemFormData.continent}</div>
            )}
          </div>

          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Country
            </label>
            {country.country ? (
              <div className="form-input">{country.country}</div>
            ) : (
              <div className="form-input">{itemFormData.country}</div>
            )}
          </div>

          <div className="flex flex-col relative">
            <label className="label" htmlFor="">
              Username
            </label>
            {isUsernameInput ? (
              <input
                className="form-input"
                name="username"
                onChange={handleUsernameSearch}
                onBlur={validateUsernameInput}
                type="text"
                placeholder="Enter username"
              />
            ) : (
              <div
                onClick={() => setUsernameInput(true)}
                className="form-input"
              >
                {itemFormData.username}
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
              value={itemFormData.name}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter name"
            />
          </div>
        </div>

        <div className="table-action flex flex-wrap">
          {loadingCountries ? (
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
                Bank Logo
              </label>
              <button className="custom_btn" onClick={handleSubmit}>
                {isEditing ? 'Update State' : 'Create State'}
              </button>
              <Link
                href={`/team/places/banks/?country=${name}&id=${pId}`}
                className="custom_btn ml-auto "
              >
                Banks Table
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default CreateBank
