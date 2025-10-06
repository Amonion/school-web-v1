'use client'
import Link from 'next/link'
import { appendForm, formatDate, formatTimeTo12Hour } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { useState, useEffect, useRef } from 'react'
import QuestionPaperStore from '@/src/zustand/exam/SchoolQuestion'
import { MessageStore } from '@/src/zustand/notification/Message'
import PageTitle from '@/components/PageTitle'
import OfficeStore from '@/src/zustand/utility/Office'
import _debounce from 'lodash/debounce'
import CourseStore from '@/src/zustand/school/Courses'
import SchoolStore from '@/src/zustand/school/School'
import { useParams, useRouter } from 'next/navigation'

const SetQuestionPaper: React.FC = () => {
  const url = '/questions/'
  const {
    questionForm,
    loadingQuestions,
    getOneQuestion,
    resetQuestion,
    setQuestionForm,
    updateQuestion,
    postQuestion,
  } = QuestionPaperStore()
  const { schoolData } = SchoolStore()
  const [isSubjectList, setSubjectList] = useState(false)
  const [type, setType] = useState('Objective')
  const { officeForm } = OfficeStore()
  const { searchedSubjects, searchSubject } = CourseStore()
  const [levelIndex, setLevelIndex] = useState({ index: 0, isActive: false })
  const { setMessage } = MessageStore()
  const { id } = useParams()
  const [currentPage] = useState(1)
  const [page_size] = useState(5)
  const [sort] = useState('-createdAt')
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [queryParams] = useState(
    `?page_size=${page_size}&page=${currentPage}&ordering=${sort}username=${officeForm.username}`
  )
  const [types, setTypes] = useState([
    { name: 'Objective', isChecked: true },
    { name: 'Subjective', isChecked: false },
    { name: 'Essay', isChecked: false },
  ])

  useEffect(() => {
    if (id) {
      getOneQuestion(`${url}${id}`, setMessage)
    } else {
      resetQuestion()
    }
  }, [id])

  useEffect(() => {
    if (questionForm.subject && id) {
      if (inputRef.current) {
        inputRef.current.value = questionForm.subject
      }
    }
  }, [questionForm.subject])

  const addSubject = (subject: string) => {
    if (inputRef.current) {
      inputRef.current.value = subject
      setQuestionForm('subject', subject)
    }
    setSubjectList(false)
  }

  const setPublishDate = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const publishedAt = new Date(e.target.value)
    if (publishedAt < new Date()) {
      setMessage('Please choose a future publishing date and time!', false)
      return
    }
    if (
      questionForm.questionDate &&
      new Date(questionForm.questionDate) < publishedAt
    ) {
      setMessage(
        'Publishing time cannot be greater than paper starting time!',
        false
      )
      return
    }
    setQuestionForm('publishedAt', publishedAt)
  }
  const setStartingDate = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const questionDate = new Date(e.target.value)
    if (questionDate < new Date()) {
      setMessage('Please choose a future starting date and time!', false)
      return
    }
    if (
      questionForm.publishedAt &&
      new Date(questionForm.publishedAt) > questionDate
    ) {
      setMessage(
        'Publishing time cannot be greater than paper starting time!',
        false
      )
      return
    }
    setQuestionForm('questionDate', questionDate)
  }

  //---------------STATE---------------------
  const handleSearchSubject = _debounce(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      if (!value) {
        setSubjectList(false)
        return
      }
      setSubjectList(true)
      searchSubject(
        `/courses/subjects/?country=${officeForm.country}&name=${value}&state[in]=all,${officeForm.state}&schoolUsername[in]=all,${officeForm.username}&page_size=${page_size}&page=1`
      )
    },
    1000
  )

  const toggleType = (index: number) => {
    const updatedResults = types.map((tertiary, idx) =>
      idx === index
        ? { ...tertiary, isChecked: true }
        : { ...tertiary, isChecked: false }
    )
    setTypes(updatedResults)
    const item = updatedResults.find((el) => el.isChecked)
    setType(String(item?.name))
    setQuestionForm('type', item?.name)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setQuestionForm(name as keyof typeof questionForm, value)
  }

  const handleSubmit = async () => {
    if (
      type === 'Objective' &&
      (questionForm.optionsPerQuestion < 3 ||
        questionForm.optionsPerQuestion > 5)
    ) {
      setMessage(
        'Options per question cannot should be from 3 to 5 maximum.',
        false
      )
      return
    }

    if (
      questionForm.questionsPerPage < 1 ||
      questionForm.questionsPerPage > 20
    ) {
      setMessage('Questions per page should be from 1 to 20 maximum.', false)
      return
    }

    if (
      questionForm.questionDate &&
      new Date(questionForm.questionDate) < new Date()
    ) {
      setMessage('Please choose a future starting date and time!', false)
      return
    }

    const inputsToValidate = [
      {
        name: 'publishingTime',
        value:
          new Date(String(questionForm.publishedAt)).getTime() -
          new Date().getTime(),
        rules: { blank: false, maxLength: 100 },
        field: 'Logo field',
      },
      {
        name: 'startingTime',
        value:
          new Date(String(questionForm.questionDate)).getTime() -
          new Date().getTime(),
        rules: { blank: false, maxLength: 100 },
        field: 'Logo field',
      },
      {
        name: 'isExpired',
        value: false,
        rules: { blank: false, maxLength: 100 },
        field: 'Logo field',
      },
      {
        name: 'isOn',
        value: false,
        rules: { blank: false, maxLength: 100 },
        field: 'Logo field',
      },
      {
        name: 'logo',
        value: officeForm.logo,
        rules: { blank: false, maxLength: 100 },
        field: 'Logo field',
      },
      {
        name: 'media',
        value: officeForm.media,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Media field',
      },
      {
        name: 'title',
        value: questionForm.title,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Title field',
      },
      {
        name: 'subtitle',
        value: questionForm.subtitle,
        rules: { blank: false, maxLength: 100 },
        field: 'Subtitle field',
      },
      {
        name: 'type',
        value: questionForm.type,
        rules: { blank: false, maxLength: 1000 },
        field: 'Type field',
      },
      {
        name: 'duration',
        value: questionForm.duration,
        rules: { blank: false, maxLength: 1000 },
        field: 'Duration field',
      },
      {
        name: 'questionsPerPage',
        value: questionForm.questionsPerPage,
        rules: { blank: true, maxLength: 1000 },
        field: 'Questions Per Page field',
      },
      {
        name: 'optionsPerQuestion',
        value: questionForm.optionsPerQuestion,
        rules: { blank: true, maxLength: 1000 },
        field: 'Options per question field',
      },
      {
        name: 'instruction',
        value: questionForm.instruction,
        rules: { blank: false, maxLength: 1000 },
        field: 'Instruction field',
      },
      {
        name: 'name',
        value: String(questionForm.name),
        rules: { blank: false, maxLength: 1000 },
        field: 'End date field',
      },
      {
        name: 'publishedAt',
        value: String(questionForm.publishedAt),
        rules: { blank: false, maxLength: 1000 },
        field: 'PublishedAt date field',
      },
      {
        name: 'questionDate',
        value: String(questionForm.questionDate),
        rules: { blank: false, maxLength: 1000 },
        field: 'PublishedAt date field',
      },
      {
        name: 'showResult',
        value: questionForm.randomize,
        rules: { blank: false },
        field: 'Show Result radio',
      },
      {
        name: 'randomize',
        value: questionForm.randomize,
        rules: { blank: false },
        field: 'Randomize radio',
      },
      {
        name: 'username',
        value: officeForm.username,
        rules: { blank: false },
        field: 'Randomize radio',
      },
      {
        name: 'subject',
        value: questionForm.subject,
        rules: { blank: true, maxLength: 1000 },
        field: 'Subjcet field',
      },
      {
        name: 'officeType',
        value: officeForm.type,
        rules: { blank: true, maxLength: 1000 },
        field: 'Office type',
      },
      {
        name: 'level',
        value: questionForm.level,
        rules: { blank: true, maxLength: 1000 },
        field: 'Level',
      },
      {
        name: 'levelName',
        value: questionForm.levelName,
        rules: { blank: true, maxLength: 1000 },
        field: 'Level name',
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

    // console.log(inputsToValidate);

    const data = appendForm(inputsToValidate)
    if (id) {
      updateQuestion(`${url}${id}${queryParams}`, data, setMessage, () =>
        router.push('/school/questions')
      )
    } else {
      postQuestion(`${url}${queryParams}`, data, setMessage, () =>
        router.push('/school/questions')
      )
    }
  }

  return (
    <>
      <PageTitle
        page={id ? 'Edit Question:' : 'Create Question:'}
        title={officeForm.name}
      />

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
              {item.levelName === questionForm.levelName
                ? questionForm.level
                : ''}
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
                {Array.from({ length: item.maxLevel }, (_, int) => (
                  <div
                    onClick={() => {
                      setLevelIndex({
                        index: index,
                        isActive: !levelIndex.isActive,
                      })
                      setQuestionForm('level', int + 1)
                      setQuestionForm('levelName', item.levelName)
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
        <div className="grid-2 grid-lay">
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              className="form-input"
              name="title"
              value={questionForm.title}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter title"
            />
          </div>

          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Subtitle
            </label>
            <input
              className="form-input"
              name="subtitle"
              value={questionForm.subtitle}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter subtitle"
            />
          </div>

          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Questions Per Page
            </label>
            <input
              className="form-input"
              name="questionsPerPage"
              value={questionForm.questionsPerPage}
              onChange={handleInputChange}
              type="number"
              placeholder="Enter questions per page"
            />
          </div>

          {type === 'Objective' && (
            <div className="flex flex-col">
              <label className="label" htmlFor="">
                Options per Question
              </label>
              <input
                className="form-input"
                name="optionsPerQuestion"
                value={questionForm.optionsPerQuestion}
                onChange={handleInputChange}
                type="number"
                placeholder="Enter options per question"
              />
            </div>
          )}

          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Duration (in minutes)
            </label>
            <input
              className="form-input"
              name="duration"
              value={questionForm.duration}
              onChange={handleInputChange}
              type="number"
              placeholder="Enter duration"
            />
          </div>

          <div className="flex relative flex-col">
            <label className="label" htmlFor="">
              Subjects
            </label>
            <input
              ref={inputRef}
              className="form-input"
              name="subject"
              onChange={handleSearchSubject}
              type="search"
              placeholder="Enter subject"
            />
            {searchedSubjects.length > 0 && isSubjectList && (
              <div
                className={`dropdownList ${
                  isSubjectList && searchedSubjects.length > 0
                    ? 'overflow-auto top-[70px]'
                    : 'overflow-hidden h-0'
                }`}
              >
                {searchedSubjects.map((item, index) => (
                  <div
                    onClick={() => addSubject(item.name)}
                    key={index}
                    className="input_drop_list"
                  >
                    <div className="flex-1">{item.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <label className="label" htmlFor="">
              To Publish On
            </label>
            <div className="flex justify-between">
              <div className="form-input sm w-input mr-6">
                {questionForm.publishedAt
                  ? `${formatDate(
                      questionForm.publishedAt
                    )} | ${formatTimeTo12Hour(questionForm.publishedAt)}`
                  : `Set Date & Time to Announce`}
              </div>

              <label
                className="ml-auto rounded-[5px] relative cursor-pointer flex justify-center items-center px-4 h-10 bg-[var(--border-background)]"
                htmlFor="date"
              >
                <i className="cursor-pointer bi bi-calendar-week absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"></i>
                <input
                  id="date"
                  className="sm opacity-0 w-8"
                  name="publishedAt"
                  type="datetime-local"
                  onChange={setPublishDate}
                />
              </label>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="label" htmlFor="">
              To Start At
            </label>
            <div className="flex justify-between">
              <div className="form-input sm w-input mr-6">
                {questionForm.questionDate
                  ? `${formatDate(
                      questionForm.questionDate
                    )} | ${formatTimeTo12Hour(questionForm.questionDate)}`
                  : `Set Date & Time to Start`}
              </div>

              <label
                className="ml-auto rounded-[5px] relative cursor-pointer flex justify-center items-center px-4 h-10 bg-[var(--border-background)]"
                htmlFor="date"
              >
                <i className="cursor-pointer bi bi-calendar-week absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"></i>
                <input
                  id="date"
                  className="sm opacity-0 w-8"
                  name="questionDate"
                  type="datetime-local"
                  onChange={setStartingDate}
                />
              </label>
            </div>
          </div>

          {(type === 'Objective' || type === 'Subjective') && (
            <>
              {type === 'Objective' && (
                <div>
                  <label className="flex flex-col" htmlFor="">
                    Randomize Options
                  </label>
                  <div className="flex">
                    <div className="form-input">
                      Candidate options will reorder
                    </div>

                    <div
                      onClick={() =>
                        setQuestionForm('randomize', !questionForm.randomize)
                      }
                      className={`${
                        questionForm.randomize
                          ? 'bg-[var(--custom-color)]'
                          : 'bg-[var(--secondary)]'
                      } option_ticker`}
                    >
                      {questionForm.randomize ? (
                        <i className="bi bi-check-lg text-white text-2xl"></i>
                      ) : (
                        <i className="bi bi-x-lg text-[text-primary] text-lg"></i>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="flex flex-col" htmlFor="">
                  Instant Result
                </label>
                <div className="flex">
                  <div className="form-input">
                    Show result at the end of paper
                  </div>

                  <div
                    onClick={() =>
                      setQuestionForm('showResult', !questionForm.showResult)
                    }
                    className={`${
                      questionForm.showResult
                        ? 'bg-[var(--custom-color)]'
                        : 'bg-[var(--secondary)]'
                    } option_ticker`}
                  >
                    {questionForm.showResult ? (
                      <i className="bi bi-check-lg text-white text-2xl"></i>
                    ) : (
                      <i className="bi bi-x-lg text-[text-primary] text-lg"></i>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col mb-2">
          <label className="label" htmlFor="">
            Instruction
          </label>
          <textarea
            value={questionForm.instruction}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Start writing"
            name="instruction"
            id=""
          ></textarea>
        </div>
        <div className="flex">
          <div className="flex flex-col mb-3 relative">
            <label className="label" htmlFor="">
              Select Exam Type
            </label>
            <div className="grid grid-cols-3 gap-2 items-end">
              {types.map((item, index) => (
                <div
                  onClick={() => {
                    toggleType(index)
                    setQuestionForm('type', item.name)
                  }}
                  key={index}
                  className="flex cursor-pointer items-center text-[var(--custom)]"
                >
                  <div className={`checkbox ${item.isChecked ? 'active' : ''}`}>
                    {item.isChecked && (
                      <i className="bi bi-check text-white text-lg"></i>
                    )}
                  </div>
                  {item.name} {item.isChecked}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="table-action flex flex-wrap">
          {loadingQuestions ? (
            <button className="custom_btn">
              <i className="bi bi-opencollective loading"></i>
              Processing...
            </button>
          ) : (
            <>
              <button className="custom_btn" onClick={handleSubmit}>
                Submit
              </button>
              <Link
                href="/team/competitions/exams"
                className="custom_btn ml-auto "
              >
                Exams Table
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default SetQuestionPaper
