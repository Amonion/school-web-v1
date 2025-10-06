'use client'
import PageTitle from '@/components/PageTitle'
import { MessageStore } from '@/src/zustand/notification/Message'
import OfficeStore from '@/src/zustand/utility/Office'
import { useParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import StudentStore from '@/src/zustand/school/Student'
import SchoolStore from '@/src/zustand/school/School'
import _debounce from 'lodash/debounce'
import Image from 'next/image'
import LinkedPagination from '@/components/Team/LinkedPagination'
import Link from 'next/link'
import { FilePlus, PanelsTopLeft, Trash2, UserPlus2 } from 'lucide-react'
import SchoolPositions from '../Staff/SchoolPositions'
import QuestionPaperStore, {
  SchoolQuestion,
} from '@/src/zustand/exam/SchoolQuestion'
import { QuestionRow } from './QuestionRow'

export default function QuestionsTable() {
  const { reshuffleStudents } = StudentStore()
  const {
    questions,
    count,
    currentPage,
    loadingQuestions,
    selectedQuestions,
    searchedQuestions,
    page_size,
    searchQuestion,
    updateQuestion,
    reshuffleQuestions,
    toggleCheckedQuestion,
    getQuestions,
  } = QuestionPaperStore()
  const { setMessage } = MessageStore()
  const { officeForm } = OfficeStore()
  const { schoolData, staffPositions } = SchoolStore()
  const [levelIndex, setLevelIndex] = useState({ index: 0, isActive: false })
  const [selectedClass, setClass] = useState({ name: '', level: 0 })
  const [isQuestionList, setQuestionList] = useState(false)
  const [displayPositions, setDisplayPositions] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const { page } = useParams()
  const url = '/questions'

  useEffect(() => {
    if (!officeForm.username) return
    if (questions.length === 0) {
      fetchQuestions(1)
    }
    setQuery(`country=${officeForm.country}`)
  }, [officeForm])

  useEffect(() => {
    reshuffleQuestions()
    if (page && Number(page) > 0 && officeForm.country) {
      fetchQuestions(Number(page))
    }
  }, [page, officeForm])

  const selectQuestion = (question: SchoolQuestion) => {
    toggleCheckedQuestion(question._id)
    setQuestionList(false)
  }

  const fetchQuestions = (page: number, level?: number, levelName?: string) => {
    getQuestions(
      `${url}/?username=${officeForm.username}${
        level ? `&level=${level}&levelName=${levelName}` : ''
      }&page_size=${page_size}&page=${page}`,
      setMessage
    )
  }

  const handleSearchQuestion = _debounce(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      if (!value) {
        setQuestionList(false)
        return
      }
      setQuestionList(true)
      searchQuestion(
        `${url}/search?usename=${officeForm.username}&title=${value}&subject=${value}&page_size=${page_size}`
      )
    },
    1000
  )

  const handleAssignClass = () => {
    if (selectedQuestions.length === 0) {
      setMessage(
        'Please select at least one question to assign to a class',
        false
      )
      setDisplayPositions(false)
      return
    }

    if (staffPositions.length === 0) {
      setMessage('Please select at least one class to assign', false)
      setDisplayPositions(false)
      return
    }

    const form = {
      selectedQuestions: selectedQuestions,
      selectedClass: staffPositions,
    }

    updateQuestion(
      `/questions/assign/?page_size=${page_size}&page=${currentPage}&isUserActive=true&page=${currentPage}&username=${officeForm.username}&userType=Student`,
      form,
      setMessage,
      () => {
        reshuffleStudents()
        setDisplayPositions(false)
      }
    )
  }

  return (
    <>
      <PageTitle page="Question Papers:" title={officeForm.name} />

      <div className="flex items-center flex-wrap mb-2">
        {schoolData.levels.map((item, index) => (
          <div key={index} className={`relative mr-1`}>
            <div
              onClick={() =>
                setLevelIndex({
                  index: index,
                  isActive: !levelIndex.isActive,
                })
              }
              key={index}
              className={`${
                index === levelIndex.index
                  ? 'text-white bg-[var(--custom)]'
                  : 'bg-[var(--primary)]'
              } flex items-center px-2 py-1 cursor-pointer  mr-3`}
            >
              {item.levelName}{' '}
              {item.levelName === selectedClass.name ? selectedClass.level : ''}
              <i className="bi bi-caret-down-fill ml-3"></i>
            </div>
            {levelIndex.index === index && levelIndex.isActive && (
              <div
                className={`dropdownList ${
                  levelIndex.index === index && levelIndex.isActive
                    ? 'overflow-auto'
                    : 'overflow-hidden h-0'
                }`}
              >
                <div
                  onClick={() => {
                    setLevelIndex({
                      index: index,
                      isActive: !levelIndex.isActive,
                    })
                    setClass({ name: '', level: 0 })
                    fetchQuestions(page ? Number(page) : 1)
                  }}
                  className="border-b last:border-b-0 cursor-pointer border-b-[var(--border)] p-2"
                >
                  <div className="">Clear Level</div>
                </div>
                {Array.from({ length: item.maxLevel }, (_, int) => (
                  <div
                    onClick={() => {
                      setLevelIndex({
                        index: index,
                        isActive: !levelIndex.isActive,
                      })
                      setClass({ name: item.levelName, level: int + 1 })
                      fetchQuestions(
                        page ? Number(page) : 1,
                        int + 1,
                        item.levelName
                      )
                    }}
                    key={int}
                    className="border-b last:border-b-0 cursor-pointer border-b-[var(--border)] p-2"
                  >
                    <div className="">
                      {item.levelName} {int + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="card_body sharp">
        <div className="relative mb-2">
          <div className={`input_wrap ml-auto active `}>
            <input
              ref={inputRef}
              type="search"
              onChange={handleSearchQuestion}
              className={`transparent-input flex-1 `}
              placeholder="Search questions"
            />
            {loadingQuestions ? (
              <i className="bi bi-opencollective common-icon loading"></i>
            ) : (
              <i className="bi bi-search common-icon cursor-pointer"></i>
            )}
          </div>

          {searchedQuestions.length > 0 && isQuestionList && (
            <div
              className={`dropdownList ${
                isQuestionList && searchedQuestions.length > 0
                  ? 'overflow-auto'
                  : 'overflow-hidden h-0'
              }`}
            >
              {searchedQuestions.map((item, index) => (
                <div key={index} className="input_drop_list">
                  <Link
                    href={`/school/students/student/${item._id}`}
                    className="flex-1"
                  >
                    {item.subject}: {item.title}{' '}
                  </Link>
                  <UserPlus2
                    onClick={() => selectQuestion(item)}
                    className="text-[var(--custom)]"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-wrap mb-6">
          {selectedQuestions.map((item, index) => (
            <div
              className="bg-[var(--secondary)] relative mb-2 py-1 px-2 mr-3"
              key={index}
            >
              <div
                onClick={() => toggleCheckedQuestion(item._id)}
                className="absolute w-5 h-5 rounded-full flex items-center justify-center cursor-pointer -top-1 -right-1 bg-[var(--custom)]"
              >
                <i className="bi bi-trash text-white text-sm"></i>
              </div>
              {item.subject}
            </div>
          ))}
        </div>
        <div className="overflow-auto mb-5">
          {questions.length > 0 ? (
            <table className="">
              <thead>
                <tr>
                  <th>SN</th>
                  <th>Subject</th>
                  <th>Levels</th>
                  <th>Title</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((item, index) => (
                  <QuestionRow key={index} question={item} index={index} />
                ))}
              </tbody>
            </table>
          ) : (
            <div className="relative flex justify-center">
              <div className="not_found_text">No Questions Found</div>
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
          url={`/school/questions`}
          count={count}
          page_size={page_size}
          query={query}
        />
      </div>

      <div className="table-action bg-[var(--primary)] mt-4 p-3 flex flex-wrap">
        {loadingQuestions ? (
          <button className="custom_btn">
            <i className="bi bi-opencollective loading"></i>
            Processing...
          </button>
        ) : (
          <>
            <Link
              href={'/school/questions/create-question-paper'}
              className="flex items-center mr-5"
            >
              <FilePlus className="h-5 w-5 text-[var(--custom)] mr-1" /> Create
              Question
            </Link>
            <button
              onClick={() => setDisplayPositions(true)}
              className="flex items-center mr-5"
            >
              <PanelsTopLeft className="h-5 w-5 text-[var(--custom)] mr-1" />
              Assign Class
            </button>

            <button className="flex items-center mr-5">
              <Trash2 className="h-5 w-5 text-[var(--custom)] mr-1" />
              Delete
            </button>
          </>
        )}
      </div>
      {displayPositions && (
        <SchoolPositions
          setDisplayBox={setDisplayPositions}
          handleSubmit={handleAssignClass}
        />
      )}
    </>
  )
}
