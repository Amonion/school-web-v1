'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { appendForm } from '@/lib/helpers'
import { BioUserStore } from '@/src/zustand/user/BioUser'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import { validateInputs } from '@/lib/validation'
import CountryStore, { Country } from '@/src/zustand/place/CountryOrigin'
import StateStore, { State } from '@/src/zustand/place/StateOrigin'
import AreaStore from '@/src/zustand/place/AreaOrigin'
import { Area } from '@/src/zustand/place/Area'
import { useRouter } from 'next/navigation'

export default function Origin() {
  const { bioUserForm, setForm, loading, updateMyBioUser } = BioUserStore()
  const { user, bioUser, bioUserState } = AuthStore()
  const { setMessage } = MessageStore()
  const { setAlert } = AlartStore()
  const url = '/users/bio-user/'
  const [isCountryList, setCountryList] = useState(false)
  const [isStateList, setStateList] = useState(false)
  const [isAreaList, setIsAreaList] = useState(false)
  const router = useRouter()
  const [isOEdit, setOEdit] = useState(false)
  const { getArea, area } = AreaStore()
  const { countries, getCountries } = CountryStore()
  const { states, getStates } = StateStore()

  useEffect(() => {
    if (!bioUserState) return
    if (!bioUserState.isOrigin) {
      setOEdit(true)
    } else {
      setOEdit(false)
    }
  }, [bioUserState])

  useEffect(() => {
    if (!bioUser) return
    if (countries.length === 0) {
      getCountries(
        `/places/countries/?country=&page_size=350&field=country&sort=country`,
        setMessage
      )
    }
    BioUserStore.setState({ bioUserForm: bioUser })
  }, [bioUser])

  // useEffect(() => {
  //   if (bioUserForm.homeCountry) {
  //     getStates(
  //       `/places/state/?country=${bioUserForm.homeCountry}&page_size=350&field=state&sort=state`,
  //       setMessage
  //     )
  //   }
  //   setForm('homeState', '')
  // }, [bioUserForm.homeCountry])

  // useEffect(() => {
  //   if (bioUserForm.homeState) {
  //     getArea(
  //       `/places/area/?state=${bioUserForm.homeState}&page_size=350&field=area&sort=area`
  //     )
  //   }
  //   setForm('homeArea', '')
  // }, [bioUserForm.homeState])

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
    setForm('homeContinent', country.continent)
    setForm('homeCountry', country.country)
    setForm('homeCountryFlag', String(country.countryFlag))
    setForm('homeCountrySymbol', country.countrySymbol)
    setCountryList(false)
    getStates(
      `/places/state/?country=${country.country}&page_size=350&field=state&sort=state`,
      setMessage
    )
    setForm('residentState', '')
  }

  const selectState = (state: State) => {
    setForm('homeState', state.state)
    setStateList(false)
    getArea(
      `/places/area/?state=${state.state}&page_size=350&field=area&sort=area`
    )
  }

  const selectArea = (area: Area) => {
    setForm('homeArea', area.area)
    setForm('homePlaceId', area.id)
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
      router.replace(`/home/verification/contact`)
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    if (user && user.isVerified) {
      setMessage('To update these information, please contact support', false)
      return
    }

    const inputsToValidate = [
      {
        name: 'homeContinent',
        value: bioUserForm.homeContinent,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Home continent name',
      },
      {
        name: 'homeCountry',
        value: bioUserForm.homeCountry,
        rules: { blank: true, minLength: 2, maxLength: 100 },
        field: 'Home country name',
      },
      {
        name: 'homeCountryFlag',
        value: bioUserForm.homeCountryFlag,
        rules: { blank: true, minLength: 2, maxLength: 100 },
        field: 'Flag',
      },
      {
        name: 'homeCountrySymbol',
        value: bioUserForm.homeCountrySymbol,
        rules: { blank: true, minLength: 2, maxLength: 100 },
        field: 'Country symbol',
      },
      {
        name: 'homeState',
        value: bioUserForm.homeState,
        rules: { blank: true, minLength: 2, maxLength: 100 },
        field: 'Home state name',
      },
      {
        name: 'homeArea',
        value: bioUserForm.homeArea,
        rules: { blank: true, minLength: 2, maxLength: 100 },
        field: 'Home area name',
      },
      {
        name: 'homeAddress',
        value: bioUserForm.homeAddress,
        rules: { blank: true, minLength: 3, maxLength: 500 },
        field: 'Home address',
      },
      {
        name: 'homeId',
        value: bioUserForm.homePlaceId,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Place ID',
      },
      {
        name: 'action',
        value: 'Origin',
        rules: { blank: true, minLength: 1 },
        field: 'Bio Data',
      },
      {
        name: 'isOrigin',
        value: true,
        rules: { blank: false, maxLength: 100 },
        field: 'isOrigin',
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
      {isOEdit ? (
        <div>
          <div className="grid-2 grid-lay">
            <div className="flex flex-col w-full ">
              <div className="flex flex-col relative mb-4">
                <label className="label flex items-center w-full" htmlFor="">
                  Country of Origin{' '}
                </label>
                <div
                  onClick={() => {
                    setCountryList(!isCountryList)
                    setStateList(false)
                    setIsAreaList(false)
                  }}
                  className="form-input cursor-pointer"
                >
                  {bioUserForm.homeCountry
                    ? bioUserForm.homeCountry
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
                  State of Origin{' '}
                </label>
                <div
                  onClick={() => {
                    setStateList(!isStateList)
                    setCountryList(false)
                    setIsAreaList(false)
                  }}
                  className="form-input cursor-pointer"
                >
                  {bioUserForm.homeState
                    ? bioUserForm.homeState
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
                  {bioUserForm.homeArea ? bioUserForm.homeArea : 'Select Area'}
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
                Home Address
              </label>
              <input
                className="form-input"
                name="homeAddress"
                value={bioUserForm.homeAddress}
                onChange={handleInputChange}
                type="text"
                placeholder="Home address"
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
                {bioUser?.homeArea}
              </div>
            </div>

            <div className="">
              <div className="text-sm">State Name</div>
              <div className="selected_item text-[var(--text-secondary)]">
                {bioUser?.homeState}
              </div>
            </div>

            <div className="">
              <div className="text-sm">Country Name</div>
              <div className="selected_item text-[var(--text-secondary)]">
                {bioUser?.homeCountry}
              </div>
            </div>

            <div className="">
              <div className="text-sm">Continent Name</div>
              <div className="selected_item text-[var(--text-secondary)]">
                {bioUser?.homeContinent}
              </div>
            </div>

            <div className="">
              <div className="text-sm">Home Address</div>
              <div className="selected_item text-[var(--text-secondary)]">
                {bioUser?.homeAddress}
              </div>
            </div>
          </div>

          <div onClick={() => setOEdit(true)} className="btn">
            Edit this Information
          </div>
        </div>
      )}
    </>
  )
}
