'use client'
import Link from 'next/link'
import { appendForm, validateUsername } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { useState, useEffect } from 'react'
import FacultyStore from '@/src/zustand/team/Faculty'
// import SchoolStore from "@/src/zustand/team/School";
import { MessageStore } from '@/src/zustand/msgStore'
import { Faculty, FetchResponse } from '@/src/interface/team/interface'
import QuillEditor from '@/components/Team/Editor/QuillEditor'
import apiRequest from '@/lib/axios'
import _debounce from 'lodash/debounce'

const CreateFaculty: React.FC = () => {
  const url = '/schools/faculties'
  let itemId: string | null = null
  const {
    formData,
    setForm,
    getFaculty,
    searchedFacultys,
    loading,
    postItem,
    results,
    resetForm,
    updateItem,
  } = FacultyStore()
  // const { searchedSchools } = SchoolStore();
  const [isEditing, setIsEditing] = useState(false)
  const [id, setId] = useState<string | null>('')
  // const [schoolId, setSchoolId] = useState<string | null>("");
  // const [schoolName, setSchoolName] = useState<string | null>("");
  const [name, setName] = useState('')
  const [isUsernameTaken, setUsername] = useState(false)
  const [isUsernameInput, setUsernameInput] = useState(true)
  const [content, setContent] = useState('')
  // const [isResultList, setResultList] = useState(false);
  // const [isSearchInput, setSearchInput] = useState(true);
  const { setMessage } = MessageStore()
  const [currentPage] = useState(1)
  const [page_size] = useState(5)
  const [sort] = useState('-createdAt')
  const [queryParams] = useState(
    `?page_size=${page_size}&page=${currentPage}&ordering=${sort}`
  )

  useEffect(() => {
    resetForm()
  }, [])

  useEffect(() => {
    const query = window.location.search
    itemId = new URLSearchParams(query).get('id')
    setId(itemId)
    const name = new URLSearchParams(query).get('name')
    const sId = new URLSearchParams(query).get('schoolId')
    const sName = new URLSearchParams(query).get('school')
    // const facultyUsername = new URLSearchParams(query).get("facultyUsername");
    const schoolUsername = String(
      new URLSearchParams(query).get('schoolUsername')
    )
    setForm('school', sName)
    setForm('schoolId', sId)
    setForm('schoolUsername', schoolUsername)

    const initialize = async () => {
      if (itemId !== null) {
        setName(String(name))
        setId(itemId)
        setIsEditing(true)
        const existingItem = results.find((item) => item._id === itemId)
        if (existingItem) {
          populateFields(existingItem)
        } else {
          await getFaculty(`${url}/${itemId}`, setMessage)
          setUsernameInput(false)
        }
      } else {
        setId(null)
        setIsEditing(false)
        setName('')
      }
    }

    initialize()
  }, [itemId])

  const populateFields = (item: Faculty) => {
    setContent(item.description)
    setForm('name', item.name)
    setForm('username', item.username)
    setForm('school', item.school)
    setForm('picture', item.picture)
    setForm('schoolId', item.schoolId)
    setForm('media', item.media)
    setForm('description', item.description)
    setForm('_id', item._id)
    setUsernameInput(false)
    // setSearchInput(false);
  }

  const validateUsernameInput = () => {
    if (searchedFacultys.length === 0 && formData.username) {
      setUsernameInput(false)
    }
  }

  // const validateSearchInput = () => {
  //   if (searchedSchools.length === 0 && formData.school) {
  //     setSearchInput(false);
  //   }
  // };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(name as keyof typeof formData, value)
  }

  const handleUsernameSearch = _debounce(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      const isUsernameValid = validateUsername(value)
      if (!isUsernameValid) {
        setMessage(
          'Sorry! username can only contain alphanumeric values, underscore, full stop or hyphen',
          false
        )
        return
      }
      const response = await apiRequest<FetchResponse>(
        `/schools/faculties/?username=${value}`
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

  // const handleResultClick = (item: School) => {
  //   setForm("schoolId", item._id);
  //   setForm("school", item.name);
  //   setResultList(false);
  //   setSearchInput(false);
  // };

  // const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = e.target.value;
  //   setResultList(true);
  //   searchSchool(`/schools/search/?name=${value}`);
  // };

  const handleFileChange =
    (key: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files ? e.target.files[0] : null
      setForm(key, file)
    }

  const handleSubmit = async (e: React.FormEvent) => {
    const inputsToValidate = [
      {
        name: 'name',
        value: formData.name,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Faculty field',
      },
      {
        name: 'username',
        value: formData.username,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Username field',
      },

      {
        name: 'description',
        value: content,
        rules: { blank: false, maxLength: 1000 },
        field: 'Description field',
      },

      {
        name: 'media',
        value: formData.media,
        rules: { blank: false, maxSize: 10 },
        field: 'Media field',
      },
      {
        name: 'picture',
        value: formData.picture,
        rules: { blank: false, maxSize: 10 },
        field: 'Picture field',
      },
      {
        name: 'schoolUsername',
        value: formData.schoolUsername,
        rules: { blank: true },
        field: 'School username',
      },
      {
        name: 'schoolId',
        value: formData.schoolId,
        rules: { blank: true, maxLength: 1000 },
        field: 'School ID field',
      },
      {
        name: 'school',
        value: formData.school,
        rules: { blank: true, maxLength: 1000 },
        field: 'School field',
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

    if (isUsernameTaken) {
      setMessage(
        'Sorry, please select another faculty username to continue',
        false
      )
      return
    }

    const firstNonEmptyMessage = getFirstNonEmptyMessage(messages)
    if (firstNonEmptyMessage) {
      setMessage(firstNonEmptyMessage, false)
      return
    }

    e.preventDefault()
    const data = appendForm(inputsToValidate)
    if (isEditing) {
      updateItem(`${url}/${id}${queryParams}`, data, setMessage)
    } else {
      postItem(`${url}${queryParams}`, data, setMessage)
    }
  }

  return (
    <>
      <div className="card_body">
        <div className="custom_sm_title">
          {name ? `Update ${name}` : `Create School Faculty`}
        </div>

        <div className="grid-2 grid-lay">
          {/* <div className="flex flex-col relative">
            <label className="label" htmlFor="">
              School Name
            </label>
            {isSearchInput ? (
              <input
                className="form-input"
                name="school"
                onChange={handleSearch}
                onBlur={validateSearchInput}
                type="text"
                placeholder="Search school"
              />
            ) : (
              <div onClick={() => setSearchInput(true)} className="form-input">
                {formData.school}
              </div>
            )}
            {isResultList && (
              <div className="input_drop">
                {searchedSchools.map((item, index) => (
                  <div
                    onClick={() => handleResultClick(item)}
                    key={index}
                    className="input_drop_list"
                  >
                    {item.name}
                  </div>
                ))}
              </div>
            )}
          </div> */}

          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Faculty
            </label>
            <input
              className="form-input"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter name"
            />
          </div>

          <div className="flex flex-col relative">
            <label className="label" htmlFor="">
              Faculty Username
            </label>
            {isUsernameInput ? (
              <input
                className="form-input"
                name="username"
                onChange={handleUsernameSearch}
                onBlur={validateUsernameInput}
                type="text"
                placeholder="Enter faculty username"
              />
            ) : (
              <div
                onClick={() => setUsernameInput(true)}
                className="form-input"
              >
                {formData.username}
              </div>
            )}
          </div>
        </div>

        <QuillEditor
          contentValue={content}
          onChange={(content) => setContent(content)}
        />

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
                  name="picture"
                  id="banner"
                  accept="image/*"
                  onChange={handleFileChange('picture')}
                />
                <i className="bi bi-cloud-arrow-up text-2xl mr-2"></i>
                Picture
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
              <button className="custom_btn" onClick={handleSubmit}>
                Submit
              </button>
              <Link
                href={`/team/schools/faculties/?id=${formData.schoolId}&name=${formData.school}`}
                className="custom_btn ml-auto "
              >
                Faculties Table
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default CreateFaculty
