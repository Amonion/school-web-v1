'use client'
import Link from 'next/link'
import { appendForm, validateUsername } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { useState, useEffect } from 'react'
import DepartmentStore from '@/src/zustand/team/Department'
import { MessageStore } from '@/src/zustand/msgStore'
import { Department, FetchResponse } from '@/src/interface/team/interface'
import QuillEditor from '@/components/Team/Editor/QuillEditor'
import _debounce from 'lodash/debounce'
import SchoolStore from '@/src/zustand/team/School'
import apiRequest from '@/lib/axios'

const CreateDepartment: React.FC = () => {
  const url = '/schools/departments'
  let itemId: string | null = null
  const {
    formData,
    setForm,
    getDepartment,
    loading,
    postItem,
    departments,
    resetForm,
    updateItem,
  } = DepartmentStore()
  const { searchedSchools } = SchoolStore()
  // const { results, getFaculties } = FacultyStore();
  const [isEditing, setIsEditing] = useState(false)
  const [id, setId] = useState<string | null>('')
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  // const [faculty, seletFaculty] = useState("Select Faculty");
  // const [isFacultyList, setFacultyList] = useState(false);
  const [isUsernameTaken, setUsername] = useState(false)
  const [isUsernameInput, setUsernameInput] = useState(true)
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
    const fId = new URLSearchParams(query).get('facultyId')
    const sId = new URLSearchParams(query).get('schoolId')
    const sName = new URLSearchParams(query).get('faculty')
    const facultyUsername = new URLSearchParams(query).get('facultyUsername')
    setForm('faculty', sName)
    setForm('facultyId', fId)
    setForm('facultyUsername', facultyUsername)
    setForm('schoolId', sId)

    const initialize = async () => {
      if (itemId !== null) {
        setName(String(name))
        setId(itemId)
        setIsEditing(true)
        const existingItem = departments.find((item) => item._id === itemId)
        if (existingItem) {
          populateFields(existingItem)
        } else {
          await getDepartment(`${url}/${itemId}`, setMessage)
        }
      } else {
        setId(null)
        setIsEditing(false)
        setName('')
      }
    }

    initialize()
  }, [itemId])

  const populateFields = (item: Department) => {
    setContent(item.description)
    setForm('name', item.name)
    setForm('username', item.username)
    setForm('faculty', item.faculty)
    setForm('schoolId', item.schoolId)
    setForm('picture', item.picture)
    setForm('facultyId', item.facultyId)
    setForm('media', item.media)
    setForm('description', item.description)
    setForm('_id', item._id)
    // setUsernameInput(false);
    // seletFaculty(item.faculty);
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(name as keyof typeof formData, value)
  }

  const validateUsernameInput = () => {
    if (searchedSchools.length === 0 && formData.username) {
      setUsernameInput(false)
    }
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
        `/schools/departments/?username=${value}`
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

  const handleFileChange =
    (key: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files ? e.target.files[0] : null
      setForm(key, file)
    }

  const handleSubmit = async (e: React.FormEvent) => {
    const inputsToValidate = [
      {
        name: 'username',
        value: formData.username,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Username field',
      },
      {
        name: 'facultyUsername',
        value: formData.facultyUsername,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Faculty username',
      },
      {
        name: 'name',
        value: formData.name,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Department field',
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
        name: 'facultyId',
        value: formData.facultyId,
        rules: { blank: true, maxLength: 1000 },
        field: 'Faculty ID field',
      },
      {
        name: 'schoolId',
        value: formData.schoolId,
        rules: { blank: true, maxLength: 1000 },
        field: 'School ID field',
      },
      {
        name: 'faculty',
        value: formData.faculty,
        rules: { blank: true, maxLength: 1000 },
        field: 'Faculty field',
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
        'Sorry, please select another department username to continue',
        false
      )
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
          {name ? `Update ${name}` : `Create Department`}
        </div>

        <div className="grid-2 grid-lay">
          {/* <div className="flex flex-col relative">
            <label className="label" htmlFor="">
              Faculty Name
            </label>
            <div
              onClick={() => setFacultyList((e) => !e)}
              className="form-input cursor-pointer"
            >
              {faculty}
              <i
                className={`bi bi-caret-down-fill ml-auto ${
                  isFacultyList ? "active" : ""
                } `}
              ></i>
            </div>
            {isFacultyList && (
              <div className="input_drop">
                {results.map((item, index) => (
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
              Department
            </label>
            <input
              className="form-input"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter department name"
            />
          </div>

          <div className="flex flex-col relative">
            <label className="label" htmlFor="">
              Department Username
            </label>
            {isUsernameInput ? (
              <input
                className="form-input"
                name="username"
                onChange={handleUsernameSearch}
                onBlur={validateUsernameInput}
                type="text"
                placeholder="Enter department username"
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
                href={`/team/schools/departments/?id=${formData.facultyId}&name=${formData.faculty}&schoolId=${formData.schoolId}`}
                className="custom_btn ml-auto "
              >
                Departments Table
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default CreateDepartment
