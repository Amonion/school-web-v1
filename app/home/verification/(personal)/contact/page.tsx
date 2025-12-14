'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { appendForm } from '@/lib/helpers'
import { BioUserStore } from '@/src/zustand/user/BioUser'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import AreaStore, { Area } from '@/src/zustand/place/Area'
import { validateInputs } from '@/lib/validation'
import { Country } from '@/src/zustand/place/CountryOrigin'
import CountryStore from '@/src/zustand/place/Country'
import { State } from '@/src/zustand/place/StateOrigin'
import StateStore from '@/src/zustand/place/State'
import { useRouter } from 'next/navigation'

export default function Origin() {
  const { bioUserForm, setForm, loading, updateMyBioUser } = BioUserStore()
  const { user, bioUser, bioUserState } = AuthStore()
  const { setMessage } = MessageStore()
  const { setAlert } = AlartStore()
  const url = '/biousers/'
  const [isCountryList, setCountryList] = useState(false)
  const [isStateList, setStateList] = useState(false)
  const [isAreaList, setIsAreaList] = useState(false)
  const [isCEdit, setCEdit] = useState(false)
  const { getArea, area } = AreaStore()
  const { countries, getCountries } = CountryStore()
  const { states, getStates } = StateStore()
  const router = useRouter()

  useEffect(() => {
    if (!bioUserState) return
    if (!bioUserState.isContact) {
      setCEdit(true)
    } else {
      setCEdit(false)
    }
  }, [bioUserState])

  useEffect(() => {
    if (countries.length === 0) {
      getCountries(
        `/places/countries/?country=&page_size=350&field=country&sort=country`,
        setMessage
      )
    }
  }, [])
  useEffect(() => {
    if (bioUser) {
      BioUserStore.setState({ bioUserForm: bioUser })
    }
  }, [])

  useEffect(() => {
    if (bioUser?.residentCountry) {
      getStates(
        `/places/state/?country=${bioUser.residentCountry}&page_size=350&field=state&sort=state`,
        setMessage
      )
    }
  }, [bioUser])

  useEffect(() => {
    if (bioUser?.residentState) {
      getArea(
        `/places/area/?state=${bioUser.residentState}&page_size=350&field=area&sort=area`
      )
    }
  }, [bioUser])

  const selectCountry = (country: Country) => {
    setForm('residentContinent', country.continent)
    setForm('residentCountry', country.country)
    setForm('residentCountryFlag', String(country.countryFlag))
    setForm('residentCountrySymbol', country.countrySymbol)
    setCountryList(false)

    getStates(
      `/places/state/?country=${country.country}&page_size=350&field=state&sort=state`,
      setMessage
    )
    setForm('residentState', '')
  }

  const selectState = (state: State) => {
    setForm('residentState', state.state)
    setStateList(false)
    getArea(
      `/places/area/?state=${state.state}&page_size=350&field=area&sort=area`
    )
  }

  const selectArea = (area: Area) => {
    setForm('residentArea', area.area)
    setForm('residentPlaceId', area.id)
    setIsAreaList(false)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(name as keyof typeof bioUser, value)
  }

  const submitData = async (data: FormData) => {
    updateMyBioUser(`${url}${bioUser?._id}`, data, setMessage, () =>
      router.replace(`/home/verification/related`)
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    if (user && user.isVerified) {
      setMessage('To update these information, please contact support', false)
      return
    }
    const inputsToValidate = [
      {
        name: 'residentContinent',
        value: bioUserForm.residentContinent,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Continent name',
      },
      {
        name: 'residentCountry',
        value: bioUserForm.residentCountry,
        rules: { blank: true, minLength: 2, maxLength: 100 },
        field: 'country name',
      },
      {
        name: 'residentCountryFlag',
        value: bioUserForm.residentCountryFlag,
        rules: { blank: true, minLength: 2, maxLength: 100 },
        field: 'country name',
      },
      {
        name: 'residentCountrySymbol',
        value: bioUserForm.residentCountrySymbol,
        rules: { blank: true, minLength: 2, maxLength: 100 },
        field: 'country name',
      },
      {
        name: 'residentState',
        value: bioUserForm.residentState,
        rules: { blank: true, minLength: 2, maxLength: 100 },
        field: 'State name',
      },
      {
        name: 'residentArea',
        value: bioUserForm.residentArea,
        rules: { blank: true, minLength: 2, maxLength: 100 },
        field: 'Area name',
      },
      {
        name: 'phone',
        value: bioUserForm.phone,
        rules: { blank: true, minLength: 2, maxLength: 100 },
        field: 'Phone name',
      },
      {
        name: 'residentAddress',
        value: bioUserForm.residentAddress,
        rules: { blank: true, minLength: 3, maxLength: 500 },
        field: 'Address',
      },
      {
        name: 'residentPlaceId',
        value: bioUserForm.residentPlaceId,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Place ID',
      },
      {
        name: 'action',
        value: 'Contact',
        rules: { blank: true, minLength: 1 },
        field: 'Bio Data',
      },
      {
        name: 'isContact',
        value: true,
        rules: { blank: false, maxLength: 100 },
        field: 'Is Contact',
      },
      {
        name: 'ID',
        value: String(user?._id),
        rules: { blank: true },
        field: 'ID ',
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
    setAlert(
      'Warning',
      'You will need to contact support to edit this information after verification is approved!',
      true,
      () => submitData(data)
    )
  }

  return (
    <>
      {isCEdit ? (
        <div>
          <div className="grid-2 grid-lay">
            <div className="flex flex-col w-full ">
              <div className="flex flex-col relative mb-4">
                <label className="label flex items-center w-full" htmlFor="">
                  Country of Residence{' '}
                </label>
                <div
                  onClick={() => {
                    setCountryList(!isCountryList)
                    setStateList(false)
                    setIsAreaList(false)
                  }}
                  className="form-input cursor-pointer"
                >
                  {bioUserForm.residentCountry
                    ? bioUserForm.residentCountry
                    : 'Select Country'}
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
            </div>

            <div className="flex flex-col w-full ">
              <div className="flex flex-col relative mb-4">
                <label className="label flex items-center w-full" htmlFor="">
                  State of Residence{' '}
                </label>
                <div
                  onClick={() => {
                    setStateList(!isStateList)
                    setCountryList(false)
                    setIsAreaList(false)
                  }}
                  className="form-input cursor-pointer"
                >
                  {bioUserForm.residentState
                    ? bioUserForm.residentState
                    : 'Select State'}
                  <i className="ml-auto bi bi-caret-down-fill"></i>
                </div>

                {isStateList && (
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
            </div>

            <div className="flex flex-col w-full ">
              <div className="flex flex-col relative mb-4">
                <label className="label flex items-center w-full" htmlFor="">
                  Area of Origin{' '}
                </label>
                <div
                  onClick={() => {
                    setIsAreaList(!isAreaList)
                    setCountryList(false)
                    setStateList(false)
                  }}
                  className="form-input cursor-pointer"
                >
                  {bioUserForm.residentArea
                    ? bioUserForm.residentArea
                    : 'Select Area'}
                  <i className="ml-auto bi bi-caret-down-fill"></i>
                </div>

                {isAreaList && (
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
            </div>

            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Resident Address
              </label>
              <input
                className="form-input"
                name="residentAddress"
                value={bioUserForm.residentAddress}
                onChange={handleInputChange}
                type="text"
                placeholder="Resident address"
              />
            </div>

            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Phone Number
              </label>
              <input
                className="form-input"
                name="phone"
                value={bioUserForm.phone}
                onChange={handleInputChange}
                type="tel"
                placeholder="Phone number"
              />
            </div>
          </div>

          {loading ? (
            <div className="btn">
              <i className="bi bi-opencollective loading  text-md"></i>
              <div>Processing...</div>
            </div>
          ) : (
            <div onClick={handleSubmit} className="btn">
              Submit Form
            </div>
          )}
        </div>
      ) : (
        <div className="round_box mb-5">
          <div className="grid-2 grid-lay mx-1">
            <div className="">
              <div className="text-sm">Area Name</div>
              <div className="selected_item text-[var(--text-secondary)]">
                {bioUser?.residentArea}
              </div>
            </div>

            <div className="">
              <div className="text-sm">State Name</div>
              <div className="selected_item text-[var(--text-secondary)]">
                {bioUser?.residentState}
              </div>
            </div>

            <div className="">
              <div className="text-sm">Country Name</div>
              <div className="selected_item text-[var(--text-secondary)]">
                {bioUser?.residentCountry}
              </div>
            </div>

            <div className="">
              <div className="text-sm">Continent Name</div>
              <div className="selected_item text-[var(--text-secondary)]">
                {bioUser?.residentContinent}
              </div>
            </div>

            <div className="">
              <div className="text-sm">Phone Address</div>
              <div className="selected_item text-[var(--text-secondary)]">
                {bioUser?.phone}
              </div>
            </div>
            <div className="">
              <div className="text-sm">Residential Address</div>
              <div className="selected_item text-[var(--text-secondary)]">
                {bioUser?.residentAddress}
              </div>
            </div>
          </div>

          <div onClick={() => setCEdit(true)} className="btn">
            Edit this Information
          </div>
        </div>
      )}
    </>
  )
}
