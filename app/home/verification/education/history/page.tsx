'use client'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import _debounce from 'lodash/debounce'
import {
  BioUserSchoolInfoStore,
  PastSchool,
  PastSchoolEmpty,
} from '@/src/zustand/user/BioUserSchoolInfo'
import AcademicStore, {
  AcademicLevel,
  AcademicLevelEmpty,
} from '@/src/zustand/school/Academic'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import CountryStore, { Country } from '@/src/zustand/place/CountryOrigin'
import StateStore, { State } from '@/src/zustand/place/StateOrigin'
import AreaStore from '@/src/zustand/place/AreaOrigin'
import { Area } from '@/src/zustand/place/Area'
import SchoolStore, { School } from '@/src/zustand/school/School'
import DepartmentStore, { Department } from '@/src/zustand/school/Department'
import { validateInputs } from '@/lib/validation'
import { appendForm } from '@/lib/helpers'
import { usePathname, useRouter } from 'next/navigation'
import CustomBtn from '@/components/CustomBtn'

export default function History() {
  const {
    setBioUserPastSchoolForm,
    updateBioUserSchoolInfo,
    setBioUserSchoolInfoForm,
    bioUserSchoolForm,
    bioUserPastSchoolForm,
    loading,
    pastSchools,
  } = BioUserSchoolInfoStore()
  const { toggleActive, getAcademics, activeLevel, academicResults } =
    AcademicStore()
  const { bioUser, bioUserSchoolInfo, bioUserState } = AuthStore()
  const { setMessage } = MessageStore()
  const url = '/biousers-school/'
  const [isHistoryEdit, setHistoryEdit] = useState(true)
  const [isEditingSchool, setEditingSchool] = useState(false)
  // const [isAdvanced, setIsAdvanced] = useState(false)
  const [isDepartmentList, setDepartmentList] = useState(false)
  const { schoolResults, getSchools } = SchoolStore()
  const { countries, getCountries } = CountryStore()
  const { states, getStates } = StateStore()
  const { area, getArea } = AreaStore()
  const [isAdvanced, setIsAdvanced] = useState(false)
  const { departments, getDepartments } = DepartmentStore()
  const [isCountryList, setCountryList] = useState(false)
  const [isStateList, setStateList] = useState(false)
  const [isAreaList, setIsAreaList] = useState(false)
  const [isSchoolList, setSchoolList] = useState(false)
  const [schoolName, setSchoolName] = useState('')
  const [departmentName, setDepartmentName] = useState('')
  const [isAdmittedList, setIsAdmittedList] = useState(false)
  const [isGraduatedList, setIsGraduatedList] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)

  // const [pastSchools, setPastSchools] = useState<SchoolHistory[]>([]);
  const { setAlert } = AlartStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (countries.length === 0) {
      getCountries(
        `/places/countries/?country=&page_size=350&field=country&sort=country`,
        setMessage
      )
    }
  }, [])

  useEffect(() => {
    getAcademics(
      `/academic-levels/?inSchool=false&country=${bioUserPastSchoolForm.schoolCountry}`,
      setMessage
    )
  }, [pathname])

  useEffect(() => {
    if (bioUserState?.isEducationHistory) {
      setHistoryEdit(false)
    } else {
      setHistoryEdit(true)
    }
  }, [bioUserState])

  useEffect(() => {
    if (bioUserSchoolInfo) {
      BioUserSchoolInfoStore.setState({ bioUserSchoolForm: bioUserSchoolInfo })
    }
  }, [bioUserSchoolInfo])

  const schoolNameChange = () => {
    setBioUserPastSchoolForm('schoolFaculty', '')
    setBioUserPastSchoolForm('schoolDepartment', '')
    setDepartmentList(false)
  }

  const schoolCountryChange = (country: string) => {
    setBioUserPastSchoolForm('schoolState', '')
    setBioUserPastSchoolForm('schoolArea', '')
    setBioUserPastSchoolForm('schoolName', '')
    getStates(
      `/places/state/?country=${country}&page_size=350&field=state&sort=state`,
      setMessage
    )
    getAcademics(
      `/academic-levels/?inSchool=false&country=${country}`,
      setMessage
    )
  }

  const schoolStateChange = (state: string) => {
    getArea(`/places/area/?state=${state}&page_size=350&field=area&sort=area`)
    setBioUserPastSchoolForm('schoolArea', '')
    setBioUserPastSchoolForm('schoolName', '')
    setIsAreaList(false)
  }

  const selectCountry = (country: Country) => {
    setBioUserPastSchoolForm('schoolContinent', country.continent)
    setBioUserPastSchoolForm('schoolCountry', country.country)
    setBioUserPastSchoolForm('schoolCountryFlag', String(country.countryFlag))
    setBioUserPastSchoolForm('schoolCountrySymbol', country.countrySymbol)
    setCountryList(false)
    if (country.country !== bioUserPastSchoolForm.schoolCountry) {
      schoolCountryChange(country.country)
    }
  }

  const selectState = (state: State) => {
    setBioUserPastSchoolForm('schoolState', state.state)
    setStateList(false)
    if (state.state !== bioUserPastSchoolForm.schoolState) {
      schoolStateChange(state.state)
    }
  }

  const selectArea = (area: Area) => {
    setBioUserPastSchoolForm('schoolArea', area.area)
    setBioUserPastSchoolForm('schoolPlaceId', area.id)
    setIsAreaList(false)
  }

  const setSchool = () => {
    setBioUserPastSchoolForm('schoolName', schoolName)
    if (schoolName !== bioUserPastSchoolForm.schoolName) {
      schoolNameChange()
    }
  }

  const setDepartment = () => {
    setBioUserPastSchoolForm('schoolDepartment', departmentName)
  }

  const selectSchool = async (school: School) => {
    setBioUserPastSchoolForm('schoolName', school.name)
    setBioUserPastSchoolForm('schoolId', school._id)
    if (school.logo) {
      setBioUserPastSchoolForm('schoolLogo', String(school.logo))
    }
    setSchoolList(false)
    if (school.name !== bioUserPastSchoolForm.schoolName) {
      schoolNameChange()
    }
  }

  const handleSearchSchool = _debounce(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      if (!value) {
        setSchoolList(false)
        return
      }
      setSchoolName(value)
      setSchoolList(true)
      getSchools(
        `/schools/?name=${value}&state=${bioUserPastSchoolForm.schoolState}`,
        setMessage
      )
    },
    1000
  )

  const handleSearchDepartment = _debounce(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      if (!value) {
        setDepartmentList(false)
        return
      }
      setDepartmentList(true)
      setDepartmentName(value)

      getDepartments(
        `/departments/?name=${value}&schoolId=${bioUserPastSchoolForm.schoolId}`,
        setMessage
      )
    },
    1000
  )

  const resetSchool = () => {
    setCountryList(false)
    BioUserSchoolInfoStore.setState({
      bioUserPastSchoolForm: PastSchoolEmpty,
    })
  }

  const addSchool = () => {
    if (isEditingSchool) {
      BioUserSchoolInfoStore.setState((prev) => {
        const newItems = prev.pastSchools.map((item, index) =>
          index === editIndex
            ? {
                ...bioUserPastSchoolForm,
                bioUserUsername: String(bioUser?.bioUserUsername),
                bioUserId: String(bioUser?._id),
                bioUserPicture: String(bioUser?.bioUserPicture),
                bioUserDisplayName: String(bioUser?.bioUserDisplayName),
              }
            : item
        )
        return {
          pastSchools: newItems,
        }
      })
      BioUserSchoolInfoStore.setState({
        bioUserPastSchoolForm: PastSchoolEmpty,
      })
    } else {
      const inputsToValidate = [
        {
          name: 'schoolArea',
          value: bioUserPastSchoolForm.schoolArea,
          rules: { blank: true, minLength: 2 },
          field: 'School Area',
        },
        {
          name: 'schoolState',
          value: bioUserPastSchoolForm.schoolState,
          rules: { blank: true },
          field: 'School State',
        },
        {
          name: 'schoolCountry',
          value: bioUserPastSchoolForm.schoolCountry,
          rules: { blank: true, minLength: 2 },
          field: 'School Country',
        },
        {
          name: 'schoolContinent',
          value: bioUserPastSchoolForm.schoolContinent,
          rules: { blank: true },
          field: 'School Continent',
        },
        {
          name: 'schoolCountryFlag',
          value: bioUserPastSchoolForm.schoolCountryFlag,
          rules: { blank: true },
          field: 'School Country Flag',
        },
        {
          name: 'schoolName',
          value: bioUserPastSchoolForm.schoolName.trim(),
          rules: { blank: true, minLength: 2 },
          field: 'School Name',
        },
        {
          name: 'schoolLogo',
          value: bioUserPastSchoolForm.schoolLogo,
          rules: { blank: false },
          field: 'School Logo',
        },
        {
          name: 'schoolDepartmentId',
          value: bioUserPastSchoolForm.schoolDepartmentId.trim(),
          rules: { blank: false },
          field: 'Department Name',
        },
        {
          name: 'schoolDepartment',
          value: bioUserPastSchoolForm.schoolDepartment.trim(),
          rules: { blank: isAdvanced ? true : false },
          field: 'Department Name',
        },
        {
          name: 'schoolDepartmentUsername',
          value: bioUserPastSchoolForm.schoolDepartmentUsername,
          rules: { blank: false },
          field: 'Department Username',
        },
        {
          name: 'admittedAt',
          value: bioUserPastSchoolForm.admittedAt,
          rules: { blank: false, minLength: 2 },
          field: 'Entry Date',
        },
        {
          name: 'graduatedAt',
          value: bioUserPastSchoolForm.graduatedAt,
          rules: { blank: false, minLength: 2 },
          field: 'Exit Date',
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
      BioUserSchoolInfoStore.setState((prev) => {
        return {
          pastSchools: [
            ...prev.pastSchools,
            {
              ...bioUserPastSchoolForm,
              bioUserId: String(bioUser?._id),
              bioUserUsername: String(bioUser?.bioUserUsername),
              bioUserPicture: String(bioUser?.bioUserPicture),
              bioUserDisplayName: String(bioUser?.bioUserDisplayName),
            },
          ],
        }
      })
    }

    AcademicStore.getState().resetForm(AcademicLevelEmpty)
    resetSchool()
    setIsAdvanced(false)
    setEditIndex(null)
  }

  const tempDelete = (indexToRemove: number) => {
    BioUserSchoolInfoStore.setState((prev) => {
      const newItems = prev.pastSchools.filter(
        (_, index) => index !== indexToRemove
      )
      return {
        pastSchools: newItems,
      }
    })
  }

  const tempEdit = (index: number, item: PastSchool) => {
    setEditIndex(index)
    setEditingSchool(true)
    getStates(
      `/places/state/?country=${item.schoolCountry}&page_size=350&field=state&sort=state`,
      setMessage
    )
    getArea(
      `/places/area/?state=${item.schoolState}&page_size=350&field=area&sort=area`
    )
    getAcademics(
      `/academic-levels/?inSchool=false&country=${item.schoolCountry}`,
      setMessage
    )
    BioUserSchoolInfoStore.setState({ bioUserPastSchoolForm: item })
  }

  const selectLevel = (index: number, item: AcademicLevel) => {
    setBioUserPastSchoolForm('schoolLevelName', item.levelName)
    setBioUserPastSchoolForm('schoolLevel', item.level)
    if (
      !item.levelName.includes('Primary') &&
      !item.levelName.includes('Secondary')
    ) {
      setBioUserPastSchoolForm('isAdvanced', true)
    } else {
      setBioUserPastSchoolForm('isAdvanced', false)
    }
    toggleActive(index)
  }

  const selectDepartment = async (department: Department) => {
    setBioUserPastSchoolForm('schoolDepartmentId', department._id)
    setBioUserPastSchoolForm('schoolDepartment', department.name)
    setBioUserPastSchoolForm('schoolDepartmentUsername', department.username)
    setDepartmentList(false)
  }

  const selectAdmissionYear = async (year: number) => {
    const admissionYear = new Date(year, 0, 1)
    if (
      bioUserPastSchoolForm.graduatedAt &&
      new Date(bioUserPastSchoolForm.graduatedAt) < admissionYear
    ) {
      setMessage(
        'Admission year cannot be greater than graduation year!',
        false
      )
      return
    }
    setBioUserPastSchoolForm('admittedAt', admissionYear)
    setIsAdmittedList(false)
  }

  const selectGraduationYear = async (year: number) => {
    const graduationYear = new Date(year, 0, 1)
    if (
      bioUserPastSchoolForm.admittedAt &&
      new Date(bioUserPastSchoolForm.admittedAt) > graduationYear
    ) {
      setMessage(
        'Admission year cannot be greater than graduation year!',
        false
      )
      return
    }
    setBioUserPastSchoolForm('graduatedAt', graduationYear)
    setIsGraduatedList(false)
  }

  const submitData = async (data: FormData) => {
    updateBioUserSchoolInfo(
      `${url}schools/${bioUser?._id}`,
      data,
      setMessage,
      () => router.replace(`/home/verification/education/documents`)
    )
  }

  const handleSubmit = async () => {
    if (bioUserState?.isVerified) {
      setMessage('To update these information, please contact support', false)
      return
    }

    const inputsToValidate = bioUserSchoolForm.hasPastSchool
      ? [
          {
            name: 'pastSchools',
            value: JSON.stringify(pastSchools),
            rules: { blank: true, minLength: 2 },
            field: 'Past schools',
          },
          {
            name: 'hasPastSchool',
            value: bioUserSchoolForm.hasPastSchool,
            rules: { blank: true },
            field: 'History',
          },
          {
            name: 'action',
            value: 'EducationHistory',
            rules: { blank: true },
            field: 'History',
          },
          {
            name: 'isEducationHistory',
            value: true,
            rules: { blank: true },
            field: 'History',
          },
        ]
      : [
          {
            name: 'hasPastSchool',
            value: bioUserSchoolForm.hasPastSchool,
            rules: { blank: false },
            field: 'Past School',
          },
          {
            name: 'action',
            value: 'EducationHistory',
            rules: { blank: true },
            field: 'History',
          },
          {
            name: 'isEducationDocument',
            value: true,
            rules: { blank: true },
            field: 'Document',
          },
          {
            name: 'isEducationHistory',
            value: true,
            rules: { blank: true },
            field: 'History',
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
    setAlert(
      'Warning',
      'You will need to contact support to edit this information after verification is approved!',
      true,
      () => submitData(data)
    )
  }

  return (
    <>
      {pastSchools.length > 0 && (
        <div className="mt-10">
          {pastSchools.map((item, index) => (
            <div key={index} className="round_box mb-5">
              <div className="m-1 mb-5">
                <div className="text-sm">Place of Education</div>
                <div className="selected_item">
                  {item.schoolArea} {item.schoolState} State,{' '}
                  {item.schoolCountry}
                </div>
              </div>

              <div className="m-1 mb-5">
                <div className="text-sm">Education Level</div>
                <div className="selected_item">{item.schoolLevelName}</div>
              </div>

              <div className="m-1 mb-5">
                <div className="text-sm">Institution</div>
                <div className="selected_item">{item.schoolName}</div>
              </div>
              {item.schoolFaculty && (
                <div className="m-1 mb-5">
                  <div className="text-sm">Faculty</div>
                  <div className="selected_item">{item.schoolFaculty}</div>
                </div>
              )}

              {item.schoolDepartment && (
                <div className="m-1 mb-5">
                  <div className="text-sm">Department</div>
                  <div className="selected_item">{item.schoolDepartment}</div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col">
                  <label className="label" htmlFor="">
                    Admitted On:
                  </label>
                  <div className="flex justify-between">
                    <div className="form-input sm w-input mr-2">
                      {new Date(String(item.admittedAt)).getFullYear()}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="label" htmlFor="">
                    Graduated On:
                  </label>
                  <div className="flex justify-between">
                    <div className="form-input sm w-input mr-2">
                      {new Date(String(item.graduatedAt)).getFullYear()}
                    </div>
                  </div>
                </div>
              </div>

              {isHistoryEdit && (
                <div className="flex w-full justify-end text-[var(--custom-color)]">
                  <i
                    onClick={() => tempDelete(index)}
                    className="bi bi-trash cursor-pointer text-lg"
                  ></i>
                  <i
                    onClick={() => tempEdit(index, item)}
                    className="bi bi-pencil-square cursor-pointer text-lg ml-3"
                  ></i>
                </div>
              )}
            </div>
          ))}

          <CustomBtn
            label="Submit Form"
            loading={loading}
            onClick={handleSubmit}
          />

          {!isHistoryEdit && (
            <div onClick={() => setHistoryEdit(true)} className="btn">
              Edit this Information
            </div>
          )}
        </div>
      )}

      {isHistoryEdit && (
        <div>
          <div className="flex uppercase mt-5 text-[var(--custom)] text-center justify-center w-full mb-5">
            Fill in details of past school attended and click the add button.
          </div>

          <div className="mb-5">
            <div className="text-center text-lg mb-2">
              Have you attended any school before?
            </div>

            <div className="flex justify-center">
              <div
                onClick={() => setBioUserSchoolInfoForm('hasPastSchool', true)}
                className={`btn mx-1 ${
                  bioUserSchoolForm.hasPastSchool === true ? '' : 'line'
                }`}
              >
                Yes I have
              </div>
              <div
                onClick={() => setBioUserSchoolInfoForm('hasPastSchool', false)}
                className={`btn mx-1 ${
                  bioUserSchoolForm.hasPastSchool === false ? '' : 'line'
                }`}
              >
                No I have not
              </div>
            </div>
          </div>

          {bioUserSchoolForm.hasPastSchool ? (
            <>
              <div className="flex flex-col w-full mb-4">
                <div className="flex flex-col relative mb-4">
                  <label className="label flex items-center w-full" htmlFor="">
                    Country of School{' '}
                  </label>
                  <div
                    onClick={() => {
                      setCountryList(!isCountryList)
                      setStateList(false)
                      setIsAreaList(false)
                    }}
                    className="form-input cursor-pointer"
                  >
                    {bioUserPastSchoolForm.schoolCountry
                      ? bioUserPastSchoolForm.schoolCountry
                      : 'Select Country'}
                    <i className="ml-auto bi bi-caret-down-fill"></i>
                  </div>

                  {/* {isCountryList && ( */}
                  <div className={`dropList ${isCountryList ? 'rel' : ''}`}>
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
                  {/* )} */}
                </div>
                {bioUserPastSchoolForm.schoolCountry && (
                  <>
                    <div className="flex flex-col relative mb-4">
                      <label
                        className="label flex items-center w-full"
                        htmlFor=""
                      >
                        State of Current/Last School{' '}
                      </label>
                      <div
                        onClick={() => {
                          setStateList(!isStateList)
                          setCountryList(false)
                          setIsAreaList(false)
                        }}
                        className="form-input cursor-pointer"
                      >
                        {bioUserPastSchoolForm.schoolState
                          ? bioUserPastSchoolForm.schoolState
                          : 'Select State'}
                        <i className="ml-auto bi bi-caret-down-fill"></i>
                      </div>

                      {/* {isStateList && ( */}
                      <div className={`dropList ${isStateList ? 'rel' : ''}`}>
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
                      {/* )} */}
                    </div>
                    {bioUserPastSchoolForm.schoolState && (
                      <div className="flex flex-col relative mb-4">
                        <label
                          className="label flex items-center w-full"
                          htmlFor=""
                        >
                          Area of Current/Last School{' '}
                        </label>
                        <div
                          onClick={() => {
                            setIsAreaList(!isAreaList)
                            setCountryList(false)
                            setStateList(false)
                          }}
                          className="form-input cursor-pointer"
                        >
                          {bioUserPastSchoolForm.schoolArea
                            ? bioUserPastSchoolForm.schoolArea
                            : 'Select Area'}
                          <i className="ml-auto bi bi-caret-down-fill"></i>
                        </div>

                        {/* {isAreaList && ( */}
                        <div className={`dropList ${isAreaList ? 'rel' : ''}`}>
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
                        {/* )} */}
                      </div>
                    )}
                  </>
                )}
              </div>

              {bioUserPastSchoolForm.schoolArea !== '' &&
                academicResults.length > 0 && (
                  <div className="round_box mb-5 flex flex-wrap">
                    {academicResults.map((item, index) => (
                      <div
                        key={index}
                        className={`radio m-1 ${
                          item.isActive
                            ? 'text-[var(--custom)]'
                            : item.levelName ===
                              bioUserPastSchoolForm.schoolLevelName
                            ? 'text-[var(--custom)]'
                            : ''
                        }`}
                        onClick={() => selectLevel(index, item)}
                      >
                        <div className="radio_circle">
                          {(item.isActive ||
                            item.levelName ===
                              bioUserPastSchoolForm.schoolLevelName) && (
                            <div className="radio_dot"></div>
                          )}
                        </div>
                        {item.levelName}
                      </div>
                    ))}
                  </div>
                )}

              {activeLevel.levelName !== '' && (
                <div className="relative mb-10">
                  <div className="text-[12px] text-[var(--custom)]">
                    If your school did not appear, type it and click the search
                    icon
                  </div>
                  <div className={`input_wrap ml-auto active`}>
                    <input
                      type="search"
                      onChange={handleSearchSchool}
                      className={`transparent-input flex-1 `}
                      placeholder={`Search graduating school`}
                    />
                    {schoolResults.length === 0 && (
                      <i
                        onClick={setSchool}
                        className="bi bi-search common-icon cursor-pointer"
                      ></i>
                    )}
                  </div>
                  {bioUserPastSchoolForm.schoolName && (
                    <div className="flex pb-1 my-2 border-b border-[var(--border-color)] xs:mx-[25px]">
                      {bioUserPastSchoolForm.schoolLogo && (
                        <Image
                          className="mr-5"
                          src={bioUserPastSchoolForm.schoolLogo}
                          alt="Captured"
                          sizes="100vw"
                          width={0}
                          height={0}
                          style={{
                            width: 'auto',
                            objectFit: 'contain',
                            maxHeight: '30px',
                          }}
                        />
                      )}
                      {bioUserPastSchoolForm.schoolName}
                    </div>
                  )}
                  {/* {isSchoolList && schoolResults.length > 0 && ( */}
                  <div
                    className={`dropList ${
                      isSchoolList && schoolResults.length > 0 ? 'rel' : ''
                    }`}
                  >
                    {schoolResults.map((item, index) => (
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
                            style={{ width: '30px', height: 'auto' }}
                          />
                        )}
                        {item.name}
                      </div>
                    ))}
                  </div>
                  {/* )} */}
                </div>
              )}

              {bioUserPastSchoolForm.isAdvanced && (
                <>
                  {bioUserPastSchoolForm.schoolLevelName !== '' &&
                    bioUserPastSchoolForm.schoolName !== '' && (
                      <>
                        <div className="relative mb-10">
                          <div className="text-[12px] text-[var(--custom)]">
                            If you have department write it.
                          </div>
                          <div className={`input_wrap ml-auto active `}>
                            <input
                              type="search"
                              onChange={handleSearchDepartment}
                              className={`transparent-input flex-1 `}
                              placeholder="Search your department"
                            />
                            {departments.length === 0 && (
                              <i
                                onClick={setDepartment}
                                className="bi bi-search common-icon cursor-pointer"
                              ></i>
                            )}
                          </div>
                          {bioUserPastSchoolForm.schoolDepartment && (
                            <div className="flex pb-1 my-2 border-b border-[var(--border-color)] xs:mx-[25px]">
                              {bioUserPastSchoolForm.schoolDepartment}
                            </div>
                          )}
                          {/* {isDepartmentList && departments.length > 0 && ( */}
                          <div
                            className={`dropList ${
                              isDepartmentList && departments.length > 0
                                ? 'rel'
                                : ''
                            }`}
                          >
                            {departments.map((item, index) => (
                              <div
                                onClick={() => selectDepartment(item)}
                                key={index}
                                className="input_drop_list"
                              >
                                {item.name}
                              </div>
                            ))}
                          </div>
                          {/* )} */}
                        </div>
                      </>
                    )}
                </>
              )}

              {bioUserPastSchoolForm.schoolName && (
                <div className={`grid grid-cols-2 gap-2 mb-10`}>
                  <div className="relative">
                    <label
                      className="label flex items-center w-full"
                      htmlFor=""
                    >
                      Year of Admission
                    </label>
                    <div
                      onClick={() => {
                        setIsAdmittedList(!isAdmittedList)
                      }}
                      className="form-input cursor-pointer"
                    >
                      {bioUserPastSchoolForm.admittedAt
                        ? new Date(
                            bioUserPastSchoolForm.admittedAt
                          ).getFullYear()
                        : 'Select Year'}
                      <i className="ml-auto bi bi-caret-down-fill"></i>
                    </div>
                    {/* {isAdmittedList && ( */}
                    <div className={`dropList ${isAdmittedList ? 'rel' : ''}`}>
                      {Array.from(
                        { length: new Date().getFullYear() - 1900 },
                        (_, index) => new Date().getFullYear() - index
                      ).map((year, index) => (
                        <div
                          onClick={() => selectAdmissionYear(year)}
                          key={index}
                          className="input_drop_list"
                        >
                          {year}
                        </div>
                      ))}
                    </div>
                    {/* )} */}
                  </div>
                  <div className="relative">
                    <label
                      className="label flex items-center w-full"
                      htmlFor=""
                    >
                      Year of Graduation
                    </label>
                    <div
                      onClick={() => {
                        setIsGraduatedList(!isGraduatedList)
                      }}
                      className="form-input cursor-pointer"
                    >
                      {bioUserPastSchoolForm.graduatedAt
                        ? new Date(
                            bioUserPastSchoolForm.graduatedAt
                          ).getFullYear()
                        : 'Select Year'}
                      <i className="ml-auto bi bi-caret-down-fill"></i>
                    </div>
                    {/* {isGraduatedList && ( */}
                    <div className={`dropList ${isGraduatedList ? 'rel' : ''}`}>
                      {Array.from(
                        { length: 2025 - 1900 },
                        (_, index) => new Date().getFullYear() - index
                      ).map((year, index) => (
                        <div
                          onClick={() => selectGraduationYear(year)}
                          key={index}
                          className="input_drop_list"
                        >
                          {year}
                        </div>
                      ))}
                    </div>
                    {/* )} */}
                  </div>
                </div>
              )}

              {bioUserPastSchoolForm.admittedAt &&
                bioUserPastSchoolForm.graduatedAt && (
                  <div onClick={addSchool} className="btn">
                    Add Institution
                  </div>
                )}
            </>
          ) : (
            <>
              {bioUserSchoolForm.hasPastSchool === false && (
                <CustomBtn
                  label="Submit Form"
                  loading={loading}
                  onClick={handleSubmit}
                />
              )}
            </>
          )}
        </div>
      )}

      {!bioUserState?.hasPastSchool &&
        !isHistoryEdit &&
        bioUserState?.isEducationHistory && (
          <>
            <div className="relative flex justify-center my-5 text-center">
              <div className="not_found_text">No Past School Found</div>
              <Image
                className="max-w-[300px]"
                alt={`no record`}
                src="/images/not-found.png"
                width={0}
                sizes="100vw"
                height={0}
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
            <div onClick={() => setHistoryEdit(true)} className="btn">
              Edit this Information
            </div>
          </>
        )}
    </>
  )
}
