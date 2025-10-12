'use client'
import Link from 'next/link'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { useState, useEffect } from 'react'
import CountryStore, { Country } from '@/src/zustand/place/CountryOrigin'
import { MessageStore } from '@/src/zustand/notification/Message'

const CreateCountry: React.FC = () => {
  const url = '/places/'
  let itemId: string | null = null
  const [isEditing, setIsEditing] = useState(false)
  const [id, setId] = useState<string | null>('')
  // const [name, setName] = useState("");
  const { setMessage } = MessageStore()
  const {
    country,
    setItemForm,
    getCountries,
    loadingCountries,
    countries,
    resetForm,
    updateItem,
    postItem,
  } = CountryStore()

  useEffect(() => {
    resetForm()
  }, [])

  useEffect(() => {
    const query = window.location.search
    itemId = new URLSearchParams(query).get('id')
    setId(itemId)
    // const name = new URLSearchParams(query).get("name");

    const initialize = async () => {
      if (itemId !== null) {
        // setName(String(name));
        setId(itemId)
        setIsEditing(true)
        const existingItem = countries.find((item) => item.id === itemId)
        if (existingItem) {
          populateFields(existingItem)
        } else {
          await getCountries(`${url}`, setMessage)
          const fetchedItems = CountryStore.getState().countries.find(
            (item) => item.id === itemId
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
        // setName("");
      }
    }

    initialize()
  }, [itemId])

  const populateFields = (item: Country) => {
    setItemForm('continent', item.continent)
    setItemForm('country', item.country)
    setItemForm('countryFlag', item.countryFlag)
    setItemForm('countryCode', item.countryCode)
    setItemForm('countrySymbol', item.countrySymbol)
    setItemForm('currency', item.currency)
    setItemForm('currencySymbol', item.currencySymbol)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setItemForm(name as keyof typeof country, value)
  }

  const handleFileChange =
    (key: keyof typeof country) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files ? e.target.files[0] : null
      setItemForm(key, file)
    }

  const handleSubmit = async (e: React.FormEvent) => {
    const inputsToValidate = [
      {
        name: 'continent',
        value: country.continent,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Continent field',
      },
      {
        name: 'country',
        value: country.country,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: 'Country field',
      },
      {
        name: 'capital',
        value: country.countryCapital,
        rules: { blank: false, minLength: 0, maxLength: 1000 },
        field: 'Capital field',
      },
      {
        name: 'countryCode',
        value: country.countryCode,
        rules: { blank: false, maxLength: 1000 },
        field: 'Country code field',
      },
      {
        name: 'source',
        value: 'Country',
        rules: { blank: true, maxLength: 1000 },
        field: 'Source',
      },
      {
        name: 'countrySymbol',
        value: country.countrySymbol,
        rules: { blank: false, maxLength: 1000 },
        field: 'Country symbol field',
      },
      {
        name: 'currency',
        value: country.currency,
        rules: { blank: false, maxLength: 1000 },
        field: 'Currency false',
      },
      {
        name: 'currencySymbol',
        value: country.currencySymbol,
        rules: { blank: false, maxLength: 1000 },
        field: 'Currency symbol field',
      },
      {
        name: 'countryFlag',
        value: country.countryFlag,
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
      updateItem(`${url}${id}/`, data, setMessage)
    } else {
      await postItem(`${url}`, data, setMessage)
    }
  }

  return (
    <>
      <div className="card_body">
        <div className="custom_sm_title">
          {isEditing ? `Update Country` : `Create Country`}
        </div>
        <div className="grid-2 grid-lay">
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Contient
            </label>
            <input
              className="form-input"
              name="continent"
              value={country.continent}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter contient"
            />
          </div>
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Country
            </label>
            <input
              className="form-input"
              name="country"
              value={country.country}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter country"
            />
          </div>
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Country Code
            </label>
            <input
              className="form-input"
              name="countryCode"
              value={country.countryCode}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter country code"
            />
          </div>
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Country Symbol
            </label>
            <input
              className="form-input"
              name="countrySymbol"
              value={country.countrySymbol}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter country symbol"
            />
          </div>
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Country Currency
            </label>
            <input
              className="form-input"
              name="currency"
              value={country.currency}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter country currency"
            />
          </div>
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Currency Symbol
            </label>
            <input
              className="form-input"
              name="currencySymbol"
              value={country.currencySymbol}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter currency symbol"
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
                  name="countryFlag"
                  id="banner"
                  accept="image/*"
                  onChange={handleFileChange('countryFlag')}
                />
                <i className="bi bi-cloud-arrow-up text-2xl mr-2"></i>
                Country Flag
              </label>
              <button className="custom_btn" onClick={handleSubmit}>
                {isEditing ? `Update Country` : `Create Country`}
              </button>
              <Link href="/team/places" className="custom_btn ml-auto ">
                Countries Table
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default CreateCountry
