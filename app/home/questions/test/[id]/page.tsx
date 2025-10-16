'use client'
import {
  formatTimeTo12Hour,
  formatDateToDDMMYY,
  truncateStringNormal,
} from '@/lib/helpers'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import ObjectiveStore, {
  IOption,
  Objective,
} from '@/src/zustand/exam/Objective'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import ExamStore from '@/src/zustand/exam/Exam'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import CountdownTimer from '@/components/Home/Exam/CountdownTimer'
import ExamResult from '@/components/Home/Exam/Result'
import Pagination from '@/components/Team/Pagination'
import { UserExam } from '@/src/zustand/exam/UserExam'
import apiRequest from '@/lib/axios'
import { BioUserState } from '@/src/zustand/user/BioUserState'

interface Test {
  bioUserState: BioUserState
  exam: UserExam
  attempt: number
  results: Objective[]
}

const ExamStart = () => {
  const url = '/competitions/leagues/objectives/'
  const { getItem, formData, attempt } = ExamStore()
  const { user, bioUserState } = AuthStore()
  const { setMessage } = MessageStore()
  const { getObjectives, count, objectiveResults, reshuffleResults } =
    ObjectiveStore()
  const { setAlert } = AlartStore()
  const { id } = useParams()
  const [answeredQuestions, setAnsweredQuestions] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isInteracting, setIsInteracting] = useState(true)
  const [isActive, setIsActive] = useState(false)
  const [isLoading, setLoading] = useState(false)
  const [isResultDisplayed, displayResult] = useState(false)
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isLastResults, showLastResults] = useState(false)
  const [exam, setExam] = useState<UserExam>()
  // const [currentPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1)
  const [page_size, setPageSize] = useState<number | null>()
  const [sort] = useState('createdAt')
  const [questions, setQuestion] = useState<Objective[]>([])
  const [lastResults, setLastResults] = useState<Objective[]>([])
  const optionsLabel = ['A', 'B', 'C', 'D', 'E', 'F']

  const nextSection = async (size: number) => {
    getObjectives(
      `${url}?paperId=${formData._id}&ordering=${sort}&page=${currentPage}&page_size=${size}`,
      setMessage
    )

    const response = await apiRequest(
      `/user-competitions/exams/?bioUserId=${user?.bioUserId}&paperId=${id}&page=${currentPage}&page_size=${size}`
    )
    const res = response?.data as unknown as Test
    if (res.exam) {
      setExam(res.exam)
      setLastResults(res.results)
    }
  }

  const endExam = async () => {
    localStorage.removeItem('questions1')
    localStorage.removeItem('started')
    reshuffleResults()
    setIsActive(false)
    setIsInteracting(true)
  }

  const setDisplayResult = () => {
    displayResult((e) => !e)
  }

  const toggleDisplayResult = () => {
    if (isActive) {
      setMessage(
        'Complete or stop the current test to see your last result.',
        false
      )
    } else {
      showLastResults((e) => !e)
    }
  }

  const startCountdown = () => {
    if (isActive) {
      setAlert(
        'Warning',
        'You are about to end this test without submitting it for scoring, are you sure you want to continue?',
        true,
        () => endExam()
      )
    } else {
      localStorage.removeItem('questions')
      localStorage.setItem('started', JSON.stringify(new Date().getTime()))
      setDuration(formData.duration * 60)
      setIsActive(true)
      setIsInteracting(true)
    }
  }

  const submitData = async () => {
    const savedItems = localStorage.getItem('questions1')
    const started = localStorage.getItem('started')
    const startTime = started ? JSON.parse(started) : undefined
    const savedQuestions = savedItems ? JSON.parse(savedItems) : []

    if (savedQuestions && savedQuestions.length > 0 && user) {
      const form = new FormData()
      form.append('username', user.username)
      form.append('bioUserId', user.bioUserId)
      form.append('picture', user.picture)
      form.append('instruction', formData.instruction)
      form.append('started', startTime)
      form.append('ended', String(new Date().getTime()))
      form.append('paperId', String(id))
      form.append('questions', JSON.stringify(savedQuestions))

      try {
        setLoading(true)
        const response = await apiRequest(
          `/user-competitions/exams?bioUserId=${user?.bioUserId}&paperId=${id}&page=${currentPage}&page_size=${page_size}`,
          {
            method: 'POST',
            body: form,
          }
        )
        const res = response?.data as unknown as Test
        if (res.exam) {
          window.scrollTo({ top: 0, behavior: 'smooth' })
          showLastResults(true)
          console.log(res)
          AuthStore.getState().setBioUserState(res.bioUserState)
          endExam()
          setExam(res.exam)
          setLastResults(res.results)
          setMessage(
            'Congratulations! Your test was scored successfully, please click the table icon at your bottom left to see your progress.',
            true
          )
          ExamStore.setState({
            attempt: res.attempt,
          })
        }
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    } else {
      setMessage(
        'Sorry, test cannot be submitted as you have not made any attempt.',
        false
      )
    }
  }

  const selectAnswer = (item: IOption, questionId: string) => {
    const started = localStorage.getItem('started')
    if (!started || started === null || started === 'null') {
      setMessage('Please click the play button to begin your test.', false)
      return
    }
    const local = localStorage.getItem('questions1')
    let storedQuestions1 = local ? JSON.parse(local) : []

    setQuestion((prevQuestions) => {
      const updatedQuestions = prevQuestions.map((question) =>
        question._id === questionId
          ? {
              ...question,
              isClicked: true,
              options: question.options.map((option) => ({
                ...option,
                isClicked: option.index === item.index,
              })),
            }
          : question
      )

      const updatedQuestions1 = storedQuestions1.map((question: Objective) =>
        question._id === questionId
          ? {
              ...question,
              isClicked: true,
              options: question.options.map((option) => ({
                ...option,
                isClicked: option.index === item.index,
              })),
            }
          : question
      )

      const clickedQuestions1 = updatedQuestions1.filter(
        (q: Objective) => q.isClicked
      )

      for (let i = 0; i < clickedQuestions1.length; i++) {
        const el = clickedQuestions1[i]
        const stored = storedQuestions1.some((q: Objective) => q._id === el._id)

        if (stored) {
          const updatedStoredQuestions1 = storedQuestions1.map(
            (question: Objective) =>
              question._id === stored._id
                ? {
                    ...question,
                    isClicked: true,
                    options: question.options.map((option) => ({
                      ...option,
                      isClicked: option.index === item.index,
                    })),
                  }
                : question
          )
          storedQuestions1 = updatedStoredQuestions1
        } else {
          storedQuestions1.push(el)
        }
      }

      setAnsweredQuestions(clickedQuestions1.length)
      localStorage.setItem('questions1', JSON.stringify(updatedQuestions1))
      return updatedQuestions
    })
  }

  const checkDuration = () => {
    const time = localStorage.getItem('started')
    const now = new Date().getTime()
    const remaining = time ? Math.floor((now - Number(time)) / 1000) : null
    if (duration > 0) {
      if (remaining && duration > remaining) {
        setTimeLeft(duration - remaining)
        setIsActive(true)
      } else {
        endExam()
      }
    }
  }

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkDuration()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  ////////////////// FETCH PAPER //////////////////
  useEffect(() => {
    const find = async () => {
      if (id && user) {
        getItem(
          `/competitions/exams/${id}?bioUserId=${user.bioUserId}`,
          setMessage
        )
      }
    }

    find()
  }, [id, user])

  ////////////////// SET PAPER //////////////////
  useEffect(() => {
    if (formData.questionsPerPage > 0 && user) {
      setPageSize(formData.questionsPerPage)
      setDuration(formData.duration * 60)
      setTimeLeft(formData.duration * 60)
      nextSection(formData.questionsPerPage)
    }
  }, [formData._id, user])

  ////////////////// PAGINATE PAPER //////////////////
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    nextSection(Number(page_size))
  }, [currentPage])

  useEffect(() => {
    const items = ObjectiveStore.getState().objectiveResults
    const local = localStorage.getItem('questions1')
    const localObjArr = local ? JSON.parse(local) : []

    const existingIds = new Set(localObjArr.map((item: Objective) => item._id))
    const newItems = objectiveResults.filter(
      (item) => !existingIds.has(item._id)
    )
    const updatedLocalObjArr = [...localObjArr, ...newItems]
    localStorage.setItem('questions1', JSON.stringify(updatedLocalObjArr))

    setQuestion([])
    if (updatedLocalObjArr && updatedLocalObjArr.length > 0) {
      const updatedQuestions = items.map((question) => {
        const savedQuestion = updatedLocalObjArr.find(
          (sq: Objective) => sq._id === question._id
        )

        if (savedQuestion) {
          return {
            ...question,
            isClicked: savedQuestion.isClicked,
            options: question.options.map((option) => {
              const savedOption = savedQuestion.options.find(
                (so: IOption) => so.index === option.index
              )

              return {
                ...option,
                isClicked: savedOption ? savedOption.isClicked : false,
              }
            }),
          }
        }
        return question
      })

      const clickedQuestions = updatedLocalObjArr.filter(
        (question) => question.isClicked
      )

      setAnsweredQuestions(clickedQuestions.length)
      setQuestion([...updatedQuestions])
    } else {
      for (let i = 0; i < items.length; i++) {
        const el = items[i]
        setQuestion((prevQuestions) => [...prevQuestions, el])
      }
      setAnsweredQuestions(0)
    }
  }, [objectiveResults])

  ////////////////// OBSERVER TIMER //////////////////
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (isActive && timeLeft === 0) {
      setIsActive(false)
      submitData()
    }
    return () => clearInterval(timer)
  }, [isActive, timeLeft])

  useEffect(() => {
    checkDuration()
  }, [duration])

  return (
    <>
      {bioUserState?.examAttempts === 0 && !isActive && !isLastResults ? (
        <div className="flex-1 px-3 pt-5 pb-[55px] text-[var(--text-primary)]">
          <div
            className={`items-center pb-1 mb-5 relative border-b border-b-border dark:border-b-dark-border`}
          >
            <div className="text-[var(--text-secondary)] text-center text-xl mb-2">
              Important Notice Before You Begin
            </div>
            <div className="leading-[20px] text-center">
              Please read the online-test policy carefully before you begin this
              exercise, if you are comfortable you can click the play button at
              the bottom left to start. Else, simply exit this page.
            </div>
          </div>
          <div className="sm:bg-[var(--primary)] sm:p-3">
            <div className="text-justify sm:text-lg">
              In our effort to create a simple and academic platform where exam
              canditiates can test/practice with available past questions, we
              record every exercise performed by users, whether casual or
              formal. We do this simply to improve user experience, therefore we
              hope you are prepared for this test before you start. Once you
              begin and decides to end by any means, your progress will be
              scored as though you have completed the exercise.{' '}
              <div className="text-[var(--custom)]">
                Above all, feel free to prepare for as many exams as available
                on this platform, thanks.
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-[85vh] relative py-5">
          <div className={`paper_head relative ${attempt > 0 ? 'b' : ''}`}>
            <div className="text-[var(--textSecondary)] text-lg">
              {formData.title}
            </div>
            <div className="paper_subtitle">{formData.subtitle}</div>
            <div className=" mb-2">{formData.instruction}</div>

            <div className="flex w-full justify-center flex-wrap">
              <div className="paper_info ">
                {' '}
                <i className="bi bi-hourglass-split text-sm block mr-[5px]"></i>
                {formData.duration}min
              </div>
              {formData.type && (
                <div className="paper_info">
                  <i className="bi bi-file-earmark text-sm block mr-[5px]"></i>
                  {truncateStringNormal(formData.type, 3)}
                </div>
              )}

              <div className="paper_info ">
                <i className="bi bi-clock text-sm block mr-[5px]"></i>
                {formatTimeTo12Hour(formData.publishedAt)}{' '}
              </div>
              <div className="paper_info ">
                <i className="bi bi-calendar-check text-sm block mr-[5px]"></i>
                {formatDateToDDMMYY(formData.publishedAt)}
              </div>
            </div>

            {exam && exam.attempts > 0 && (
              <div className="flex justify-between w-full absolute left-0 bottom-[-30px]">
                <div className="search_btn">{exam.attempts} Attempts</div>
                <div
                  onClick={toggleDisplayResult}
                  className="search_btn active"
                >
                  {isLastResults ? 'Hide Result' : 'Show Result'}{' '}
                </div>
              </div>
            )}
          </div>

          {exam && isLastResults && isResultDisplayed && (
            <ExamResult exam={exam} setDisplayResult={setDisplayResult} />
          )}

          {isLastResults
            ? lastResults.map((question, index) => (
                <div key={index} className="questions">
                  <div
                    className={`each_question rounded-[5px] p-[2px] ${
                      question.isClicked ? 'clicked' : ''
                    }`}
                  >
                    {page_size && (
                      <div className="question_num sm">
                        {(Number(currentPage) - 1) * page_size + index + 1}
                      </div>
                    )}
                    <div className="question_bd flex-grow">
                      <div className="question text-[var(--text-secondary)] font-medium">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: question.question,
                          }}
                        ></div>
                      </div>
                      {question.options.map((item, int) => (
                        <div
                          onClick={() => selectAnswer(item, question._id)}
                          key={int}
                          className={`each_option ${
                            isLastResults && item.isSelected
                              ? 'text-[var(--success)]'
                              : item.isClicked
                              ? 'text-[var(--custom)]'
                              : ''
                          } `}
                        >
                          {isLastResults && item.isSelected && (
                            <i className="bi bi-check-circle absolute top-0 left-[-20px]"></i>
                          )}
                          {isLastResults &&
                            item.isClicked &&
                            !item.isSelected && (
                              <i className="bi bi-x-circle absolute top-0 left-[-20px]"></i>
                            )}
                          <div className="option_num">{optionsLabel[int]})</div>
                          <div className="option_num">{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            : questions.map((question, index) => (
                <div key={index} className="questions ">
                  <div
                    className={`each_question rounded-[5px] p-[2px] ${
                      question.isClicked ? 'clicked' : ''
                    }`}
                  >
                    {page_size && (
                      <div className="question_num sm">
                        {(Number(currentPage) - 1) * page_size + index + 1}
                      </div>
                    )}
                    <div className="question_bd flex-grow">
                      <div className="question text-[var(--text-secondary)] font-medium">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: question.question,
                          }}
                        ></div>
                      </div>
                      {question.options.map((item, int) => (
                        <div
                          onClick={() => selectAnswer(item, question._id)}
                          key={int}
                          className={`each_option ${
                            isLastResults && item.isSelected
                              ? 'text-[var(--success)]'
                              : item.isClicked
                              ? 'text-[var(--custom)]'
                              : ''
                          } `}
                        >
                          {isLastResults && item.isSelected && (
                            <i className="bi bi-check-circle absolute top-0 left-[-20px]"></i>
                          )}
                          {isLastResults &&
                            item.isClicked &&
                            !item.isSelected && (
                              <i className="bi bi-x-circle absolute top-0 left-[-20px]"></i>
                            )}
                          <div className="option_num">{optionsLabel[int]})</div>
                          <div className="option_num">{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

          <div className="flex items-center sm:mb-[100px] mb-[90px]">
            <div>Results {count}</div>
            {page_size && (
              <Pagination
                currentPage={currentPage}
                totalItems={count}
                pageSize={page_size}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </div>
      )}
      {formData.duration > 0 && (
        <CountdownTimer
          durationInSeconds={duration}
          isActive={isActive}
          isLastResults={isLastResults}
          setDisplayResult={setDisplayResult}
          isInteracting={isInteracting}
          startCountdown={startCountdown}
          isLoading={isLoading}
          submit={submitData}
          total={count}
          answered={answeredQuestions}
          timeLeft={timeLeft}
        />
      )}
    </>
  )
}

export default ExamStart
