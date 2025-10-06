'use client'
import PageTitle from '@/components/PageTitle'
import QuillEditor from '@/components/Team/Editor/QuillEditor'
import LinkedPagination from '@/components/Team/LinkedPagination'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { MessageStore } from '@/src/zustand/notification/Message'
import CurriculumStore from '@/src/zustand/school/Curriculum'
import OfficeStore from '@/src/zustand/utility/Office'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Curriculums() {
  const { setMessage, setBoxVisibility, isBoxVisible } = MessageStore()
  const { officeForm } = OfficeStore()
  const {
    curriculums,
    curriculumForm,
    page_size,
    loading,
    count,
    updateCurriculum,
    setForm,
    reshuffleResults,
    getCurriculum,
    getCurriculums,
  } = CurriculumStore()
  const [content, setContent] = useState('')
  const [query, setQuery] = useState('')
  const { page } = useParams()
  const url = '/academic-levels/curriculums'

  useEffect(() => {
    if (curriculumForm._id) {
      reshuffleResults()
      setContent(curriculumForm.content)
    }
  }, [curriculumForm])

  useEffect(() => {
    const currentPage = Number(page)
    if (officeForm.country && isNaN(currentPage)) {
      getCurriculums(
        `${url}/?country=${officeForm.country}&page_size=${page_size}`,
        setMessage
      )
      setQuery(`country=${officeForm.country}`)
    }
  }, [officeForm])

  useEffect(() => {
    if (page && Number(page) > 0 && officeForm.country) {
      getCurriculums(
        `${url}/?country=${officeForm.country}&page_size=${page_size}&page=${page}`,
        setMessage
      )
    }
  }, [page, officeForm])

  const editItem = async (id: string) => {
    getCurriculum(`${url}/${id}`, setMessage, () => setBoxVisibility(true))
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(name as keyof typeof curriculumForm, value)
  }

  const handleSubmit = () => {
    const inputsToValidate = [
      {
        name: 'content',
        value: content,
        rules: { blank: true },
        field: 'Content field',
      },
      {
        name: 'country',
        value: curriculumForm.country,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: 'Country field',
      },

      {
        name: 'title',
        value: curriculumForm.title,
        rules: { blank: true },
        field: 'Title field',
      },
      {
        name: 'level',
        value: curriculumForm.level,
        rules: { blank: false },
        field: 'Level',
      },
      {
        name: 'levelName',
        value: curriculumForm.levelName,
        rules: { blank: true },
        field: 'Level name field',
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
    updateCurriculum(
      `${url}/${curriculumForm._id}?country=${officeForm.country}&page_size=${page_size}`,
      data,
      setMessage,
      () => setBoxVisibility(false)
    )
  }
  return (
    <>
      <PageTitle page="Curriculum:" title={officeForm.name} />

      <div className="card_body sharp">
        <div className="overflow-auto mb-5">
          {curriculums.length > 0 ? (
            <table className="">
              <thead>
                <tr>
                  <th>SN</th>
                  <th>Level</th>
                  <th>Title</th>
                  <th>Content</th>
                </tr>
              </thead>
              <tbody>
                {curriculums.map((item, index) => (
                  <tr
                    key={index}
                    className={`${
                      index % 2 === 1 ? 'bg-[var(--white-gray)]' : ''
                    }`}
                  >
                    <td>
                      {(Number(page ? page : 1) - 1) * page_size + index + 1}
                    </td>

                    <td
                      onClick={() => editItem(item._id)}
                      className="cursor-pointer text-[var(--custom)]"
                    >
                      {item.levelName} {item.level}
                    </td>

                    <td>{item.title}</td>

                    <td>
                      <div
                        className="line-clamp-3 overflow-ellipsis"
                        dangerouslySetInnerHTML={{
                          __html: item.content,
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="relative flex justify-center">
              <div className="not_found_text">No Curriculum Found</div>

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
          url={`/authority/curriculum`}
          count={count}
          page_size={page_size}
          query={query}
        />
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
            {officeForm.username === 'Minister' ? (
              <div className="card_body w-full overflow-auto min-h-[300px] max-h-[100vh] sharp flex-1 border border-[var(--border)]">
                <div className="grid-2 grid-lay">
                  {officeForm.username === 'Minister' ? (
                    <div className="flex flex-col">
                      <label className="label" htmlFor="">
                        Level Name
                      </label>
                      <input
                        className="form-input"
                        name="levelName"
                        value={curriculumForm.levelName}
                        onChange={handleInputChange}
                        type="text"
                        placeholder="Enter level name"
                      />
                    </div>
                  ) : (
                    <div className="form-input">{curriculumForm.levelName}</div>
                  )}
                  {officeForm.username === 'Minister' ? (
                    <div className="flex flex-col">
                      <label className="label" htmlFor="">
                        Title
                      </label>
                      <input
                        className="form-input"
                        name="title"
                        value={curriculumForm.title}
                        onChange={handleInputChange}
                        type="text"
                        placeholder="Enter Title"
                      />
                    </div>
                  ) : (
                    <div className="form-input">{curriculumForm.title}</div>
                  )}
                </div>

                <QuillEditor
                  contentValue={content}
                  onChange={(e) => {
                    setContent(e)
                    setForm('content', e)
                  }}
                />
                {loading ? (
                  <button className="custom_btn ">
                    <i className="bi bi-opencollective loading"></i>

                    <div>Processing...</div>
                  </button>
                ) : (
                  <div className="table-action flex flex-wrap">
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
                )}
              </div>
            ) : (
              <div className="card_body w-full overflow-auto min-h-[300px] max-h-[100vh] sharp flex-1 border border-[var(--border)]">
                <div className="text-lg mb-5 text-[var(--custom)]">
                  {curriculumForm.levelName} {curriculumForm.level}:{' '}
                  {curriculumForm.title}
                </div>
                <div
                  className=""
                  dangerouslySetInnerHTML={{
                    __html: curriculumForm.content,
                  }}
                ></div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
