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
import FirstExamMessage from '@/components/Home/Exam/FirstExamMessage'
import QuestionObjective from '@/components/Home/Exam/QuestionsObjectives'

interface Test {
  bioUserState: BioUserState
  exam: UserExam
  attempt: number
  results: Objective[]
}

const ExamStart = () => {
  const url = '/competitions/leagues/objectives/'
  const { getExam, examForm } = ExamStore()
  const { user, bioUser, bioUserState } = AuthStore()
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

  const nextSection = async (size: number) => {
    getObjectives(
      `${url}?paperId=${examForm._id}&ordering=${sort}&page=${currentPage}&page_size=${size}`,
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
      setDuration(examForm.duration * 60)
      setIsActive(true)
      setIsInteracting(true)
    }
  }

  const submitData = async () => {
    const savedItems = localStorage.getExam('questions1')
    const started = localStorage.getExam('started')
    const startTime = started ? JSON.parse(started) : undefined
    const savedQuestions = savedItems ? JSON.parse(savedItems) : []

    if (savedQuestions && savedQuestions.length > 0 && bioUser) {
      const form = new FormData()
      form.append('bioUserUsername', bioUser.bioUserUsername)
      form.append('bioUserId', bioUser._id)
      form.append('bioUserPicture', bioUser.bioUserPicture)
      form.append('bioUserDisplayName', bioUser.bioUserDisplayName)
      form.append('instruction', examForm.instruction)
      form.append('started', startTime)
      form.append('ended', String(new Date().getTime()))
      form.append('paperId', String(id))
      form.append('questions', JSON.stringify(savedQuestions))

      try {
        setLoading(true)
        const response = await apiRequest(
          `/user-competitions/exams?bioUserId=${bioUser?._id}&paperId=${id}&page=${currentPage}&page_size=${page_size}`,
          {
            method: 'POST',
            body: form,
          }
        )
        const res = response?.data as unknown as Test
        if (res.exam) {
          window.scrollTo({ top: 0, behavior: 'smooth' })
          showLastResults(true)
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
    const started = localStorage.getExam('started')
    if (!started || started === null || started === 'null') {
      setMessage('Please click the play button to begin your test.', false)
      return
    }
    const local = localStorage.getExam('questions1')
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
    const time = localStorage.getExam('started')
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
        getExam(
          `/competitions/exams/${id}?bioUserId=${user.bioUserId}`,
          setMessage
        )
      }
    }

    find()
  }, [id, user])

  ////////////////// SET PAPER //////////////////
  useEffect(() => {
    if (examForm.questionsPerPage > 0 && user) {
      setPageSize(examForm.questionsPerPage)
      setDuration(examForm.duration * 60)
      setTimeLeft(examForm.duration * 60)
      nextSection(examForm.questionsPerPage)
    }
  }, [examForm._id, user])

  ////////////////// PAGINATE PAPER //////////////////
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    nextSection(Number(page_size))
  }, [currentPage])

  useEffect(() => {
    const items = ObjectiveStore.getState().objectiveResults
    const local = localStorage.getExam('questions1')
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
        <FirstExamMessage />
      ) : (
        <div className="min-h-[85vh] relative py-5 px-2 sm:px-0">
          {exam && (
            <div
              className={`paper_head relative ${exam.attempts > 0 ? 'b' : ''}`}
            >
              <div className="text-[var(--textSecondary)] sm:text-lg">
                {examForm.title}
              </div>
              <div className="paper_subtitle">{examForm.subtitle}</div>
              <div className=" mb-2">{examForm.instruction}</div>

              <div className="flex w-full justify-center flex-wrap">
                <div className="paper_info ">
                  {' '}
                  <i className="bi bi-hourglass-split text-sm block mr-[5px]"></i>
                  {examForm.duration}min
                </div>
                {examForm.type && (
                  <div className="paper_info">
                    <i className="bi bi-file-earmark text-sm block mr-[5px]"></i>
                    {truncateStringNormal(examForm.type, 3)}
                  </div>
                )}

                <div className="paper_info ">
                  <i className="bi bi-clock text-sm block mr-[5px]"></i>
                  {formatTimeTo12Hour(examForm.publishedAt)}{' '}
                </div>
                <div className="paper_info ">
                  <i className="bi bi-calendar-check text-sm block mr-[5px]"></i>
                  {formatDateToDDMMYY(examForm.publishedAt)}
                </div>
              </div>

              {exam.attempts > 0 && (
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
          )}

          {exam && isLastResults && isResultDisplayed && (
            <ExamResult exam={exam} setDisplayResult={setDisplayResult} />
          )}

          {isLastResults && page_size
            ? lastResults.map((question, index) => (
                <QuestionObjective
                  key={index}
                  question={question}
                  page_size={page_size}
                  currentPage={currentPage}
                  index={index}
                  isLastResults={true}
                  selectAnswer={selectAnswer}
                />
              ))
            : page_size &&
              questions.map((question, index) => (
                <QuestionObjective
                  key={index}
                  question={question}
                  page_size={page_size}
                  currentPage={currentPage}
                  index={index}
                  isLastResults={true}
                  selectAnswer={selectAnswer}
                />
              ))}

          <div className="flex items-center sm:mb-[100px] mb-[150px]">
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
      {examForm.duration > 0 && (
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
