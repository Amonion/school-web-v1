'use client'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { useState } from 'react'
import Tiptap from '@/components/Team/Editor/TextEditor'
import { MessageStore } from '@/src/zustand/notification/Message'
import AcademicStore from '@/src/zustand/school/Academic'
import { useParams } from 'next/navigation'

const CreateAcademicLevel: React.FC = () => {
  const url = '/academic-levels/'
  const { page, country } = useParams()
  const [inSchool, setInSchool] = useState(false)
  const [content, setContent] = useState<string>('')
  const { setMessage } = MessageStore()
  const { academicForm, loading, showForm, setForm, updateItem, postItem } =
    AcademicStore()
  const params = `?country=${country}&page_size=20&page=${
    page ? page : 1
  }&ordering=level`

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(name as keyof typeof academicForm, value)
  }

  const handleFileChange =
    (key: keyof typeof academicForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files ? e.target.files[0] : null
      setForm(key, file)
    }

  const handleSubmit = async () => {
    const inputsToValidate = [
      {
        name: 'description',
        value: content,
        rules: { blank: false, maxLength: 10000 },
        field: 'Description field',
      },
      {
        name: 'country',
        value: academicForm.country,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: 'Country field',
      },
      {
        name: 'countryFlag',
        value: academicForm.countryFlag,
        rules: { blank: false },
        field: 'Country Flag field',
      },
      {
        name: 'level',
        value: academicForm.level,
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
        value: academicForm.levelName,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: 'Level name field',
      },
      {
        name: 'section',
        value: academicForm.section,
        rules: { blank: false, maxLength: 1000 },
        field: 'Section name',
      },
      {
        name: 'subsection',
        value: academicForm.subsection,
        rules: { blank: false, maxLength: 1000 },
        field: 'Subsection name',
      },
      {
        name: 'institution',
        value: academicForm.institution,
        rules: { blank: false, maxLength: 1000 },
        field: 'Institution name',
      },
      {
        name: 'maxLevel',
        value: academicForm.maxLevel,
        rules: { blank: false, maxLength: 1000 },
        field: 'Max Level field',
      },
      {
        name: 'maxLevelName',
        value: academicForm.maxLevelName,
        rules: { blank: false, maxLength: 1000 },
        field: 'Max level name',
      },
      {
        name: 'certificate',
        value: academicForm.certificate,
        rules: { blank: false, maxSize: 10 },
        field: 'Certificate file',
      },
      {
        name: 'certificateName',
        value: academicForm.certificateName,
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
    const data = appendForm(inputsToValidate)
    if (academicForm._id) {
      updateItem(`${url}${academicForm._id}${params}`, data, setMessage)
    } else {
      await postItem(`${url}${params}`, data, setMessage)
    }
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
          <div className="card_body sharp">
            <div className="custom_sm_title">
              {academicForm._id ? `Update Academic Level` : `Create Level`}
            </div>
            <div className="grid-2 grid-lay">
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Level Name
                </label>
                <input
                  className="form-input"
                  name="levelName"
                  value={academicForm.levelName}
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
                  value={academicForm.level}
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
                      value={academicForm.institution}
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
                      value={academicForm.maxLevel}
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
                      value={academicForm.maxLevelName}
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
                      value={academicForm.section}
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
                      value={academicForm.subsection}
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
                  value={academicForm.certificateName}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="Enter certificate name"
                />
              </div>
            </div>
            <Tiptap
              value={content}
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
                    {`${academicForm._id ? 'Update Level' : 'Create Level'}`}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CreateAcademicLevel
