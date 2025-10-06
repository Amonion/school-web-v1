'use client'
import Link from 'next/link'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { useState, useEffect } from 'react'
import SchoolStore from '@/src/zustand/team/School'
import AreaStore from '@/src/zustand/team/Area'
import AcademicStore from '@/src/zustand/team/Academic'
import { MessageStore } from '@/src/zustand/msgStore'
import { School, FetchResponse, Area } from '@/src/interface/team/interface'
import apiRequest from '@/lib/axios'
import _debounce from 'lodash/debounce'
import Tiptap from '@/components/Team/Editor/TextEditor'

const CreateSchool: React.FC = () => {
  const url = '/schools/'
  let itemId: string | null = null
  const {
    schoolData,
    setForm,
    searchedSchools,
    getSchool,
    loading,
    postItem,
    schoolResults,
    resetForm,
    updateItem,
  } = SchoolStore()
  const { getAcademics, academicResults, toggleChecked, selectedItems } =
    AcademicStore()
  const { searchItem, searchedItems } = AreaStore()
  const [isEditing, setIsEditing] = useState(false)
  const [id, setId] = useState<string | null>('')
  const [institutions, setInstitutions] = useState<string[]>([])
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [isUsernameTaken, setUsername] = useState(false)
  const [isResultList, setResultList] = useState(false)
  const [isSearchInput, setSearchInput] = useState(true)
  const [isUsernameInput, setUsernameInput] = useState(true)
  const { setMessage } = MessageStore()
  const [currentPage] = useState(1)
  const [page_size] = useState(5)
  const [sort] = useState('-createdAt')
  const [queryParams] = useState(
    `?page_size=${page_size}&page=${currentPage}&ordering=${sort}`
  )

  useEffect(() => {
    getAcademics(
      `/places/academic-levels/?page_size=20&page=${currentPage}&ordering=level&inSchool=true`,
      setMessage
    )
    resetForm()
  }, [])

  useEffect(() => {
    if (schoolData.username) {
      setSearchInput(false)
      setUsernameInput(false)
      setInstitutions(schoolData.institutions)
    }
  }, [schoolData.username])

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
        const existingItem = schoolResults.find((item) => item._id === itemId)
        if (existingItem) {
          populateFields(existingItem)
        } else {
          await getSchool(`${url}${itemId}`)
        }
      } else {
        setId(null)
        setIsEditing(false)
        setName('')
      }
    }

    initialize()
  }, [itemId])

  const populateFields = (item: School) => {
    setContent(item.description)
    setForm('name', item.name)
    setForm('continent', item.continent)
    setForm('country', item.country)
    setForm('resultPointSystem', item.resultPointSystem)
    setForm('institutions', item.institutions)
    setForm('username', item.username)
    setForm('logo', item.logo)
    setForm('media', item.media)
    setForm('countryFlag', item.countryFlag)
    setForm('levels', item.levels)
    setForm('picture', item.picture)
    setForm('longitude', item.longitude)
    setForm('latitude', item.latitude)
    setForm('placeId', item.placeId)
    setForm('description', item.description)
    setForm('area', item.area)
    setForm('state', item.state)
    setForm('placeId', item.placeId)
    setSearchInput(false)
    setUsernameInput(false)
  }

  const validateUsernameInput = () => {
    if (searchedSchools.length === 0 && schoolData.username) {
      setUsernameInput(false)
    }
  }

  const handleUsernameSearch = _debounce(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      const response = await apiRequest<FetchResponse>(
        `/schools/?username=${value}`
      )
      const results = response?.data
      if (results && results.length > 0) {
        setUsername(true)
        setMessage('Sorry! this username is already taken', false)
      } else {
        setMessage('Greate! the username is available', true)
        setUsername(false)
        setForm('username', value)
      }
    },
    1000
  )

  const validateSearchInput = () => {
    // if (searchedItems.length === 0 && schoolData.country) {
    // }
    setTimeout(() => {
      setSearchInput(false)
      setResultList(false)
    }, 1000)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(name as keyof typeof schoolData, value)
  }

  const handleResultClick = (place: Area) => {
    setForm('placeId', place.id)
    setForm('continent', place.continent)
    setForm('country', place.country)
    setForm('countryFlag', place.countryFlag)
    setForm('state', place.state)
    setForm('area', place.area)
    setResultList(false)
    setSearchInput(false)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setResultList(true)
    searchItem(`/places/area/?area=${value}&page_size=50&field=area`)
  }

  const handleFileChange =
    (key: keyof typeof schoolData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files ? e.target.files[0] : null
      setForm(key, file)
    }

  const handleSubmit = async (e: React.FormEvent) => {
    const inputsToValidate = [
      {
        name: 'name',
        value: schoolData.name,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'School field',
      },
      {
        name: 'country',
        value: schoolData.country,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: 'Country field',
      },
      {
        name: 'placeId',
        value: schoolData.placeId,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: 'Place Id',
      },
      {
        name: 'longitude',
        value: schoolData.longitude,
        rules: { blank: false, maxLength: 1000 },
        field: 'Longitude field',
      },
      {
        name: 'latitude',
        value: schoolData.latitude,
        rules: { blank: false, maxLength: 1000 },
        field: 'Latitude field',
      },
      {
        name: 'landmark',
        value: schoolData.landmark,
        rules: { blank: false, maxLength: 1000 },
        field: 'Landmark field',
      },
      {
        name: 'picture',
        value: schoolData.picture,
        rules: { blank: false, maxSize: 10 },
        field: 'Picture file',
      },
      {
        name: 'media',
        value: schoolData.media,
        rules: { blank: false, maxSize: 10 },
        field: 'Media file',
      },
      {
        name: 'logo',
        value: schoolData.logo,
        rules: { blank: false, maxSize: 10 },
        field: 'Logo file',
      },
      {
        name: 'description',
        value: content,
        rules: { blank: false, maxLength: 10000 },
        field: 'Description field',
      },
      {
        name: 'username',
        value: schoolData.username,
        rules: { blank: true, minLength: 2, maxLength: 1000 },
        field: 'Username field',
      },
      {
        name: 'state',
        value: schoolData.state,
        rules: { blank: true, maxLength: 1000 },
        field: 'State field',
      },
      {
        name: 'area',
        value: schoolData.area,
        rules: { blank: true, maxLength: 1000 },
        field: 'LGA field',
      },
      {
        name: 'continent',
        value: schoolData.continent,
        rules: { blank: true, maxLength: 1000 },
        field: 'Continent field',
      },
      {
        name: 'countryFlag',
        value: schoolData.countryFlag,
        rules: { blank: true, maxSize: 5 },
        field: 'Country flag',
      },
      {
        name: 'resultPointSystem',
        value: schoolData.resultPointSystem,
        rules: { blank: true, maxSize: 5 },
        field: 'Result poin system',
      },
      {
        name: 'levels',
        value: JSON.stringify(selectedItems),
        rules: { blank: true },
        field: 'Levels',
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
    if (isUsernameTaken) {
      setMessage(
        'Sorry, please select another school username to continue',
        false
      )
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
          {name ? `Update ${name}` : `Create School`}
        </div>

        <div className="grid-2 grid-lay">
          <div className="flex flex-col relative">
            <label className="label" htmlFor="">
              Area Name
            </label>
            {isSearchInput ? (
              <input
                className="form-input"
                name="state"
                onChange={handleSearch}
                onBlur={validateSearchInput}
                type="text"
                placeholder="Search area"
              />
            ) : (
              <div onClick={() => setSearchInput(true)} className="form-input">
                {schoolData.state}
              </div>
            )}
            {isResultList && (
              <div className="input_drop">
                {searchedItems.map((item, index) => (
                  <div
                    onClick={() => handleResultClick(item)}
                    key={index}
                    className="input_drop_list"
                  >
                    {item.state}, {item.area}
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
              value={schoolData.name}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter name"
            />
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
                {schoolData.username}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Longitude
            </label>
            <input
              className="form-input"
              name="longitude"
              value={schoolData.longitude}
              onChange={handleInputChange}
              type="number"
              placeholder="Enter longitude"
            />
          </div>

          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Latitude
            </label>
            <input
              className="form-input"
              name="latitude"
              value={schoolData.latitude}
              onChange={handleInputChange}
              type="number"
              placeholder="Enter latitude"
            />
          </div>
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Result Point System
            </label>
            <input
              className="form-input"
              name="resultPointSystem"
              value={schoolData.resultPointSystem}
              onChange={handleInputChange}
              type="number"
              placeholder="Enter point system"
            />
          </div>
        </div>

        <div className="flex flex-wrap">
          {academicResults.map((item, index) => (
            <div
              onClick={() => toggleChecked(index)}
              key={index}
              className={`search_btn mb-2 mr-2 ${
                item.isChecked || institutions.includes(item.institution)
                  ? 'active'
                  : ''
              }`}
            >
              {item.institution}
            </div>
          ))}
        </div>

        <Tiptap value={content} onChange={(content) => setContent(content)} />

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
                Logo
              </label>

              <label htmlFor="media" className="custom_btn ">
                <input
                  className="input-file"
                  type="file"
                  name="media"
                  id="media"
                  accept="image/*"
                  onChange={handleFileChange('media')}
                />
                <i className="bi bi-cloud-arrow-up text-2xl mr-2"></i>
                Media
              </label>

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
              <Link href="/team/schools" className="custom_btn ml-auto ">
                Schools Table
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default CreateSchool
