'use client'
import Link from 'next/link'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { useState, useEffect } from 'react'
import CourseStore from '@/src/zustand/team/Courses'
// import DepartmentStore from "@/src/zustand/team/Department";
import { MessageStore } from '@/src/zustand/msgStore'
import { Course } from '@/src/interface/team/interface'
import QuillEditor from '@/components/Team/Editor/QuillEditor'

const CreateCourse: React.FC = () => {
  const url = '/schools/courses'
  let itemId: string | null = null
  const {
    formData,
    setForm,
    getCourses,
    loading,
    postItem,
    courses,
    resetForm,
    updateItem,
  } = CourseStore()
  const [isEditing, setIsEditing] = useState(false)
  const [id, setId] = useState<string | null>('')
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  // const [faculty, setDepartment] = useState("Select Department");
  const [semester, setSemester] = useState('Select Semester')
  const [level, setLevel] = useState('Select Level')
  // const [isDepartmentList, setDepartmentList] = useState(false);
  const [isSemesterList, setSemesterList] = useState(false)
  const [isLevelList, setLevelList] = useState(false)
  const { setMessage } = MessageStore()
  const [currentPage] = useState(1)
  const [page_size] = useState(5)
  const [sort] = useState('-createdAt')
  const [queryParams] = useState(
    `?page_size=${page_size}&page=${currentPage}&ordering=${sort}`
  )

  const semesters = ['First Semester', 'Second Semester']
  const levels = ['100', '200', '300', '400', '500', '600', '700']

  useEffect(() => {
    // getDepartments(
    //   `/schools/departments/?page_size=100&page=1&ordering=name`,
    //   setMessage
    // );
    resetForm()
  }, [])

  useEffect(() => {
    const query = window.location.search
    itemId = new URLSearchParams(query).get('id')
    setId(itemId)
    const name = new URLSearchParams(query).get('name')
    const dId = new URLSearchParams(query).get('dId')
    const fId = new URLSearchParams(query).get('fId')
    const sId = new URLSearchParams(query).get('sId')
    const dName = new URLSearchParams(query).get('dName')
    setForm('department', dName)
    setForm('departmentId', dId)
    setForm('facultyId', fId)
    setForm('schoolId', sId)

    const initialize = async () => {
      if (itemId !== null) {
        setName(String(name))
        setId(itemId)
        setIsEditing(true)
        const existingItem = courses.find((item) => item._id === itemId)
        if (existingItem) {
          populateFields(existingItem)
        } else {
          await getCourses(`${url}`, setMessage)
          const fetchedItems = CourseStore.getState().courses.find(
            (item) => item._id === itemId
          )
          if (fetchedItems) {
            populateFields(fetchedItems)
          } else {
            console.warn('Place with the specified ID was not found.')
          }
        }
      } else {
        setId(null)
        setIsEditing(false)
        setName('')
      }
    }

    initialize()
  }, [itemId, courses, getCourses])

  const populateFields = (item: Course) => {
    setContent(item.description)
    // setDepartment(item.department);
    setSemester(semesters[item.semester])
    setLevel(levels[item.level * 0.01 - 1])
    setForm('name', item.name)
    setForm('courseCode', item.courseCode)
    setForm('semester', item.semester)
    setForm('load', item.load)
    setForm('level', item.level)
    setForm('departmentId', item.departmentId)
    setForm('department', item.department)
    setForm('schoolId', item.schoolId)
    setForm('picture', item.picture)
    setForm('facultyId', item.facultyId)
    setForm('media', item.media)
    setForm('description', item.description)
    setForm('_id', item._id)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(name as keyof typeof formData, value)
  }

  // const handleResultClick = (item: Department) => {
  //   setForm("departmentId", item._id);
  //   setForm("department", item.name);
  //   setForm("schoolId", item.schoolId);
  //   setForm("facultyId", item.facultyId);
  //   setDepartmentList(false);
  //   setDepartment(item.name);
  // };

  const handleSemester = (index: number, name: string) => {
    setForm('semester', index + 1)
    setSemester(name)
    setSemesterList(false)
  }

  const handleLevel = (index: number, name: string) => {
    setForm('level', (index + 1) * 100)
    setLevel(name)
    setLevelList(false)
  }

  const handleFileChange =
    (key: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files ? e.target.files[0] : null
      setForm(key, file)
    }

  const handleSubmit = async (e: React.FormEvent) => {
    const inputsToValidate = [
      {
        name: 'load',
        value: formData.load,
        rules: { blank: true, maxLength: 100 },
        field: 'Unit field',
      },
      {
        name: 'level',
        value: formData.level,
        rules: { blank: true, maxLength: 100 },
        field: 'Level field',
      },
      {
        name: 'semester',
        value: formData.semester,
        rules: { blank: true, maxLength: 100 },
        field: 'Semester field',
      },
      {
        name: 'name',
        value: formData.name,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: 'Course field',
      },
      {
        name: 'courseCode',
        value: formData.courseCode,
        rules: { blank: true, maxLength: 1000 },
        field: 'Course code field',
      },

      {
        name: 'description',
        value: content,
        rules: { blank: false, maxLength: 10000 },
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
        rules: { blank: true, maxLength: 100 },
        field: 'Faculty ID field',
      },
      {
        name: 'departmentId',
        value: formData.departmentId,
        rules: { blank: true, maxLength: 100 },
        field: 'Department ID field',
      },
      {
        name: 'department',
        value: formData.department,
        rules: { blank: true, maxLength: 1000 },
        field: 'Department field',
      },
      {
        name: 'schoolId',
        value: formData.schoolId,
        rules: { blank: true, maxLength: 1000 },
        field: 'School ID field',
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
      updateItem(`${url}/${id}${queryParams}`, data, setMessage)
    } else {
      postItem(`${url}${queryParams}`, data, setMessage)
    }
  }

  return (
    <>
      <div className="card_body">
        <div className="custom_sm_title">
          {name ? `Update ${name}` : `Create Course`}
        </div>

        <div className="grid-2 grid-lay">
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Course
            </label>
            <input
              className="form-input"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter course name"
            />
          </div>

          <div className="flex flex-col relative">
            <label className="label" htmlFor="">
              Semester
            </label>
            <div
              onClick={() => setSemesterList((e) => !e)}
              className="form-input cursor-pointer"
            >
              {semester}
              <i
                className={`bi bi-caret-down-fill ml-auto ${
                  isSemesterList ? 'active' : ''
                } `}
              ></i>
            </div>
            {isSemesterList && (
              <div className="input_drop">
                {semesters.map((item, index) => (
                  <div
                    onClick={() => handleSemester(index, item)}
                    key={index}
                    className="input_drop_list"
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col relative">
            <label className="label" htmlFor="">
              Level
            </label>
            <div
              onClick={() => setLevelList((e) => !e)}
              className="form-input cursor-pointer"
            >
              {level}
              <i
                className={`bi bi-caret-down-fill ml-auto ${
                  isLevelList ? 'active' : ''
                } `}
              ></i>
            </div>
            {isLevelList && (
              <div className="input_drop">
                {levels.map((item, index) => (
                  <div
                    onClick={() => handleLevel(index, item)}
                    key={index}
                    className="input_drop_list"
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Course Code
            </label>
            <input
              className="form-input"
              name="courseCode"
              value={formData.courseCode}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter course code"
            />
          </div>

          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Course Unit
            </label>
            <input
              className="form-input"
              name="load"
              value={formData.load}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter course unit"
            />
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
                href={`/team/schools/courses?id=${formData.departmentId}&name=${formData.department}&facultyId=${formData.facultyId}&schoolId=${formData.schoolId}`}
                className="custom_btn ml-auto "
              >
                Course Table
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default CreateCourse
