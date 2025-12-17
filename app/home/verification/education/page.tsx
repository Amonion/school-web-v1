'use client'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { appendForm } from '@/lib/helpers'
import _debounce from 'lodash/debounce'
import AcademicStore, { AcademicLevel } from '@/src/zustand/school/Academic'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import { BioUserSchoolInfoStore } from '@/src/zustand/user/BioUserSchoolInfo'
import SchoolStore, { School } from '@/src/zustand/school/School'
import DepartmentStore, { Department } from '@/src/zustand/school/Department'
import FacultyStore, { Faculty } from '@/src/zustand/school/Faculty'
import CountryStore, { Country } from '@/src/zustand/place/CountryOrigin'
import StateStore, { State } from '@/src/zustand/place/StateOrigin'
import AreaStore from '@/src/zustand/place/AreaOrigin'
import { Area } from '@/src/zustand/place/Area'
import { validateInputs } from '@/lib/validation'
import { usePathname, useRouter } from 'next/navigation'
import CustomBtn from '@/components/CustomBtn'

interface MaxLevels {
  level: number
  isActive: boolean
}

export default function Current() {
  const {
    bioUserSchoolForm,
    loading,
    resetForm,
    setBioUserSchoolInfoForm,
    updateBioUserSchoolInfo,
  } = BioUserSchoolInfoStore()
  const { toggleActive, getAcademics, academicResults, activeLevel } =
    AcademicStore()
  const { countries, getCountries } = CountryStore()
  const { states, getStates } = StateStore()
  const { area, getArea } = AreaStore()
  const { schoolResults, getSchools } = SchoolStore()
  const { faculties, getFaculties } = FacultyStore()
  const { departments, getDepartments } = DepartmentStore()
  const { bioUser, bioUserSchoolInfo, bioUserState, user } = AuthStore()
  const { setMessage } = MessageStore()
  const url = '/biousers-school/'
  // const [showInSchool, setShowInSchool] = useState(false)
  const [isDepartmentList, setDepartmentList] = useState(false)
  const [isFacultyList, setFacultyList] = useState(false)
  const [isNew, setIsNew] = useState(false)
  const [isCurrentEdit, setCurrentEdit] = useState(true)
  const [facultyName, setFacultyName] = useState('')
  const [isCountryList, setCountryList] = useState(false)
  const [isSchoolList, setSchoolList] = useState(false)
  const [maxLevels, setMaxLevel] = useState<MaxLevels[]>([])
  const [isStateList, setStateList] = useState(false)
  const [isAreaList, setIsAreaList] = useState(false)
  const [isAdmittedList, setIsAdmittedList] = useState(false)
  const [isGraduatedList, setIsGraduatedList] = useState(false)
  const [schoolName, setSchoolName] = useState('')
  const [departmentName, setDepartmentName] = useState('')
  const { setAlert } = AlartStore()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    if (countries.length === 0) {
      getCountries(
        `/places/countries/?country=&page_size=350&field=country&sort=country`,
        setMessage
      )
    }
    setSchoolList(false)
  }, [])

  useEffect(() => {
    if (bioUserSchoolInfo) {
      if (bioUserSchoolInfo.schoolCountry) {
        getStates(
          `/places/state/?country=${bioUserSchoolInfo.schoolCountry}&page_size=350&field=state&sort=state`,
          setMessage
        )
      }

      if (bioUserSchoolInfo.schoolState) {
        getArea(
          `/places/area/?state=${bioUserSchoolInfo.schoolState}&page_size=350&field=area&sort=area`
        )
      }
    }
    setFacultyList(false)
  }, [pathname])

  useEffect(() => {
    if (
      bioUserSchoolInfo &&
      (bioUserSchoolInfo?.schoolLevelName?.includes('Primary') ||
        bioUserSchoolInfo?.schoolLevelName?.includes('Secondary'))
    ) {
      setBioUserSchoolInfoForm('isAdvanced', false)
    } else {
      setBioUserSchoolInfoForm('isAdvanced', true)
    }
  }, [bioUserSchoolForm.schoolLevelName])

  useEffect(() => {
    if (bioUserSchoolInfo) {
      BioUserSchoolInfoStore.setState({
        bioUserSchoolForm: bioUserSchoolInfo,
      })
    }
  }, [bioUserSchoolInfo])

  useEffect(() => {
    if (bioUserSchoolInfo?.inSchool && bioUserSchoolInfo.schoolYear) {
      const arr = bioUserSchoolInfo?.schoolYear.split(' ')
      if (maxLevels.length > 0 && arr) {
        const index = maxLevels.findIndex(
          (item) => item.level + 1 === Number(arr[arr.length - 1])
        )
        if (index && index + 1 > 0) {
          selectMaxLevel(index)
        }
      }
    }
  }, [maxLevels.length, bioUserSchoolInfo])

  useEffect(() => {
    if (bioUserSchoolForm.schoolCountry && bioUserSchoolForm.inSchool) {
      getLevels(bioUserSchoolForm.schoolCountry)
    }
  }, [bioUserSchoolForm.inSchool])

  useEffect(() => {
    if (bioUserState?.isEducation) {
      setCurrentEdit(false)
    } else {
      setCurrentEdit(true)
    }
  }, [bioUserState])

  useEffect(() => {
    if (academicResults.length > 0 && bioUserSchoolInfo) {
      const index = academicResults.findIndex(
        (item) => item.maxLevelName === bioUserSchoolInfo?.schoolGradingName
      )
      if (index && index + 1 > 0) {
        toggleActive(index)
        // selectMaxLevel(index)
      }
    }
  }, [academicResults.length, bioUserSchoolInfo, pathname])

  useEffect(() => {
    if (schoolResults.length > 0) {
      setSchoolList(true)
    } else {
      setSchoolList(false)
    }
  }, [schoolResults])

  const cancelEdit = () => {
    if (!bioUserSchoolInfo) return
    BioUserSchoolInfoStore.setState({ bioUserSchoolForm: bioUserSchoolInfo })
    setCurrentEdit(false)
  }

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
        `/departments/?name=${value}&schoolId=${bioUserSchoolForm.schoolId}`,
        setMessage
      )
    },
    1000
  )

  const handleSearchFaculty = _debounce(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      if (!value) {
        setFacultyList(false)
        return
      }
      setFacultyList(true)
      setFacultyName(value)
      getFaculties(
        `/faculties/?name=${value}&school=${bioUserSchoolForm.schoolName}`,
        setMessage
      )
    },
    1000
  )

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
        `/schools/?name=${value}&state=${bioUserSchoolForm.schoolState}`,
        setMessage
      )
    },
    1000
  )

  const schoolNameChange = () => {
    setBioUserSchoolInfoForm('schoolFaculty', '')
    setFacultyList(false)
    setBioUserSchoolInfoForm('schoolDepartment', '')
    setDepartmentList(false)
  }

  const schoolCountryChange = (country: string) => {
    setBioUserSchoolInfoForm('schoolState', '')
    setBioUserSchoolInfoForm('schoolArea', '')
    setBioUserSchoolInfoForm('schoolName', '')
    getStates(
      `/places/state/?country=${country}&page_size=350&field=state&sort=state`,
      setMessage
    )
    getAcademics(
      `/academic-levels/?inSchool=${bioUserSchoolForm.inSchool}&country=${country}`,
      setMessage
    )
    setFacultyList(false)
  }

  const schoolStateChange = (state: string) => {
    getArea(`/places/area/?state=${state}&page_size=350&field=area&sort=area`)
    setBioUserSchoolInfoForm('schoolArea', '')
    setBioUserSchoolInfoForm('schoolName', '')
    setIsAreaList(false)
  }

  const setSchool = () => {
    setIsNew(true)
    setBioUserSchoolInfoForm('schoolName', schoolName)
    if (schoolName !== bioUserSchoolForm.schoolName) {
      schoolNameChange()
    }
    if (inputRef.current) {
      inputRef.current.value = ''
    }
    setSchoolList(false)
  }

  const setFaculty = () => {
    setIsNew(true)
    setBioUserSchoolInfoForm('schoolFaculty', facultyName)
    setFacultyList(false)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const setDepartment = () => {
    setIsNew(true)
    setBioUserSchoolInfoForm('schoolDepartment', departmentName)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const selectLevel = (index: number, item: AcademicLevel) => {
    const maxLevels: MaxLevels[] = []
    for (let i = 0; i < item.maxLevel; i++) {
      const maxLevel = {
        level: i,
        isActive: false,
      }
      maxLevels.push(maxLevel)
    }
    setMaxLevel(() => [...maxLevels])
    setBioUserSchoolInfoForm('schoolGradingName', item.maxLevelName)
    setBioUserSchoolInfoForm('schoolYear', `${item.maxLevelName} ${index + 1}`)
    if (
      !item.levelName.includes('Primary') &&
      !item.levelName.includes('Secondary')
    ) {
      setBioUserSchoolInfoForm('isAdvanced', true)
    } else {
      setBioUserSchoolInfoForm('isAdvanced', false)
    }
    toggleActive(index)
  }

  const selectMaxLevel = (index: number) => {
    const updatedResults = maxLevels.map((tertiary, idx) => ({
      ...tertiary,
      isActive: idx === index ? true : false,
    }))

    setMaxLevel(updatedResults)

    setBioUserSchoolInfoForm(
      'schoolYear',
      `${activeLevel.maxLevelName} ${index + 1}`
    )
  }

  const selectCountry = (country: Country) => {
    setBioUserSchoolInfoForm('schoolContinent', country.continent)
    setBioUserSchoolInfoForm('schoolCountry', country.country)
    setBioUserSchoolInfoForm('schoolCountryFlag', String(country.countryFlag))
    setBioUserSchoolInfoForm('schoolCountrySymbol', country.countrySymbol)
    setCountryList(false)
    if (country.country !== bioUserSchoolForm.schoolCountry) {
      schoolCountryChange(country.country)
    }
  }

  const selectState = (state: State) => {
    setBioUserSchoolInfoForm('schoolState', state.state)
    setStateList(false)
    if (state.state !== bioUserSchoolForm.schoolState) {
      schoolStateChange(state.state)
    }
  }

  const selectArea = (area: Area) => {
    setBioUserSchoolInfoForm('schoolArea', area.area)
    setBioUserSchoolInfoForm('schoolPlaceId', area.id)
    setIsAreaList(false)
  }

  const selectSchool = async (school: School) => {
    setBioUserSchoolInfoForm('schoolName', school.name)
    setBioUserSchoolInfoForm('schoolId', school._id)
    setBioUserSchoolInfoForm('schoolLogo', String(school.logo))
    setSchoolList(false)
    setIsNew(false)
    if (school.name !== bioUserSchoolForm.schoolName) {
      schoolNameChange()
    }
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const selectFaculty = async (faculty: Faculty) => {
    setBioUserSchoolInfoForm('schoolFacultyId', faculty._id)
    setBioUserSchoolInfoForm('schoolFaculty', faculty.name)
    setBioUserSchoolInfoForm('schoolFacultyUsername', faculty.username)
    setFacultyList(false)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const selectDepartment = async (department: Department) => {
    setBioUserSchoolInfoForm('schoolDepartmentId', department._id)
    setBioUserSchoolInfoForm('schoolDepartment', department.name)
    setBioUserSchoolInfoForm('schoolDepartmentUsername', department.username)
    setDepartmentList(false)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const selectAdmissionYear = async (year: number) => {
    setBioUserSchoolInfoForm('admittedAt', new Date(year, 0, 1))
    setIsAdmittedList(false)
  }

  const selectGraduationYear = async (year: number) => {
    setBioUserSchoolInfoForm('graduatedAt', new Date(year, 0, 1))
    setIsGraduatedList(false)
  }

  const getLevels = async (country: string) => {
    getAcademics(
      `/academic-levels/?inSchool=${bioUserSchoolForm.inSchool}&country=${country}`,
      setMessage
    )
  }

  const setEdit = () => {
    setCurrentEdit(true)
    // setShowInSchool(true)
  }

  const submitData = async (data: FormData) => {
    updateBioUserSchoolInfo(
      `${url}schools/${bioUser?._id}`,
      data,
      setMessage,
      () => router.replace(`/home/verification/education/history`)
    )
  }

  const handleSubmit = async () => {
    if (user && user.isVerified) {
      setMessage('To update these information, please contact support', false)
      return
    }

    const inputArray = bioUserSchoolForm.inSchool
      ? [
          {
            name: 'schoolContinent',
            value: bioUserSchoolForm.schoolContinent,
            rules: { blank: false, minLength: 3, maxLength: 100 },
            field: 'Continent',
          },
          {
            name: 'schoolYear',
            value: bioUserSchoolForm.schoolYear,
            rules: {
              blank: bioUserSchoolForm.inSchool ? false : true,
              minLength: 2,
              maxLength: 1000,
            },
            field: 'School Year',
          },
          {
            name: 'schoolCountry',
            value: bioUserSchoolForm.schoolCountry,
            rules: { blank: false, minLength: 3, maxLength: 100 },
            field: 'Country',
          },
          {
            name: 'schoolCountrySymbol',
            value: bioUserSchoolForm.schoolCountrySymbol,
            rules: { blank: true, maxLength: 100 },
            field: 'Country Symbol',
          },
          {
            name: 'schoolCountryFlag',
            value: bioUserSchoolForm.schoolCountryFlag,
            rules: { blank: false, maxLength: 100 },
            field: 'Country Flag',
          },
          {
            name: 'schoolState',
            value: bioUserSchoolForm.schoolState,
            rules: { blank: false, minLength: 2, maxLength: 100 },
            field: 'State',
          },
          {
            name: 'schoolArea',
            value: bioUserSchoolForm.schoolArea,
            rules: { blank: false, minLength: 2, maxLength: 100 },
            field: 'Area',
          },
          {
            name: 'schoolLevelName',
            value: bioUserSchoolForm.schoolLevelName,
            rules: { blank: true, minLength: 2, maxLength: 100 },
            field: 'School level name',
          },
          {
            name: 'schoolName',
            value: bioUserSchoolForm.schoolName,
            rules: { blank: true, minLength: 2, maxLength: 100 },
            field: 'School name',
          },
          {
            name: 'schoolPicture',
            value: bioUserSchoolForm.schoolPicture,
            rules: { blank: true, minLength: 2, maxLength: 100 },
            field: 'School picture',
          },
          {
            name: 'schoolLogo',
            value: bioUserSchoolForm.schoolLogo,
            rules: { blank: true, minLength: 2, maxLength: 100 },
            field: 'School logo',
          },
          {
            name: 'schoolId',
            value: bioUserSchoolForm.schoolId,
            rules: { blank: true, minLength: 2, maxLength: 100 },
            field: 'School id',
          },
          {
            name: 'schoolDepartment',
            value: bioUserSchoolForm.schoolDepartment,
            rules: { blank: true, minLength: 2, maxLength: 100 },
            field: 'School department',
          },
          {
            name: 'schoolDepartmentUsername',
            value: bioUserSchoolForm.schoolDepartmentUsername,
            rules: { blank: true, minLength: 2, maxLength: 100 },
            field: 'School department username',
          },
          {
            name: 'schoolDepartmentId',
            value: bioUserSchoolForm.schoolDepartmentId,
            rules: { blank: true, minLength: 2, maxLength: 100 },
            field: 'School department id',
          },
          {
            name: 'admittedAt',
            value: bioUserSchoolForm.admittedAt,
            rules: { blank: false, minLength: 2, maxLength: 1000 },
            field: 'Entry Date',
          },
          {
            name: 'schoolLevelName',
            value: bioUserSchoolForm.schoolLevelName,
            rules: { blank: false, minLength: 2, maxLength: 10000 },
            field: 'School academic level',
          },
          {
            name: 'action',
            value: 'Education',
            rules: { blank: true },
            field: 'Education',
          },
          {
            name: 'isEducation',
            value: true,
            rules: { blank: true },
            field: 'Education',
          },
          {
            name: 'ID',
            value: String(user?._id),
            rules: { blank: true },
            field: 'ID ',
          },
          {
            name: 'bioUSerId',
            value: String(bioUser?._id),
            rules: { blank: true, maxLength: 100 },
            field: 'continent',
          },
          {
            name: 'inSchool',
            value: bioUserSchoolForm.inSchool,
            rules: { blank: false },
            field: 'In School',
          },
          {
            name: 'isNew',
            value: isNew,
            rules: { blank: false, maxLength: 100 },
            field: 'Is school recorded',
          },
        ]
      : [
          {
            name: 'inSchool',
            value: bioUserSchoolForm.inSchool,
            rules: { blank: true, maxLength: 100 },
            field: 'In school',
          },
          {
            name: 'isEducation',
            value: true,
            rules: { blank: true, maxLength: 100 },
            field: 'In school',
          },
        ]

    if (bioUserSchoolForm.inSchool) {
      const { messages } = validateInputs(inputArray)
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
    }

    const data = appendForm(inputArray)

    setAlert(
      'Warning',
      'You will need to contact support to edit this information after verification is approved!',
      true,
      () => submitData(data)
    )
  }

  return (
    <>
      {isCurrentEdit ? (
        <div>
          <div className="flex uppercase mt-5 text-[var(--custom)] text-center justify-center w-full mb-5">
            Fill in details of your current school.
          </div>

          <div className="mb-5">
            <div className="text-center text-lg mb-2">
              Are you currently in any academic program?
            </div>

            <div className="flex justify-center">
              <div
                onClick={() => setBioUserSchoolInfoForm('inSchool', true)}
                className={`btn mx-1 ${
                  bioUserSchoolForm.inSchool ? '' : 'line'
                }`}
              >
                Yes I am
              </div>
              <div
                onClick={() => {
                  resetForm()
                  setBioUserSchoolInfoForm('inSchool', false)
                }}
                className={`btn mx-1 ${
                  !bioUserSchoolForm.inSchool ? '' : 'line'
                }`}
              >
                No I am not
              </div>
            </div>
          </div>

          {bioUserSchoolForm.inSchool && (
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
                  {bioUserSchoolForm.schoolCountry
                    ? bioUserSchoolForm.schoolCountry
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
              {bioUserSchoolForm.schoolCountry && (
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
                      {bioUserSchoolForm.schoolState
                        ? bioUserSchoolForm.schoolState
                        : 'Select State'}
                      <i className="ml-auto bi bi-caret-down-fill"></i>
                    </div>
                    {/*
                  {isStateList && (
                    <div className="w-full z-30 absolute left-0 top-[70px] border border-[var(--border)] bg-[var(--primary)] max-h-[300px] overflow-auto rounded-[5px] search"> */}
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
                  {bioUserSchoolForm.schoolState && (
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
                        {bioUserSchoolForm.schoolArea
                          ? bioUserSchoolForm.schoolArea
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
          )}

          {bioUserSchoolForm.schoolArea &&
            bioUserSchoolForm.inSchool &&
            academicResults.length > 0 &&
            bioUserSchoolForm.schoolArea && (
              <div className="round_box mb-10 flex flex-wrap">
                {academicResults.map((item, index) => (
                  <div
                    key={index}
                    className={`radio m-1 ${
                      item.isActive
                        ? 'text-[var(--custom)]'
                        : item.levelName === bioUserSchoolForm?.schoolLevelName
                        ? 'text-[var(--custom)]'
                        : ''
                    }`}
                    onClick={() => selectLevel(index, item)}
                  >
                    <div className="radio_circle">
                      {(item.isActive ||
                        item.levelName ===
                          bioUserSchoolForm?.schoolLevelName) && (
                        <div className="radio_dot"></div>
                      )}
                    </div>
                    {item.levelName}
                  </div>
                ))}
              </div>
            )}

          {bioUserSchoolForm?.schoolLevelName !== '' &&
            bioUserSchoolForm.schoolArea &&
            bioUserSchoolForm.inSchool && (
              <div className="relative mb-10">
                <div className="text-[12px] text-[var(--custom)]">
                  If your school did not appear, type it and click the search
                  icon
                </div>
                <div className={`input_wrap ml-auto active`}>
                  <input
                    ref={inputRef}
                    type="search"
                    onChange={handleSearchSchool}
                    className={`transparent-input flex-1 `}
                    placeholder={`Search ${
                      bioUserSchoolForm.inSchool ? 'current' : 'graduating'
                    } school`}
                  />
                  {schoolResults.length === 0 && (
                    <i
                      onClick={setSchool}
                      className="bi bi-search common-icon cursor-pointer"
                    ></i>
                  )}
                </div>
                {bioUserSchoolForm.schoolName && (
                  <div className="flex pb-1 my-2 border-b border-[var(--border-color)] xs:mx-[25px]">
                    {bioUserSchoolForm.schoolLogo && (
                      <Image
                        className="mr-5"
                        src={bioUserSchoolForm.schoolLogo}
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
                    {bioUserSchoolForm.schoolName}
                  </div>
                )}
                {/* {isSchoolList && schoolResults.length > 0 && ( */}
                <div
                  className={`dropList ${
                    isSchoolList && schoolResults ? 'rel' : ''
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

          {bioUserSchoolForm.schoolName && bioUserSchoolForm.inSchool && (
            <div
              className={`grid ${
                bioUserSchoolForm?.inSchool ? '' : 'grid-cols-2'
              } gap-2 mb-10`}
            >
              <div className="relative">
                <label className="label flex items-center w-full" htmlFor="">
                  Year of Admission
                </label>
                <div
                  onClick={() => {
                    setIsAdmittedList(!isAdmittedList)
                  }}
                  className="form-input cursor-pointer"
                >
                  {bioUserSchoolForm.admittedAt
                    ? new Date(bioUserSchoolForm.admittedAt).getFullYear()
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
              {!bioUserSchoolForm?.inSchool && (
                <div className="relative">
                  <label className="label flex items-center w-full" htmlFor="">
                    Year of Graduation
                  </label>
                  <div
                    onClick={() => {
                      setIsGraduatedList(!isGraduatedList)
                    }}
                    className="form-input cursor-pointer"
                  >
                    {bioUserSchoolForm.graduatedAt
                      ? new Date(bioUserSchoolForm.graduatedAt).getFullYear()
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
              )}
            </div>
          )}

          {bioUserSchoolForm.isAdvanced && bioUserSchoolForm.inSchool && (
            <>
              {bioUserSchoolForm.schoolLevelName !== '' &&
                bioUserSchoolForm.schoolName !== '' && (
                  <>
                    <div className="relative mb-10">
                      <div className="text-[12px] text-[var(--custom)]">
                        If your school have faculty, write it and click the
                        search icon if it did not appear.
                      </div>
                      <div className={`input_wrap ml-auto active `}>
                        <input
                          ref={inputRef}
                          type="search"
                          onChange={handleSearchFaculty}
                          className={`transparent-input flex-1 `}
                          placeholder="Enter your faculty"
                        />
                        {faculties.length === 0 && (
                          <i
                            onClick={setFaculty}
                            className="bi bi-search common-icon cursor-pointer"
                          ></i>
                        )}
                      </div>
                      {bioUserSchoolForm.schoolFaculty && (
                        <div className="flex pb-1 my-2 border-b border-[var(--border-color)] xs:mx-[25px]">
                          {bioUserSchoolForm.schoolFaculty}
                        </div>
                      )}
                      {/* {isFacultyList && faculties.length > 0 && ( */}
                      <div
                        className={`dropList ${
                          isFacultyList && faculties.length > 0 ? 'rel' : ''
                        }`}
                      >
                        {faculties.map((item, index) => (
                          <div
                            onClick={() => selectFaculty(item)}
                            key={index}
                            className="input_drop_list"
                          >
                            {item.name}
                          </div>
                        ))}
                      </div>
                      {/* )} */}
                    </div>

                    <div className="relative mb-10">
                      <div className="text-[12px] text-[var(--custom)]">
                        If you have department write it and click the search
                        icon if it did not appear.
                      </div>
                      <div className={`input_wrap ml-auto active `}>
                        <input
                          ref={inputRef}
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
                      {bioUserSchoolForm.schoolDepartment && (
                        <div className="flex pb-1 my-2 border-b border-[var(--border-color)] xs:mx-[25px]">
                          {bioUserSchoolForm.schoolDepartment}
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

          {bioUserSchoolForm?.schoolLevelName !== '' &&
            bioUserSchoolForm.schoolName !== '' &&
            bioUserSchoolForm.inSchool &&
            maxLevels.length > 0 && (
              <div className="rounded-[10px] border p-1 border-[var(--border-color)] mb-10 flex flex-wrap">
                {maxLevels.map((item, index) => (
                  <div
                    key={index}
                    className={`radio m-1 ${
                      item.isActive ||
                      bioUserSchoolForm.schoolYear.includes(String(index))
                        ? 'text-[var(--custom)]'
                        : ''
                    }`}
                    onClick={() => selectMaxLevel(index)}
                  >
                    <div className="radio_circle">
                      {item.isActive ||
                        (bioUserSchoolForm.schoolYear.includes(
                          String(index)
                        ) && <div className="radio_dot"></div>)}
                    </div>
                    {activeLevel.maxLevelName} {item.level + 1}
                  </div>
                ))}
              </div>
            )}

          <CustomBtn
            label="Submit Form"
            loading={loading}
            onClick={handleSubmit}
          />
          <div className="my-2" />
          {isCurrentEdit && bioUserState?.isEducation && (
            <CustomBtn label="Cancel" loading={false} onClick={cancelEdit} />
          )}
        </div>
      ) : bioUserSchoolInfo?.inSchool ? (
        <div className="round_box mt-10 mb-5">
          <div className="m-1 mb-5">
            <div className="text-sm">
              Place of {bioUserSchoolInfo?.inSchool ? 'Current' : 'Last'}{' '}
              Education
            </div>
            <div className="selected_item text-[var(--text-secondary)]">
              {bioUserSchoolInfo?.schoolArea} {bioUserSchoolInfo?.schoolState}{' '}
              State, {bioUserSchoolInfo?.schoolCountry}
            </div>
          </div>

          <div className="m-1 mb-5">
            <div className="text-sm">Current Education Level</div>
            <div className="selected_item text-[var(--text-secondary)]">
              {bioUserSchoolInfo?.schoolLevelName}
            </div>
          </div>

          {bioUserSchoolInfo?.schoolName && (
            <div className="m-1 mb-5">
              <div className="text-sm">Current Education Institution</div>
              <div className="selected_item text-[var(--text-secondary)]">
                {bioUserSchoolInfo.schoolName}
              </div>
            </div>
          )}

          {bioUserSchoolInfo?.schoolFaculty && (
            <div className="m-1 mb-5">
              <div className="text-sm">Faculty of Study</div>
              <div className="selected_item text-[var(--text-secondary)]">
                {bioUserSchoolInfo.schoolFaculty}
              </div>
            </div>
          )}

          {bioUserSchoolInfo?.schoolDepartment && (
            <div className="m-1 mb-5">
              <div className="text-sm">Department of Study</div>
              <div className="selected_item text-[var(--text-secondary)]">
                {bioUserSchoolInfo.schoolDepartment}
              </div>
            </div>
          )}

          {bioUserSchoolInfo?.schoolName && (
            <div className="m-1 mb-5">
              <div className="text-sm">
                Level of Study in {bioUserSchoolInfo.schoolName}
              </div>
              <div className="selected_item text-[var(--text-secondary)] last:border-b-0">
                {bioUserSchoolInfo.inSchool
                  ? bioUserSchoolInfo.schoolYear
                  : 'Graduated'}
              </div>
            </div>
          )}

          <CustomBtn
            loading={false}
            onClick={setEdit}
            label="Edit Information"
          />
        </div>
      ) : (
        <div className="round_box mt-10 mb-5">
          <div className="flex uppercase mt-5 text-[var(--custom)] text-center justify-center w-full mb-5">
            Your current academic institution.
          </div>
          <div className="relative py-5 mx-auto max-w-[300px] w-full flex-1 flex justify-center">
            <Image
              src="/images/not-found.png"
              loading="lazy"
              sizes="100vw"
              className="w-full h-full object-contain"
              width={0}
              height={0}
              style={{ height: 'auto', width: 200 }}
              alt="Default Avatar"
            />
            <div className="bg-[var(--secondary)] w-full py-3 absoluteCenter">
              <div className="text-xl uppercase text-center">
                No Current School Found
              </div>
            </div>
          </div>
          <CustomBtn
            loading={false}
            onClick={setEdit}
            label="Edit Information"
          />
        </div>
      )}
    </>
  )
}
