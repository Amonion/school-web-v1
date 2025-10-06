'use client'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { useState, useEffect } from 'react'
import { apiRequest } from '@/lib/axios'
import Tiptap from '@/components/Team/Editor/TextEditor'
import { MessageStore } from '@/src/zustand/notification/Message'
import AcademicStore from '@/src/zustand/school/Academic'

const CreatePlace: React.FC = () => {
  const url = '/academic-levels/'
  let itemId: string | null = null
  const [isEditing, setIsEditing] = useState(false)
  const [inSchool, setInSchool] = useState(false)
  const [content, setContent] = useState<string>('')
  const [id, setId] = useState<string | null>('')
  const [name, setName] = useState('')
  const { setMessage } = MessageStore()
  const {
    formData,
    setForm,
    getAcademic,
    loading,
    academicResults,
    resetForm,
    updateItem,
    postItem,
  } = AcademicStore()

  interface Response {
    id?: string
    country: string
    countryFlag: string
  }

  useEffect(() => {
    const fetchPlace = async () => {
      const query = window.location.search
      const pId = new URLSearchParams(query).get('pId')
      if (pId) {
        const response = await apiRequest<Response>(`/places/${pId}`)
        if (response?.data) {
          const data = response?.data
          setForm('placeId', pId)
          setForm('country', data.country)
          setForm('countryFlag', data.countryFlag)
        }
      }
    }
    fetchPlace()
    resetForm()
  }, [])

  useEffect(() => {
    setInSchool(formData.inSchool)
  }, [formData.inSchool])

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
        const existingItem = academicResults.find((item) => item._id === itemId)
        if (existingItem) {
          AcademicStore.setState({ formData: existingItem })
          setInSchool(existingItem.inSchool)
        } else {
          await getAcademic(`${url}${itemId}`, setMessage)
        }
      } else {
        setId(null)
        setIsEditing(false)
        setName('')
      }
    }

    initialize()
  }, [itemId])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(name as keyof typeof formData, value)
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
        name: 'description',
        value: content,
        rules: { blank: false, maxLength: 10000 },
        field: 'Description field',
      },
      {
        name: 'country',
        value: formData.country,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: 'Country field',
      },
      {
        name: 'countryFlag',
        value: formData.countryFlag,
        rules: { blank: false },
        field: 'Country Flag field',
      },
      {
        name: 'level',
        value: formData.level,
        rules: { blank: true, maxLength: 2 },
        field: 'Level field',
      },
      {
        name: 'inSchool',
        value: inSchool,
        rules: { blank: false },
        field: 'In School ',
      },
      {
        name: 'levelName',
        value: formData.levelName,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: 'Level name field',
      },
      {
        name: 'section',
        value: formData.section,
        rules: { blank: false, maxLength: 1000 },
        field: 'Section name',
      },
      {
        name: 'subsection',
        value: formData.subsection,
        rules: { blank: false, maxLength: 1000 },
        field: 'Subsection name',
      },
      {
        name: 'institution',
        value: formData.institution,
        rules: { blank: false, maxLength: 1000 },
        field: 'Institution name',
      },
      {
        name: 'maxLevel',
        value: formData.maxLevel,
        rules: { blank: false, maxLength: 1000 },
        field: 'Max Level field',
      },
      {
        name: 'maxLevelName',
        value: formData.maxLevelName,
        rules: { blank: false, maxLength: 1000 },
        field: 'Max level name',
      },
      {
        name: 'certificate',
        value: formData.certificate,
        rules: { blank: false, maxSize: 10 },
        field: 'Certificate file',
      },
      {
        name: 'certificateName',
        value: formData.certificateName,
        rules: { blank: false, maxLength: 1000 },
        field: 'Certificate name',
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
      updateItem(`${url}${id}`, data, setMessage)
    } else {
      await postItem(`${url}`, data, setMessage)
    }
  }

  return (
    <>
      <div className="card_body">
        <div className="custom_sm_title">
          {name ? `Update ${name}` : `Create Level`}
        </div>
        <div className="grid-2 grid-lay">
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Level Name
            </label>
            <input
              className="form-input"
              name="levelName"
              value={formData.levelName}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter level name"
            />
          </div>
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Level
            </label>
            <input
              className="form-input"
              name="level"
              value={formData.level}
              onChange={handleInputChange}
              type="number"
              placeholder="Enter level"
            />
          </div>

          {inSchool && (
            <>
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Instituion Type
                </label>
                <input
                  className="form-input"
                  name="institution"
                  value={formData.institution}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="Enter institution"
                />
              </div>
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Max Level
                </label>
                <input
                  className="form-input"
                  name="maxLevel"
                  value={formData.maxLevel}
                  onChange={handleInputChange}
                  type="number"
                  placeholder="Enter max level"
                />
              </div>
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Max Level Name
                </label>
                <input
                  className="form-input"
                  name="maxLevelName"
                  value={formData.maxLevelName}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="Enter max level name"
                />
              </div>
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Section
                </label>
                <input
                  className="form-input"
                  name="section"
                  value={formData.section}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="Enter section"
                />
              </div>
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Subsection
                </label>
                <input
                  className="form-input"
                  name="subsection"
                  value={formData.subsection}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="Enter subsection"
                />
              </div>
            </>
          )}

          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Certificate Name
            </label>
            <input
              className="form-input"
              name="certificateName"
              value={formData.certificateName}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter certificate name"
            />
          </div>
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
              <div
                onClick={() => {
                  setInSchool((e) => !e)
                }}
                className="custom_btn line neutral"
              >
                <div
                  className={`checkbox ${inSchool ? 'active' : ''}`}
                  onClick={() => setInSchool((e) => !e)}
                >
                  {inSchool && (
                    <i className="bi bi-check text-white text-lg"></i>
                  )}
                </div>
                In School
              </div>
              <label htmlFor="banner" className="custom_btn ">
                <input
                  className="input-file"
                  type="file"
                  name="certificate"
                  id="banner"
                  accept="image/*"
                  onChange={handleFileChange('certificate')}
                />
                <i className="bi bi-cloud-arrow-up text-2xl mr-2"></i>
                Certificate
              </label>
              <button className="custom_btn" onClick={handleSubmit}>
                {`${isEditing ? 'Update Level' : 'Create Level'}`}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default CreatePlace
