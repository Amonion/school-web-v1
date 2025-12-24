'use client'
import { IOption, Objective } from '@/src/zustand/exam/Objective'

interface QuestionObjectiveProps {
  question: Objective
  page_size: number
  currentPage: number
  index: number
  isLastResults: boolean
  selectAnswer: (option: IOption, id: string) => void
}

const QuestionObjective: React.FC<QuestionObjectiveProps> = ({
  question,
  page_size,
  currentPage,
  index,
  isLastResults,
  selectAnswer,
}) => {
  const optionsLabel = ['A', 'B', 'C', 'D', 'E', 'F']

  return (
    <div className="questions">
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
          <div className="question text-[var(--text-secondary)]">
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
              {isLastResults && item.isClicked && !item.isSelected && (
                <i className="bi bi-x-circle absolute top-0 left-[-20px]"></i>
              )}
              <div className="option_num">{optionsLabel[int]})</div>
              <div className="option_num">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default QuestionObjective
