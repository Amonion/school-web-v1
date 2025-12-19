'use client'
import Tiptap from '@/components/Team/Editor/TextEditor'
import LinkedPagination from '@/components/Team/LinkedPagination'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { MessageStore } from '@/src/zustand/notification/Message'
import AcademicStore, { AcademicLevel } from '@/src/zustand/school/Academic'
import OfficeStore from '@/src/zustand/utility/Office'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import CreateSubject from './CreateSubject'
import CourseStore from '@/src/zustand/school/Courses'

export default function AcademicLevels() {
  const {
    academicForm,
    selectedItems,
    count,
    page_size,
    loading,
    academicResults,
    isAllChecked,
    reshuffleResults,
    setForm,
    getAcademics,
    toggleActive,
    toggleChecked,
    toggleAllSelected,
    deleteItem,
    massDelete,
    updateItem,
    postItem,
    getAcademic,
  } = AcademicStore()
  const { setMessage, setBoxVisibility, isBoxVisible } = MessageStore()
  const { officeForm } = OfficeStore()
  const { isSubject, setSubject, setIsSubject } = CourseStore()
  const [isEditing, setIsEditing] = useState(false)
  const [inSchool, setInSchool] = useState(false)
  const [content, setContent] = useState('')
  const [query, setQuery] = useState('')
  const { page } = useParams()
  const url = '/academic-levels/'

  useEffect(() => {
    if (academicForm._id) {
      setIsEditing(true)
      setBoxVisibility(true)
      reshuffleResults()
      if (academicForm.inSchool) {
        setInSchool(true)
      }
    }
  }, [academicForm])

  useEffect(() => {
    if (officeForm.username) {
      getAcademics(
        `/academic-levels/?country=${officeForm.country}&page_size=${page_size}`,
        setMessage
      )
      setQuery(`country=${officeForm.country}`)
    }
  }, [officeForm])

  const deletePlace = async (id: string) => {
    await deleteItem(`${url}${id}/`, setMessage)
  }

  const editItem = async (id: string) => {
    getAcademic(`${url}${id}`, setMessage, () => setBoxVisibility(false))
  }

  const createSubject = async (item: AcademicLevel, index: number) => {
    setSubject('country', item.country)
    setSubject('levelName', item.levelName)
    setSubject('maxLevel', item.maxLevel)
    setSubject('schoolUsername', officeForm.username)
    setIsSubject(true)
    toggleActive(index)
  }

  const DeleteItems = async () => {
    if (selectedItems.length === 0) {
      setMessage('Please select at least one academic level to delete', false)
      return
    }
    await massDelete(`${url}mass-delete/`, selectedItems, setMessage)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(name as keyof typeof academicForm, value)
  }

  const handleSubmit = () => {
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
    if (isEditing) {
      updateItem(
        `${url}${academicForm._id}?country=${officeForm.country}&page_size=${page_size}`,
        data,
        setMessage,
        () => setBoxVisibility(false)
      )
    } else {
      postItem(
        `${url}?country=${officeForm.country}&page_size=${page_size}`,
        data,
        setMessage,
        () => setBoxVisibility(false)
      )
    }
  }
  return (
    <>
      <div className="card_body sharp">
        <div className="overflow-auto mb-5">
          {academicResults.length > 0 ? (
            <table className="">
              <thead>
                <tr>
                  <th>S/N</th>
                  <th>Level Name</th>
                  <th>Certificate</th>
                  <th>Max Level</th>
                  <th>Level</th>
                </tr>
              </thead>
              <tbody>
                {academicResults.map((item, index) => (
                  <tr
                    key={index}
                    className={`${
                      index % 2 === 1 ? 'bg-[var(--white-gray)]' : ''
                    }`}
                  >
                    <td>
                      <div className="flex items-center">
                        <div
                          className={`checkbox ${
                            item.isChecked ? 'active' : ''
                          }`}
                          onClick={() => toggleChecked(index)}
                        >
                          {item.isChecked && (
                            <i className="bi bi-check text-white text-lg"></i>
                          )}
                        </div>
                        {(Number(page ? page : 1) - 1) * page_size + index + 1}
                        <i
                          onClick={() => toggleActive(index)}
                          className="bi bi-three-dots-vertical text-lg cursor-pointer"
                        ></i>
                      </div>
                      {item.isActive && (
                        <div className="card_list">
                          <span
                            onClick={() => toggleActive(index)}
                            className="more_close "
                          >
                            X
                          </span>
                          <div
                            className="card_list_item"
                            onClick={() => editItem(item._id)}
                          >
                            Edit Level
                          </div>
                          {item.inSchool && (
                            <div
                              className="card_list_item"
                              onClick={() => createSubject(item, index)}
                            >
                              Create Subject
                            </div>
                          )}
                          <Link
                            href={`/authority/curriculum/subjects?level=${item.level}&levelname=${item.levelName}&maxlevel=${item.maxLevel}`}
                            className="card_list_item"
                          >
                            Subjects
                          </Link>
                          <div
                            className="card_list_item"
                            onClick={() => deletePlace(item._id)}
                          >
                            Delete Level
                          </div>
                        </div>
                      )}
                    </td>

                    <td>{item.levelName}</td>
                    <td>{item.certificateName}</td>
                    <td>{item.maxLevel}</td>
                    <td>{item.level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="relative flex justify-center">
              <div className="not_found_text">No Academic Level Found</div>

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
          )}
        </div>

        <LinkedPagination
          url={`/authority/curriculum/academic-levels`}
          count={count}
          page_size={20}
          query={query}
        />
        <div className="table_action mt-3">
          {loading ? (
            <button className="custom_btn ">
              <i className="bi bi-opencollective loading"></i>

              <div>Processing...</div>
            </button>
          ) : (
            <>
              {academicResults.length > 0 && (
                <>
                  <button
                    className="flex items-center cursor-pointer text-[var(--custom)] mr-5"
                    onClick={toggleAllSelected}
                  >
                    <div className={`checkbox ${isAllChecked ? 'active' : ''}`}>
                      {isAllChecked && (
                        <i className="bi bi-check text-white text-lg"></i>
                      )}
                    </div>
                    Select All
                  </button>
                  <button
                    className="flex items-center cursor-pointer text-[var(--custom)]"
                    onClick={DeleteItems}
                  >
                    <i className="bi bi-trash text-lg mr-2"></i>
                    Delete
                  </button>
                  <button
                    onClick={() => setBoxVisibility(true)}
                    className="custom_btn ml-auto"
                  >
                    Create Level
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {isBoxVisible && (
        <div
          onClick={() => setBoxVisibility(false)}
          className="fixed bg-black/50  w-full h-full flex items-center justify-center z-40 top-0 left-0"
        >
          <div
            onClick={(e) => {
              e.stopPropagation()
            }}
            className="flex w-full max-w-[1200px]"
          >
            <div className="w-0 md:w-[290px]"></div>
            <div className="card_body w-full overflow-auto min-h-[300px] max-h-[100vh] sharp flex-1 border border-[var(--border)]">
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
                onChange={(e) => {
                  setContent(e)
                  setForm('description', e)
                }}
              />
              <div className="table-action flex flex-wrap">
                <div
                  onClick={() => {
                    setInSchool((e) => !e)
                  }}
                  className="custom_btn line neutral mr-5"
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
                <button
                  className="custom_btn mr-3 success"
                  onClick={() => handleSubmit()}
                >
                  Submit
                </button>

                <button
                  className="custom_btn ml-auto"
                  onClick={() => setBoxVisibility(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isSubject && <CreateSubject />}
    </>
  )
}
