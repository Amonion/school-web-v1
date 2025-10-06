'use client'
import Link from 'next/link'
import { formatTimeTo12Hour, formatDateToDDMMYY } from '@/lib/helpers'
import { useState, useEffect } from 'react'
import Pagination from '@/components/Team/Pagination'
import Tiptap from '@/components/Team/Editor/TextEditor'
import ObjectiveStore, {
  IOption,
  Objective,
  ObjectiveEmpty,
} from '@/src/zustand/exam/Objective'
import { MessageStore } from '@/src/zustand/notification/Message'
import { useParams } from 'next/navigation'
import QuestionPaperStore from '@/src/zustand/exam/SchoolQuestion'

export default function QuestionsTable() {
  const url = '/questions/objectives/'
  const {
    loading,
    currentPage,
    count,
    objectiveResults,
    postItem,
    setCurrentPage,
    fetchQuestions,
  } = ObjectiveStore()
  const { questionForm, getOneQuestion } = QuestionPaperStore()
  const { id } = useParams()
  const [sort] = useState('createdAt')
  const { setMessage } = MessageStore()
  const [options, setOptions] = useState<IOption[]>([])
  const [questions, addQuestion] = useState<Objective[]>([])
  const [deletedIDs, addIDs] = useState<string[]>([])
  const [isEditingOption, setIsEditingOption] = useState(false)
  const [isChanged, setChanged] = useState(false)
  const [questionText, setQuestion] = useState<string>('')
  const [editingIndex, setEditingIndex] = useState<number>(0)
  const [editingId, setEditingId] = useState('')
  const [addedIndex, setAddedIndex] = useState<number>(0)
  const optionsLabel = ['A', 'B', 'C', 'D', 'E', 'F']

  useEffect(() => {
    getOneQuestion(`/questions/${id}`, setMessage)
  }, [id])

  useEffect(() => {
    if (questionForm.optionsPerQuestion > 0) {
      const newOptions = Array.from(
        { length: questionForm.optionsPerQuestion },
        (_, index) => ({
          index: index + 1,
          value: '',
          isSelected: false,
          isClicked: false,
        })
      )
      setOptions(newOptions)
    }
  }, [questionForm])

  useEffect(() => {
    addQuestion([])
    for (let i = 0; i < objectiveResults.length; i++) {
      const el = objectiveResults[i]
      addQuestion((prevQuestions) => [...prevQuestions, el])
    }
    setAddedIndex(0)
  }, [objectiveResults])

  useEffect(() => {
    if (questionForm._id) {
      fetchQuestions(
        `${url}?paperId=${id}&ordering=${sort}&page_size=${questionForm.questionsPerPage}&page=${currentPage}`
      )
    }
  }, [currentPage, questionForm])

  const editOptions = (
    options: IOption[],
    question: string,
    id: string,
    index: number
  ) => {
    setOptions(options)
    setQuestion(question)
    setIsEditingOption(true)
    setEditingIndex(index)
    setEditingId(id)
  }

  const resetQuestion = (num: number) => {
    if (questionForm.type === 'Objective') {
      const newOptions = Array.from({ length: num }, (_, index) => ({
        index: index + 1,
        value: '',
        isSelected: false,
        isClicked: false,
      }))
      setOptions(newOptions)
    }
    setQuestion('')
  }

  const removeQuestion = (id: string) => {
    addQuestion((prev) => prev.filter((q) => q._id !== id))
    addIDs((prevDeletedIDs) => [...prevDeletedIDs, id])
  }

  const handleSelect = (selectedIndex: number) => {
    setOptions((prevOptions) =>
      prevOptions.map((option) => ({
        ...option,
        isSelected: option.index === selectedIndex,
      }))
    )
  }

  const handleOptionChange = (index: number, newValue: string) => {
    setOptions((prevOptions) =>
      prevOptions.map((option) =>
        option.index === index ? { ...option, value: newValue } : option
      )
    )
  }

  const handleQuestionIndex = (optionArray: IOption[]) => {
    const question: Objective = {
      ...ObjectiveEmpty,
      options: optionArray,
      question: questionText.trim(),
    }
    addQuestion((prevQuestions) => [...prevQuestions, question])
    setAddedIndex(addedIndex + 1)
  }

  const handleAddQuestion = () => {
    if (isEditingOption) {
      const updatedQuestion: Objective = {
        ...ObjectiveEmpty,
        options: options,
        index: editingIndex,
        question: questionText,
        _id: editingId,
      }
      addQuestion((prevQuestions) =>
        prevQuestions.map((item) =>
          item._id === editingId ? updatedQuestion : item
        )
      )

      resetQuestion(questionForm.optionsPerQuestion)
      setIsEditingOption(false)
      setChanged(true)
      setAddedIndex(editingIndex)
      setEditingId('')
    } else {
      if (questionText.trim() === ``) {
        setMessage(`Please type in your question to continue`, false)
        return
      }
      if (questionForm.type === 'Objective') {
        let selected = false
        const optionArray = []
        for (let i = 0; i < options.length; i++) {
          const el = options[i]
          if (el.value.trim() === '') {
            setMessage(`Option number ${i + 1} cannot be empty`, false)
            return
          }
          if (el.isSelected) {
            selected = true
          }
          el.value.trim()
          optionArray.push(el)
        }
        if (!selected) {
          setMessage(
            `One of the options must be marked as a correct answer to continue`,
            false
          )
          return
        }

        handleQuestionIndex(optionArray)
      } else {
        handleQuestionIndex([])
      }
      resetQuestion(questionForm.optionsPerQuestion)
    }
  }

  const handleSubmit = async () => {
    if (!isChanged && addedIndex === 0 && deletedIDs.length === 0) {
      setMessage('You have not added any new question to submit.', false)
      return
    }

    const questArray: Objective[] = []
    questions.forEach((item) => {
      const obj = {
        isClicked: item.isClicked,
        options: item.options,
        index: item.index,
        paperId: String(id),
        question: item.question,
        _id: item._id,
        isSelected: item.isSelected,
      }
      questArray.push(obj)
    })

    const form = new FormData()
    form.append('questions', JSON.stringify(questArray))
    form.append('deletedIDs', JSON.stringify(deletedIDs))
    postItem(
      `${url}?paperId=${id}&page_size=${questionForm.questionsPerPage}&page=${currentPage}ordering=${sort}`,
      form,
      setMessage
    )
  }

  return (
    <>
      <div className="card_body sharp">
        <div className="paper_head">
          <div className="paper_title">{questionForm.title}</div>
          <div className="paper_subtitle">{questionForm.subtitle}</div>
          <div className=" mb-2">{questionForm.instruction}</div>

          <div className="flex justify-center flex-wrap">
            <div className="paper_info">
              Duration: {questionForm.duration}min
            </div>
            <div className="paper_info">
              Type:&nbsp;
              {questionForm.type}
            </div>
            <div className="paper_info">
              Class:&nbsp;
              {questionForm.levelName} {questionForm.level}
            </div>
            <div className="paper_info">
              Time: {formatTimeTo12Hour(questionForm.questionDate)}
            </div>
            <div className="paper_info">
              Date: {formatDateToDDMMYY(questionForm.questionDate)}
            </div>
          </div>
        </div>

        {questions.map((question, index) => (
          <div key={index} className="questions">
            <div className="each_question">
              {questionForm.questionsPerPage && (
                <div className="question_num">
                  {(currentPage - 1) * questionForm.questionsPerPage +
                    index +
                    1}
                </div>
              )}
              <div className="question_bd flex-grow">
                <div className="question">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: question.question,
                    }}
                  ></div>
                </div>
                {question.options.map((item, int) => (
                  <div key={int} className="each_option">
                    <div className="option_num">{optionsLabel[int]})</div>
                    <div className="option_num">{item.value}</div>
                  </div>
                ))}
                <div className="flex w-full justify-end text-[var(--custom-color)]">
                  <i
                    onClick={() => removeQuestion(question._id)}
                    className="bi bi-trash cursor-pointer text-lg"
                  ></i>
                  <i
                    onClick={() =>
                      editOptions(
                        question.options,
                        question.question,
                        question._id,
                        question.index
                      )
                    }
                    className="bi bi-pencil-square cursor-pointer text-lg ml-3"
                  ></i>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="flex items-center">
          <div>Results {count}</div>
          {questionForm.questionsPerPage && (
            <Pagination
              currentPage={currentPage}
              totalItems={count}
              pageSize={questionForm.questionsPerPage}
              onPageChange={() => setCurrentPage}
            />
          )}
        </div>

        {questionForm.type === 'Objective' && (
          <div className="mb-3">
            {questionForm.optionsPerQuestion > 0 && (
              <div className="">
                {options.map((item, index) => (
                  <div key={index}>
                    <label className="flex flex-col" htmlFor="">
                      Option {optionsLabel[index]}
                    </label>
                    <div className="flex">
                      <input
                        className="form-input"
                        name="subtitle"
                        value={item.value}
                        onChange={(e) =>
                          handleOptionChange(item.index, e.target.value)
                        }
                        type="text"
                        placeholder="Enter subtitle"
                      />
                      <div
                        onClick={() => handleSelect(item.index)}
                        className={`${
                          item.isSelected ? 'bg-[var(--custom-color)]' : ''
                        } option_ticker`}
                      >
                        {item.isSelected && (
                          <i className="bi bi-check-lg text-white text-2xl"></i>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <label className="label" htmlFor="">
          Write Question
        </label>
        <Tiptap
          value={questionText}
          onChange={(content) => setQuestion(content)}
        />

        <div className="flex flex-wrap">
          <button className="custom_btn" onClick={handleAddQuestion}>
            Add Question
          </button>
        </div>
        <div className="table-action flex flex-wrap">
          {loading ? (
            <button className="custom_btn">
              <i className="bi bi-opencollective loading"></i>
              Processing...
            </button>
          ) : (
            <>
              <button className="custom_btn" onClick={handleSubmit}>
                Submit
              </button>
              <Link href="/school/questions/" className="custom_btn ml-auto ">
                Question Table
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}
