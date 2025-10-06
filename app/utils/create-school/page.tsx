'use client'
import Image from 'next/image'
import { appendForm, FetchResponse, validateUsername } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

import apiRequest from '@/lib/axios'
import _debounce from 'lodash/debounce'
import { useTheme } from '@/context/ThemeProvider'
import { useRouter } from 'next/navigation'
import SchoolStore, { School } from '@/src/zustand/school/School'
import StateStore, { State } from '@/src/zustand/place/StateOrigin'
import CountryStore, { Country } from '@/src/zustand/place/CountryOrigin'
import AcademicStore from '@/src/zustand/school/Academic'
import AreaStore from '@/src/zustand/place/AreaOrigin'
import { MessageStore } from '@/src/zustand/notification/Message'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { Area } from '@/src/zustand/place/Area'
import validator from 'validator'

const CreateSchool: React.FC = () => {
  const url = '/schools/'
  let username: string | null = null
  const {
    schoolData,
    setForm,
    getSchool,
    loading,
    postItem,
    searchSchool,
    updateItem,
    schoolResults,
    searchedSchoolResult,
  } = SchoolStore()
  const { states, getStates } = StateStore()
  const { countries, getCountries } = CountryStore()
  const { getAcademics, academicResults, toggleChecked, selectedItems } =
    AcademicStore()
  const { area, getArea } = AreaStore()
  const [isEditing, setIsEditing] = useState(false)
  const { setMessage } = MessageStore()
  const [isCountryList, setCountryList] = useState(false)
  const [showStates, setShowStates] = useState(false)
  const [showAreas, setShowAreas] = useState(false)
  const [isSchoolList, setSchoolList] = useState(false)
  const { bioUserState, user, bioUser } = AuthStore()
  const [isCompleted, setIsCompleted] = useState(false)
  const [previewProfileUrl, setPreviewProfileUrl] = useState<string | null>(
    null
  )
  const [isAcademicList, setAcademicList] = useState(false)
  const [isChanged, setIsChanged] = useState(false)
  const { theme } = useTheme()
  const [schoolName, setSchoolName] = useState('')
  const [fileName, setFileName] = useState('')
  const nameRef = useRef<HTMLInputElement>(null)

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  )
  const router = useRouter()

  useEffect(() => {
    getCountries(
      `/places/countries/?country=&page_size=350&field=country&sort=country`,
      setMessage
    )

    if (!navigator.geolocation) {
      setMessage(
        'Sorry, geolocation is not supported by your browser, user another browser or device to continue.',
        false
      )
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setLocation({ lat: latitude, lng: longitude })
      },
      (err) => {
        setMessage(err.message, false)
      },
      {
        enableHighAccuracy: true, // better accuracy
        timeout: 10000, // 10 seconds
        maximumAge: 0, // don’t use cached location
      }
    )
  }, [])

  useEffect(() => {
    if (
      bioUserState &&
      bioUserState.pendingOffice &&
      bioUserState.pendingOffice.type === 'School'
    ) {
      setIsEditing(true)
    } else {
      setIsEditing(false)
    }
  }, [bioUserState])

  useEffect(() => {
    if (schoolData && schoolData.country) {
      getAcademics(
        `/academic-levels/?page_size=50&page=1&country=${schoolData?.country}&ordering=level&inSchool=true`,
        setMessage
      )
    }
  }, [schoolData?.country])

  useEffect(() => {
    setForm('levels', selectedItems)
  }, [selectedItems])

  useEffect(() => {
    const query = window.location.search
    username = new URLSearchParams(query).get('username')
    const initialize = async () => {
      if (username !== null) {
        setIsEditing(true)
        const existingItem = schoolResults.find((item) => item._id === username)
        if (existingItem) {
          SchoolStore.setState({ schoolData: existingItem })
        } else {
          await getSchool(`${url}${username}`)
        }
      } else if (bioUserState?.pendingOffice) {
        await getSchool(`${url}${bioUserState.pendingOffice.username}`)
      } else if (bioUserState?.processingOffice && !username) {
        router.push('/utils')
      } else {
        setIsEditing(false)
      }
    }

    initialize()
  }, [username])

  useEffect(() => {
    if (
      schoolData?.name &&
      schoolData?.username &&
      schoolData?.levels &&
      schoolData?.country &&
      schoolData?.state &&
      schoolData?.area &&
      schoolData?.email &&
      schoolData?.address &&
      schoolData?.phone &&
      schoolData?.idCard &&
      schoolData?.document
    ) {
      setIsCompleted(true)
    } else {
      setIsCompleted(false)
    }
  }, [schoolData])

  const selectState = (state: State) => {
    setForm('state', state.state)
    setShowStates(false)
    getArea(
      `/places/area/?state=${state.state}&page_size=350&field=area&sort=area`
    )
    setForm('area', '')
    setIsChanged(true)
  }

  const selectArea = (area: Area) => {
    setForm('area', area.area)
    setForm('placeId', area.id)
    setShowAreas(false)
    setIsChanged(true)
  }

  const handleUsernameSearch = _debounce(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const validation = validateUsername(e.target.value)
      if (!validation.valid) {
        setMessage(validation.message, false)
        return
      }
      const value = e.target.value
        ? `${e.target.value}_${schoolData.state.slice(0, 3)}_${
            schoolData.countrySymbol
          }`
        : ''
      const response = await apiRequest<FetchResponse>(
        `/users/username/${value}`
      )
      const results = response?.data
      if (results && results.length > 0) {
        setForm('username', '')
        setMessage('Sorry! this username is already taken', false)
      } else {
        setMessage(`Great! the username ${value} is available`, true)
        setIsChanged(true)
        setForm('username', value)
      }
    },
    1000
  )

  const selectCountry = (country: Country) => {
    if (!location) {
      setMessage(
        'Please turn on your location to continue registration.',
        false
      )
      return
    }
    setForm('continent', country.continent)
    setForm('country', country.country)
    setForm('countryFlag', country.countryFlag)
    setForm('countrySymbol', country.countrySymbol)
    getStates(
      `/places/state/?country=${country.country}&page_size=350&field=state&sort=state`,
      setMessage
    )
    setForm('state', '')
    setCountryList(false)
    setIsChanged(true)
  }

  const selectSchool = async (school: School) => {
    setForm('name', school.name)
    setForm('logo', school.logo)
    setForm('_id', school._id)
    setIsEditing(true)
    setSchoolList(false)
    setIsChanged(true)
    setIsEditing(true)
    if (nameRef.current) {
      nameRef.current.value = '' // clear input
    }
  }

  const setSchool = async () => {
    setForm('name', schoolName)
    setForm('_id', '')
    setSchoolList(false)
    setIsChanged(true)
    setIsEditing(false)
  }

  const handleSearchSchool = _debounce(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setSchoolName(value)
      if (!value) {
        setSchoolList(false)
        return
      }
      setSchoolList(true)
      searchSchool(
        `/schools/?name=${value}&state=${schoolData.state}&isVerified=false&isApplied=false`
      )
    },
    1000
  )

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(name as keyof typeof schoolData, value)
    setIsChanged(true)
  }

  const handleFileChange =
    (key: keyof typeof schoolData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files ? e.target.files[0] : null
      setFileName(String(file?.name))
      setForm(key, file)
      setIsChanged(true)
    }

  const handleProfileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const localUrl = URL.createObjectURL(file)
      setPreviewProfileUrl(localUrl)
      setForm('idCard', file)
      setIsChanged(true)
    }
  }

  const handleSubmit = async () => {
    if (!location) {
      setMessage('Turn on your device location to continue registration', false)
      return
    }

    if (!validator.isEmail(schoolData.email)) {
      setMessage(
        `Sorry, ${schoolData.email} is not a valid email address, please try again.`,
        false
      )
      return
    }

    const inputsToValidate = [
      {
        name: 'type',
        value: 'School',
        rules: { blank: true, maxLength: 100 },
        field: 'ID Card',
      },
      {
        name: 'idCard',
        value: schoolData.idCard,
        rules: { blank: true, maxLength: 100 },
        field: 'ID Card',
      },
      {
        name: 'document',
        value: schoolData.document,
        rules: { blank: true, maxLength: 100 },
        field: 'Document',
      },
      {
        name: 'bioUserId',
        value: String(bioUserState?.bioUserId),
        rules: { blank: true, maxLength: 100 },
        field: 'Username',
      },
      {
        name: 'userId',
        value: String(user?._id),
        rules: { blank: true, maxLength: 100 },
        field: 'Username',
      },
      {
        name: 'bioUserPicture',
        value: String(bioUser?.bioUserPicture),
        rules: { blank: true },
        field: 'User picture',
      },
      {
        name: 'bioUserUsername',
        value: String(bioUser?.bioUserUsername),
        rules: { blank: true, maxLength: 100 },
        field: 'Username',
      },
      {
        name: 'isNew',
        value: true,
        rules: { blank: false, maxLength: 100 },
        field: 'Is New',
      },
      {
        name: 'name',
        value: schoolData.name,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'School field',
      },
      {
        name: 'placeId',
        value: schoolData.placeId,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: 'Place Id',
      },
      {
        name: 'createdLocation',
        value: JSON.stringify(location),
        rules: { blank: false, maxLength: 1000 },
        field: 'Location',
      },
      {
        name: 'lng',
        value: Number(location?.lng),
        rules: { blank: false, maxLength: 1000 },
        field: 'Location',
      },
      {
        name: 'lat',
        value: Number(location?.lat),
        rules: { blank: false, maxLength: 1000 },
        field: 'Location',
      },
      {
        name: 'levels',
        value: JSON.stringify(schoolData.levels),
        rules: { blank: false },
        field: 'Levels',
      },
      {
        name: 'address',
        value: schoolData.address,
        rules: { blank: true, minLength: 5, maxLength: 1000 },
        field: 'Address field',
      },
      {
        name: 'email',
        value: schoolData.email,
        rules: { blank: true, minLength: 8, maxLength: 1000 },
        field: 'Email field',
      },
      {
        name: 'bioUserDisplayName',
        value: String(bioUser?.bioUserDisplayName),
        rules: { blank: true, minLength: 8, maxLength: 1000 },
        field: 'Email field',
      },
      {
        name: 'bioUserIntro',
        value: String(bioUser?.bioUserIntro),
        rules: { blank: true, minLength: 8, maxLength: 1000 },
        field: 'Email field',
      },
      {
        name: 'phone',
        value: schoolData.phone,
        rules: { blank: true, minLength: 7, maxLength: 1000 },
        field: 'Phone field',
      },
      {
        name: 'username',
        value: schoolData.username,
        rules: { blank: true, minLength: 2, maxLength: 1000 },
        field: 'Username field',
      },
      {
        name: 'continent',
        value: schoolData.continent,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: 'Continent field',
      },
      {
        name: 'country',
        value: schoolData.country,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: 'Country field',
      },
      {
        name: 'countrySymbol',
        value: schoolData.countrySymbol,
        rules: { blank: true, maxLength: 1000 },
        field: 'Country field',
      },
      {
        name: 'countryFlag',
        value: schoolData.countryFlag,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: 'Country flag',
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
    ]
    if (isEditing) {
      inputsToValidate.push({
        name: 'officeId',
        value: schoolData._id,
        rules: { blank: true, maxLength: 1000 },
        field: 'Office Id',
      })
    }
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
    const data = appendForm(inputsToValidate)
    if (isEditing) {
      updateItem(`${url}${schoolData._id}`, data, setMessage, () =>
        router.push(
          `/utils/create-school/media?username=${schoolData.username}`
        )
      )
    } else {
      postItem(`${url}`, data, setMessage, () =>
        router.push(
          `/utils/create-school/media?username=${schoolData.username}`
        )
      )
    }
  }

  return (
    <>
      <div className="card_body mb-2 sharp flex-1 flex flex-col">
        <div className="w-full text-[var(--text-secondary)] text-xl sm:text-2xl mb-4 flex justify-center text-center ">
          {isEditing ? 'Edit School' : 'Create School'}
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4 w-full ">
          <div className="flex flex-col w-full ">
            <div className="flex flex-col relative mb-4">
              <label className="label flex items-center w-full" htmlFor="">
                Country of School{' '}
              </label>
              <div
                onClick={() => {
                  setCountryList(!isCountryList)
                  setShowStates(false)
                  setShowAreas(false)
                  setAcademicList(false)
                }}
                className="form-input cursor-pointer"
              >
                {schoolData?.country ? schoolData?.country : 'Select Country'}
                <i className="ml-auto bi bi-caret-down-fill"></i>
              </div>

              {isCountryList && (
                <div className="w-full z-30 absolute left-0 top-[70px] border border-[var(--border)] bg-[var(--primary)] max-h-[300px] overflow-auto rounded-[5px] search">
                  {countries.map((item, index) => (
                    <div
                      onClick={() => selectCountry(item)}
                      key={index}
                      className="input_drop_list"
                    >
                      {item.countryFlag && (
                        <Image
                          className="mr-3"
                          src={String(item.countryFlag)}
                          alt="Captured"
                          sizes="100vw"
                          width={0}
                          height={0}
                          style={{ width: '60px', maxWidth: '30px' }}
                        />
                      )}
                      {item.country}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col relative mb-4">
              <label className="label flex items-center w-full" htmlFor="">
                State of School{' '}
              </label>
              <div
                onClick={() => {
                  if (!schoolData?.country) {
                    setMessage('Select country first to continue', false)
                  } else {
                    setShowStates(!showStates)
                    setShowAreas(false)
                    setAcademicList(false)
                  }
                }}
                className="form-input cursor-pointer"
              >
                {schoolData?.state ? schoolData?.state : 'Select State'}
                <i className="ml-auto bi bi-caret-down-fill"></i>
              </div>

              {showStates && (
                <div className="w-full z-30 absolute left-0 top-[70px] border border-[var(--border)] bg-[var(--primary)] max-h-[300px] overflow-auto rounded-[5px] search">
                  {states.map((item, index) => (
                    <div
                      onClick={() => selectState(item)}
                      key={index}
                      className="input_drop_list"
                    >
                      {item.state}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col relative mb-4">
              <label className="label flex items-center w-full" htmlFor="">
                Area of School{' '}
              </label>
              <div
                onClick={() => {
                  if (!schoolData.state) {
                    setMessage('Select state first to continue', false)
                  } else {
                    setShowAreas(!showAreas)
                    setAcademicList(false)
                  }
                }}
                className="form-input cursor-pointer"
              >
                {schoolData?.area ? schoolData?.area : 'Select Area'}
                <i className="ml-auto bi bi-caret-down-fill"></i>
              </div>

              {showAreas && (
                <div className="w-full z-30 absolute left-0 top-[70px] border border-[var(--border)] bg-[var(--primary)] max-h-[300px] overflow-auto rounded-[5px] search">
                  {area.map((item, index) => (
                    <div
                      onClick={() => selectArea(item)}
                      key={index}
                      className="input_drop_list"
                    >
                      {item.area}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative mb-4">
              <label htmlFor="">Address</label>
              <input
                onChange={handleInputChange}
                name="address"
                value={schoolData?.address}
                type="text"
                placeholder="Enter school address"
                className="form-input"
              />
            </div>

            <div className="flex flex-col relative mb-4">
              <label className="label flex items-center w-full" htmlFor="">
                Academic Levels
              </label>
              <div
                onClick={() => {
                  if (!schoolData.area) {
                    setMessage('Select area first to continue', false)
                  } else {
                    setAcademicList(!isAcademicList)
                  }
                }}
                className="form-input cursor-pointer"
              >
                Select academic levels
                <i className="ml-auto bi bi-caret-down-fill"></i>
              </div>
              {schoolData?.levels.length > 0 && (
                <div className="flex items-center mt-1 flex-wrap">
                  {schoolData?.levels.map((item, index) => (
                    <div
                      key={index}
                      className="px-2 py-[1px] rounded-[25px] mb-1 mr-2 border text-sm border-[var(--border)]"
                    >
                      {item.levelName}
                    </div>
                  ))}
                </div>
              )}
              {isAcademicList && (
                <div className="input_drop">
                  {academicResults.map((item, index) => (
                    <div
                      onClick={() => {
                        toggleChecked(index)
                      }}
                      key={index}
                      className="input_drop_list"
                    >
                      <div
                        className={`checkbox mt-1 ${
                          item.isChecked ? 'active' : ''
                        }`}
                      >
                        {item.isChecked && (
                          <i className="bi bi-check text-white text-lg"></i>
                        )}
                      </div>
                      {item.levelName}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="relative mb-4">
              <label htmlFor="" className="text-sm  text-[var(--custom)]">
                Write school name and click the search icon if it did not appear
                in the drop list
              </label>
              <div
                onClick={() => {
                  if (!schoolData.area) {
                    setMessage('Select area first to search for school', false)
                  }
                }}
                className={`form-input`}
              >
                <input
                  type="search"
                  onChange={handleSearchSchool}
                  ref={nameRef}
                  disabled={schoolData?.levels.length === 0}
                  className={`outline-none border-none bg-transparent flex-1 `}
                  placeholder="Write school name or select from the list below"
                />
                {searchedSchoolResult.length === 0 && (
                  <i
                    onClick={() => {
                      if (!schoolData?.area) {
                        setMessage(
                          'Select area first to search for school',
                          false
                        )
                      } else {
                        setSchool()
                        if (nameRef.current) {
                          nameRef.current.value = '' // clear input
                        }
                      }
                    }}
                    className="bi bi-search common-icon text-sm cursor-pointer"
                  ></i>
                )}
              </div>

              {schoolData?.name && (
                <div className="selected_item">
                  <div className="mr-3">School: </div>
                  {schoolData?.name}
                </div>
              )}

              {isSchoolList && searchedSchoolResult.length > 0 && (
                <div className="w-full z-30 absolute left-0 top-[90px] border border-[var(--border)] bg-[var(--primary)] max-h-[300px] overflow-auto rounded-[5px] search">
                  {searchedSchoolResult.map((item, index) => (
                    <div
                      onClick={() => selectSchool(item)}
                      key={index}
                      className="input_drop_list"
                    >
                      {item.logo && (
                        <Image
                          className="mr-5"
                          src={String(item.logo)}
                          alt="Captured"
                          sizes="100vw"
                          width={0}
                          height={0}
                          style={{ width: '100px', maxWidth: '50px' }}
                        />
                      )}
                      {item.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col mb-4 relative">
              <label className="label" htmlFor="">
                Username: {schoolData?.username}
              </label>
              <input
                className="form-input"
                name="username"
                onChange={handleUsernameSearch}
                type="text"
                disabled={!schoolData?.name}
                placeholder={
                  schoolData?.username ? schoolData?.username : 'Enter username'
                }
              />
              <label htmlFor="" className="text-[12px]  text-[var(--custom)]">
                This should be your school unique name, no space, should be at
                least 3 characters.
              </label>
            </div>

            <div className="relative mb-4">
              <label htmlFor="">Phone</label>
              <input
                onChange={handleInputChange}
                value={schoolData?.phone}
                type="text"
                name="phone"
                placeholder="Enter school phone number"
                className="form-input"
              />
            </div>
            <div className="relative">
              <label htmlFor="">Email</label>
              <input
                onChange={handleInputChange}
                value={schoolData?.email}
                type="text"
                name="email"
                placeholder="Enter school email"
                className="form-input"
              />
            </div>
          </div>
        </div>

        {schoolData?.name && schoolData?.username && (
          <div className="flex flex-col items-center">
            {' '}
            <div className="w-full relative mb-4 flex items-center justify-center flex-col">
              <Image
                src={
                  previewProfileUrl
                    ? previewProfileUrl
                    : schoolData?.idCard
                    ? String(schoolData?.idCard)
                    : theme === 'dark'
                    ? '/images/idDark.png'
                    : '/images/idLight.png'
                }
                alt="Profile Background"
                sizes="100vw"
                className="object-contain  rounded-[5px]  mx-auto mb-2"
                height={0}
                width={0}
                style={{ height: '150px', width: '300px' }}
              />
              <label htmlFor="id" className="text-center custom_btn neutral">
                Upload Government ID Card
              </label>
              <input
                id="id"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfileFileChange}
              />
            </div>
            <div className="mb-1 line-clamp-1 overflow-ellipsis">
              {fileName ? (
                fileName
              ) : schoolData?.document ? (
                <div className="flex items-center">
                  <i className="bi bi-file-earmark-pdf text-[var(--custom)] mr-2"></i>{' '}
                  <Link href={String(schoolData?.document)}>
                    Uploaded Document
                  </Link>
                </div>
              ) : (
                ''
              )}
            </div>
            <label
              htmlFor="document"
              className="custom_btn text-center justify-center"
            >
              <input
                className="input-file"
                type="file"
                name="document"
                id="document"
                accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
                onChange={handleFileChange('document')}
              />
              <i className="bi bi-cloud-arrow-up text-2xl mr-2"></i>
              Upload Document of Ownership
            </label>
          </div>
        )}

        {/* <div className="justify-center flex flex-wrap">
          {loading ? (
            <button className="custom_btn neutral">
              <i className="bi bi-opencollective loading"></i>
              Processing...
            </button>
          ) : (
            <>
              <button
                className={`custom_btn neutral ${
                  isCompleted ? '' : 'disabled'
                }`}
                onClick={() => {
                  if (isCompleted) {
                    handleSubmit()
                  }
                }}
              >
                Submit Application
              </button>
            </>
          )}
        </div> */}
      </div>

      <div className="card_body sharp mt-auto flex justify-end">
        {loading ? (
          <div className={`custom_btn neutral disabled`}>Processing</div>
        ) : isCompleted && !isChanged ? (
          <Link
            href={'/utils/create-school/media'}
            className={`custom_btn neutral`}
          >
            Next
          </Link>
        ) : isCompleted && isChanged ? (
          <div onClick={handleSubmit} className={`custom_btn neutral`}>
            Save & Proceed
          </div>
        ) : (
          <div className={`custom_btn neutral disabled`}>Save & Proceed</div>
        )}
      </div>
    </>
  )
}

export default CreateSchool
