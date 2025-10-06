'use client'
import { MessageStore } from '@/src/zustand/notification/Message'
import OfficeStore from '@/src/zustand/utility/Office'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import QuestionPaperStore, {
  SchoolQuestion,
} from '@/src/zustand/exam/SchoolQuestion'
import { useEffect } from 'react'
import { CountdownCell, CountdownCellExam } from '@/components/CountDownCell'

interface QuestionRowProps {
  question: SchoolQuestion
  index: number
}

export const QuestionRow: React.FC<QuestionRowProps> = ({
  question,
  index,
}) => {
  const {
    page_size,
    deleteQuestion,
    toggleActiveQuestion,
    toggleCheckedQuestion,
    updateQuestion,
  } = QuestionPaperStore()
  const { setMessage } = MessageStore()
  const { officeForm } = OfficeStore()
  const { page } = useParams()
  const url = '/questions'
  const liveQuestion = QuestionPaperStore(
    (state) =>
      state.questions.find((q) => String(q._id) === String(question._id)) ||
      question
  )

  const remove = (id: string) => {
    deleteQuestion(
      `${url}/${id}?page_size=${page_size}&page=${page}&username=${officeForm.username}`,
      setMessage
    )
  }

  const updateRow = (isExpired: boolean, isOn: boolean, update?: boolean) => {
    if (update) {
      updateQuestion(
        `${url}/${question._id}`,
        { startingTime: 0, isExpired: isExpired, isOn: isOn },
        setMessage
      )
    }
  }

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    const countDownExam = () => {
      intervalId = setInterval(async () => {
        if (liveQuestion.startingTime) {
          liveQuestion.startingTime -= 1000
          if (liveQuestion.startingTime <= 0 && !liveQuestion.isOn) {
            if (intervalId) clearInterval(intervalId)
            updateRow(false, true, true)
          } else if (liveQuestion.startingTime <= 0 && liveQuestion.isOn) {
            updateRow(true, false)
          }
        }
      }, 1000)
    }

    if (question.startingTime && question.startingTime > 0) {
      countDownExam()
    }
    if (
      liveQuestion.startingTime === 0 &&
      !liveQuestion.isExpired &&
      !liveQuestion.isOn
    ) {
      //   updateRow(false, true, true)
    }

    return () => {
      if (intervalId) clearInterval(intervalId) // cleanup on unmount
    }
  }, [])

  return (
    <>
      <tr
        className={`${index % 2 === 1 ? 'bg-[var(--white-gray)]' : ''} ${
          liveQuestion.isOn
            ? 'text-[var(--success)]'
            : !liveQuestion.isExpired
            ? 'text-yellow-500'
            : ''
        } `}
      >
        <td>
          <div className="relative flex items-center">
            <div
              className={`checkbox ${liveQuestion.isChecked ? 'active' : ''}`}
              onClick={() => toggleCheckedQuestion(liveQuestion._id)}
            >
              {liveQuestion.isChecked && (
                <i className="bi bi-check text-white text-lg"></i>
              )}
            </div>
            {(Number(page ? page : 1) - 1) * page_size + index + 1}
            <i
              onClick={() => toggleActiveQuestion(index)}
              className="bi bi-three-dots-vertical text-lg cursor-pointer"
            ></i>
            {liveQuestion.isActive && (
              <div className="card_list">
                <span
                  onClick={() => toggleActiveQuestion(index)}
                  className="more_close "
                >
                  X
                </span>
                <Link
                  className="card_list_item"
                  href={`/school/questions/edit-question/${liveQuestion._id}`}
                >
                  Edit Paper
                </Link>
                <Link
                  className="card_list_item"
                  href={`/school/questions/create-question/${liveQuestion._id}`}
                >
                  Add Questions
                </Link>

                <div
                  onClick={() => remove(liveQuestion._id)}
                  className="card_list_item"
                >
                  Delete Paper
                </div>
              </div>
            )}
          </div>
        </td>
        <td>{liveQuestion.subject}</td>
        <td>
          {liveQuestion.levelName} {liveQuestion.level}
        </td>
        <td>{liveQuestion.title}</td>
        <td className="text-sm">
          {liveQuestion.isOn ? (
            <CountdownCellExam
              startingTime={Number(
                Number(liveQuestion.duration * 60 * 1000) +
                  new Date(String(liveQuestion.questionDate)).getTime() -
                  Date.now()
              )}
            />
          ) : (
            <CountdownCell
              startingTime={
                new Date(String(liveQuestion.questionDate)).getTime() -
                Date.now()
              }
            />
          )}
        </td>
      </tr>
    </>
  )
}
