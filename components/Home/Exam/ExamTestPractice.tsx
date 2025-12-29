'use client'
import {
  formatTimeTo12Hour,
  formatDateToDDMMYY,
  truncateStringNormal,
} from '@/lib/helpers'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import ObjectiveStore, { Objective } from '@/src/zustand/exam/Objective'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import ExamStore from '@/src/zustand/exam/Exam'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import CountdownTimer from '@/components/Home/Exam/CountdownTimer'
import ExamResult from '@/components/Home/Exam/Result'
import UserExamStore, { UserExam } from '@/src/zustand/exam/UserExam'
import apiRequest from '@/lib/axios'
import { BioUserState } from '@/src/zustand/user/BioUserState'
import FirstExamMessage from '@/components/Home/Exam/FirstExamMessage'
import QuestionObjective from '@/components/Home/Exam/QuestionsObjectives'
import LinkedPagination from '@/components/Team/LinkedPagination'

interface Test {
  bioUserState: BioUserState
  exam: UserExam
  attempt: number
  results: Objective[]
}

//68266f25ca059ee899143b95
//6939ae39b5923e5ddd906943

const ExamTestPractice = () => {
  const { setIsFirstTime, examForm, isFirstTime } = ExamStore()
  const { userExamForm, isActive, updateUserExam, createUserExam } =
    UserExamStore()
  const { bioUser } = AuthStore()
  const { setMessage } = MessageStore()
  const {
    count,
    questions,
    answeredQuestions,
    lastQuestions,
    getQuestions,
    getLastQuestions,
  } = ObjectiveStore()
  const duration = examForm.duration * 60
  const { setAlert } = AlartStore()
  const { id, page } = useParams()
  const [isLoading, setLoading] = useState(false)
  const [isResultDisplayed, displayResult] = useState(false)
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isLastResults, showLastResults] = useState(false)

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
        () => submitData()
      )
    } else if (bioUser && bioUser.bioUserUsername && !bioUser.bioUserPicture) {
      setMessage(
        'Please go to verification at the public tab and set your username and picture to begin this test.',
        false
      )
    } else if (bioUser) {
      if (userExamForm && userExamForm._id) {
        const form = {
          paperId: examForm._id,
          bioUserId: bioUser?._id,
          isActive: true,
          started: new Date().getTime(),
        }
        updateUserExam(
          `/user-competitions/exams/${userExamForm._id}`,
          form,
          setMessage
        )
      } else {
        const form = {
          paperId: examForm._id,
          bioUserId: bioUser?._id,
          bioUserUsername: bioUser.bioUserUsername,
          bioUserPicture: bioUser.bioUserPicture,
          title: examForm.title,
          instruction: examForm.instruction,
          type: examForm.type,
          isActive: true,
          bioUserDisplayName: bioUser.bioUserDisplayName,
          started: new Date().getTime(),
        }
        createUserExam(`/user-competitions/exams/`, form, setMessage)
      }
    }
  }

  const submitData = async () => {
    if (isActive && bioUser?._id === 'ckdkd') {
      const form = {
        ended: String(new Date().getTime()),
        started: userExamForm.started,
        paperId: String(id),
        bioUserId: bioUser._id,
      }
      try {
        setLoading(true)
        const response = await apiRequest(
          `/user-competitions/exams/submit?bioUserId=${bioUser?._id}&paperId=${id}&page=${page}&page_size=${examForm.questionsPerPage}`,
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
          setMessage(
            'Congratulations! Your test was scored successfully, please click the table icon at your bottom left to see your progress.',
            true
          )
          ExamStore.setState({
            attempt: res.attempt,
          })
          ObjectiveStore.setState({
            lastQuestions: res.results,
          })
        }
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    } else {
      setMessage(
        'Sorry, test cannot be submitted as you have not started.',
        false
      )
    }
  }

  useEffect(() => {
    if (userExamForm.started && duration) {
      const now = new Date().getTime()
      const remaining = userExamForm.started
        ? Math.floor((now - userExamForm.started) / 1000)
        : null

      if (duration > 0) {
        if (remaining && duration > remaining) {
          setTimeLeft(duration - remaining)
        } else if (isActive) {
          submitData()
        }
      }
    }
  }, [userExamForm.started, duration])

  useEffect(() => {
    const skip = page ? page : 1
    if (skip && examForm.questionsPerPage) {
      getQuestions(examForm.questionsPerPage, Number(skip))
      getLastQuestions(examForm.questionsPerPage, Number(skip))
    }
  }, [page, examForm])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (isActive && timeLeft === 0) {
      submitData()
    }
    return () => clearInterval(timer)
  }, [isActive, timeLeft])

  return (
    <>
      {isFirstTime ? (
        <FirstExamMessage />
      ) : (
        <div className="min-h-[85vh] relative py-5 px-2 sm:px-0">
          {examForm._id && (
            <div
              className={`paper_head relative ${
                userExamForm.attempts > 0 ? 'b' : ''
              }`}
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

              {userExamForm.attempts > 0 && (
                <div className="flex justify-between w-full absolute left-0 bottom-[-30px]">
                  <div className="search_btn">
                    {userExamForm.attempts} Attempts
                  </div>
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

          {isLastResults && isResultDisplayed && (
            <ExamResult
              exam={userExamForm}
              setDisplayResult={setDisplayResult}
            />
          )}

          {isLastResults && examForm.questionsPerPage
            ? lastQuestions.map((question, index) => (
                <QuestionObjective
                  key={index}
                  question={question}
                  page_size={examForm.questionsPerPage}
                  currentPage={page ? Number(page) : 1}
                  index={index}
                  isLastResults={true}
                />
              ))
            : examForm.questionsPerPage &&
              questions.map((question, index) => (
                <QuestionObjective
                  key={index}
                  question={question}
                  page_size={examForm.questionsPerPage}
                  currentPage={page ? Number(page) : 1}
                  index={index}
                  isLastResults={false}
                />
              ))}

          <div className="mb-[150px] sm:mb-[100px]">
            <LinkedPagination
              url={`/home/questions/exam/${id}`}
              count={examForm.questions}
              page_size={examForm.questionsPerPage}
            />
          </div>
        </div>
      )}

      {isFirstTime ? (
        <div className="exam_bottom">
          <div className="custom_container">
            <div className="flex w-full">
              <div className="w-[300px] hidden sm:block"></div>
              <i
                onClick={() => setIsFirstTime(false)}
                className="bi bi-play-btn-fill text-[30px] text-[var(--custom)] ml-3 md:ml-10 cursor-pointer"
              ></i>
            </div>{' '}
          </div>
        </div>
      ) : (
        <CountdownTimer
          durationInSeconds={duration}
          isActive={isActive}
          isLastResults={isLastResults}
          setDisplayResult={setDisplayResult}
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

export default ExamTestPractice
