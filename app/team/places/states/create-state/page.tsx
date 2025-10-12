'use client'
import Link from 'next/link'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { useState, useEffect } from 'react'
import StateStore, { State } from '@/src/zustand/place/StateOrigin'
import { MessageStore } from '@/src/zustand/notification/Message'

const CreatePlace: React.FC = () => {
  const url = '/places/'
  let itemId: string | null = null
  const [isEditing, setIsEditing] = useState(false)
  const [id, setId] = useState<string | null>('')
  const [country, setCountry] = useState<string | null>('')
  const [name, setName] = useState('')
  const { setMessage } = MessageStore()
  const {
    stateForm,
    setItemForm,
    getAState,
    loadingStates,
    states,
    resetForm,
    updateItem,
    postItem,
  } = StateStore()

  useEffect(() => {
    resetForm()
  }, [])

  useEffect(() => {
    const query = window.location.search
    itemId = new URLSearchParams(query).get('id')
    setId(itemId)
    const countryId = new URLSearchParams(query).get('countryId')
    const country = new URLSearchParams(query).get('country')
    setCountry(country)
    const initialize = async () => {
      if (countryId !== null) {
        await getAState(`${url}${countryId}`, setMessage, true)
      } else if (itemId !== null) {
        setIsEditing(true)
        setId(itemId)
        const existingItem = states.find((item) => item.id === itemId)
        if (existingItem) {
          populateFields(existingItem)
        } else {
          await getAState(`${url}${itemId}`, setMessage, false)
        }
      } else {
        setId(null)
        setIsEditing(false)
        setName('')
      }
    }

    initialize()
  }, [itemId])

  const populateFields = (item: State) => {
    setItemForm('country', item.country)
    setItemForm('state', item.state)
    setItemForm('stateCapital', item.stateCapital)
    setItemForm('stateLogo', item.stateLogo)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setItemForm(name as keyof typeof stateForm, value)
  }

  const handleFileChange =
    (key: keyof typeof stateForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files ? e.target.files[0] : null
      setItemForm(key, file)
    }

  const handleSubmit = async (e: React.FormEvent) => {
    const inputsToValidate = !isEditing
      ? [
          {
            name: 'country',
            value: stateForm.country,
            rules: { blank: true, maxLength: 1000 },
            field: 'Country field',
          },
          {
            name: 'continent',
            value: stateForm.continent,
            rules: { blank: true, maxLength: 1000 },
            field: 'Continent field',
          },
          {
            name: 'countryFlag',
            value: stateForm.countryFlag,
            rules: { blank: true, minLength: 3, maxLength: 1000 },
            field: 'countryFlag field',
          },
          {
            name: 'countryCode',
            value: stateForm.countryCode,
            rules: { blank: false, maxLength: 1000 },
            field: 'Country code',
          },
          {
            name: 'countrySymbol',
            value: stateForm.countrySymbol,
            rules: { blank: true, maxLength: 1000 },
            field: 'Country symbol',
          },
          {
            name: 'currency',
            value: stateForm.currency,
            rules: { blank: true, maxLength: 1000 },
            field: 'Currency',
          },
          {
            name: 'currencySymbol',
            value: stateForm.currencySymbol,
            rules: { blank: true, maxLength: 1000 },
            field: 'Currency symbol',
          },
          {
            name: 'state',
            value: stateForm.state,
            rules: { blank: true, minLength: 3, maxLength: 1000 },
            field: 'State field',
          },
          {
            name: 'stateCapital',
            value: stateForm.stateCapital,
            rules: { blank: true, minLength: 3, maxLength: 1000 },
            field: 'Capital field',
          },
          {
            name: 'source',
            value: 'State',
            rules: { blank: false, minLength: 3, maxLength: 1000 },
            field: 'State ',
          },
          {
            name: 'stateLogo',
            value: stateForm.stateLogo,
            rules: { blank: false, maxSize: 5 },
            field: 'State Logo',
          },
        ]
      : [
          {
            name: 'state',
            value: stateForm.state,
            rules: { blank: true, minLength: 3, maxLength: 1000 },
            field: 'State field',
          },
          {
            name: 'stateCapital',
            value: stateForm.stateCapital,
            rules: { blank: false, maxLength: 1000 },
            field: 'Capital field',
          },
          {
            name: 'source',
            value: 'State',
            rules: { blank: false, minLength: 3, maxLength: 1000 },
            field: 'State ',
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
          {name ? `Update ${name}` : `Create State`}
        </div>
        <div className="grid-2 grid-lay">
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              State
            </label>
            <input
              className="form-input"
              name="state"
              value={stateForm.state}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter state"
            />
          </div>
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              State Capital
            </label>
            <input
              className="form-input"
              name="stateCapital"
              value={stateForm.stateCapital}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter capital"
            />
          </div>
        </div>

        <div className="table-action flex flex-wrap">
          {loadingStates ? (
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
                  name="stateLogo"
                  id="banner"
                  accept="image/*"
                  onChange={handleFileChange('stateLogo')}
                />
                <i className="bi bi-cloud-arrow-up text-2xl mr-2"></i>
                State Logo
              </label>
              <button className="custom_btn" onClick={handleSubmit}>
                {isEditing ? 'Update State' : 'Create State'}
              </button>
              <Link
                href={`/team/places/states/?country=${country}`}
                className="custom_btn ml-auto "
              >
                States Table
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default CreatePlace
