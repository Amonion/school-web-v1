'use client'
import Image from 'next/image'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { useRef, useState } from 'react'
import { MessageStore } from '@/src/zustand/notification/Message'
import CustomBtn from '@/components/CustomBtn'
import { useParams } from 'next/navigation'
import StaffStore from '@/src/zustand/app/Staff'
import CountryStore, { Country } from '@/src/zustand/place/CountryOrigin'
import StateStore, { State } from '@/src/zustand/place/StateOrigin'
import { Area } from '@/src/zustand/place/Area'
import AreaStore from '@/src/zustand/place/AreaOrigin'
import PositionStore, { Position } from '@/src/zustand/app/Position'

const StaffForm: React.FC = () => {
  const url = '/company/positions/'
  const { page } = useParams()
  const [page_size] = useState(5)
  const [sort] = useState('-createdAt')
  const [queryParams] = useState(
    `?page_size=${page_size}&page=${
      page ? page : 1
    }&ordering=${sort}&isActive=true`
  )
  const { setMessage } = MessageStore()
  const [isCountryList, setCountryList] = useState(false)
  const [isStateList, setStateList] = useState(false)
  const [isAreaList, setIsAreaList] = useState(false)
  const { countries } = CountryStore()
  const { states, getStates } = StateStore()
  const { area, getArea } = AreaStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const { searchedPositions, searchPosition } = PositionStore()
  const { staffForm, loading, showForm, setForm, updateStaff } = StaffStore()

  const selectPosition = (p: Position) => {
    setForm('position', p.position)
    setForm('level', p.level)
    setForm('salary', p.salary)
    setForm('duties', p.duties)
    setForm('role', p.role)
    PositionStore.setState({ searchedPositions: [] })
  }

  const selectCountry = (country: Country) => {
    setForm('continent', country.continent)
    setForm('country', country.country)
    getStates(
      `/places/state/?country=${country.country}&page_size=350&field=state&sort=state`,
      setMessage
    )
    setForm('state', '')
    setCountryList(false)
  }

  const selectState = (state: State) => {
    setForm('state', state.state)
    setStateList(false)
    setForm('area', '')
    getArea(
      `/places/area/?state=${state.state}&page_size=350&field=area&sort=area`
    )
  }

  const selectArea = (area: Area) => {
    setForm('area', area.area)
    setIsAreaList(false)
  }

  const handleSearchPosition = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value
    if (value.trim().length > 0) {
      searchPosition(
        `${url}search?duties=${value}&position=${value}&page_size=${page_size}`
      )
    } else {
      PositionStore.setState({ searchedPositions: [] })
    }
  }

  // const handleInputChange = (
  //   e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  // ) => {
  //   const { name, value } = e.target
  //   setForm(name as keyof typeof staffForm, value)
  // }

  const handleSubmit = async () => {
    const inputsToValidate = [
      {
        name: 'duties',
        value: staffForm.duties,
        rules: { blank: true, minLength: 1 },
        field: 'Duties',
      },
      {
        name: 'role',
        value: staffForm.role,
        rules: { blank: true, maxLength: 15 },
        field: 'Role',
      },
      {
        name: 'salary',
        value: staffForm.salary,
        rules: { blank: true, maxLength: 15 },
        field: 'Salary',
      },
      {
        name: 'country',
        value: staffForm.country,
        rules: { blank: false, maxLength: 15 },
        field: 'Country',
      },
      {
        name: 'state',
        value: staffForm.state,
        rules: { blank: false, maxLength: 15 },
        field: 'State',
      },
      {
        name: 'level',
        value: staffForm.level,
        rules: { blank: true, maxLength: 15 },
        field: 'Level',
      },
      {
        name: 'area',
        value: staffForm.area,
        rules: { blank: false, maxLength: 15 },
        field: 'Area',
      },
      {
        name: 'position',
        value: staffForm.position,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Position',
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
    const data = appendForm(inputsToValidate)
    updateStaff(
      `/staffs/${staffForm._id}/${queryParams}`,
      data,
      setMessage,
      () => showForm(false)
    )
  }

  return (
    <>
      <div
        onClick={() => showForm(false)}
        className="fixed bg-black/50  w-full h-full flex items-center justify-center z-40 top-0 left-0"
      >
        <div
          onClick={(e) => {
            e.stopPropagation()
          }}
          className="flex max-w-[800px]"
        >
          <div className="card_body w-full sharp">
            <div className="relative mb-2">
              <div className={`input_wrap ml-auto active `}>
                <input
                  ref={inputRef}
                  type="search"
                  onChange={handleSearchPosition}
                  className={`transparent-input flex-1 `}
                  placeholder="Search staffs"
                />
                {loading ? (
                  <i className="bi bi-opencollective common-icon loading"></i>
                ) : (
                  <i className="bi bi-search common-icon cursor-pointer"></i>
                )}
              </div>

              {searchedPositions.length > 0 && (
                <div
                  className={`dropdownList ${
                    searchedPositions.length > 0
                      ? 'overflow-auto'
                      : 'overflow-hidden h-0'
                  }`}
                >
                  {searchedPositions.map((item, index) => (
                    <div
                      onClick={() => selectPosition(item)}
                      key={index}
                      className="input_drop_list"
                    >
                      <div className="flex-1">{item.position}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="grid-2 grid-lay w-full">
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  First Name
                </label>
                <div className="form-input">{staffForm.firstName}</div>
              </div>
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Last Name
                </label>
                <div className="form-input">{staffForm.lastName}</div>
              </div>
              <div className="formField">
                <label className="label flex items-center w-full" htmlFor="">
                  Country
                </label>
                <div
                  onClick={() => {
                    setCountryList(!isCountryList)
                    setStateList(false)
                    setIsAreaList(false)
                  }}
                  className="form-input cursor-pointer"
                >
                  {staffForm.country ? staffForm.country : 'Select Country'}
                  <i className="ml-auto bi bi-caret-down-fill"></i>
                </div>

                <div className={`dropList ${isCountryList ? 'abs' : ''}`}>
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
              </div>
              <div className="formField">
                <label className="label flex items-center w-full" htmlFor="">
                  State
                </label>
                <div
                  onClick={() => {
                    setStateList(!isStateList)
                    setCountryList(false)
                    setIsAreaList(false)
                  }}
                  className="form-input cursor-pointer"
                >
                  {staffForm.state ? staffForm.state : 'Select State'}
                  <i className="ml-auto bi bi-caret-down-fill"></i>
                </div>
                <div className={`dropList ${isStateList ? 'abs' : ''}`}>
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
              </div>
              <div className="formField">
                <label className="label flex items-center w-full" htmlFor="">
                  Area
                </label>
                <div
                  onClick={() => {
                    setIsAreaList(!isAreaList)
                    setCountryList(false)
                    setStateList(false)
                  }}
                  className="form-input cursor-pointer"
                >
                  {staffForm.area ? staffForm.area : 'Select Area'}
                  <i className="ml-auto bi bi-caret-down-fill"></i>
                </div>

                <div className={`dropList ${isAreaList ? 'abs' : ''}`}>
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
              </div>
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Staff Salary
                </label>
                <div className="form-input">{staffForm.salary}</div>
              </div>
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Stafff Position
                </label>
                <div className="form-input">{staffForm.position}</div>
              </div>
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Staff Level
                </label>
                <div className="form-input">{staffForm.level}</div>
              </div>
            </div>
            <div className="flex flex-col mb-2">
              <label className="label" htmlFor="">
                Duties
              </label>
              <div className="form-input">
                <div
                  className=""
                  dangerouslySetInnerHTML={{
                    __html: staffForm.duties,
                  }}
                />
              </div>
            </div>
            <div className="table-action flex">
              <div className="">
                <CustomBtn
                  onClick={handleSubmit}
                  loading={loading}
                  label={'Update Staff'}
                />
              </div>
              <div
                onClick={() => showForm(false)}
                className="custom_btn ml-auto "
              >
                Close Form
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default StaffForm
