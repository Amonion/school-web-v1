'use client'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import SchoolStore from '@/src/zustand/school/School'
import { MessageStore } from '@/src/zustand/notification/Message'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { Edit, Minus, Plus, Trash2 } from 'lucide-react'

const sessions = [
  { name: 'Term', index: 0, divisions: ['First Term', 'Second Term'] },
  {
    name: 'Semester',
    index: 1,
    divisions: ['First Semester', 'Second Semester'],
  },
  {
    name: 'Term',
    index: 2,
    divisions: ['First Term', 'Second Term', 'Third Term'],
  },
  {
    name: 'Trimester',
    index: 3,
    divisions: ['First Trimester', 'Second Trimester', 'Third Trimester'],
  },
  {
    name: 'Quater',
    index: 4,
    divisions: [
      'First Quater',
      'Second Quater',
      'Third Quater',
      'Fourth Quater',
    ],
  },
]

const CreateSchool: React.FC = () => {
  const url = '/schools/'
  const {
    schoolData,
    loading,
    getSchool,
    updateItem,
    // setSessionIndex,
    setForm,
    decreaseLevel,
    increaseLevel,
    addGradeToStore,
    removeGrade,
  } = SchoolStore()
  const { setMessage } = MessageStore()
  const { bioUserState, bioUser } = AuthStore()
  const [grade, setGrade] = useState({ name: '', remark: '', min: 0, max: 0 })
  const [isComplete, setIsComplete] = useState(false)
  const [isEditingGrade, setIsEditingGrade] = useState(false)
  const [isFirstTime, setIsFirstTime] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const router = useRouter()
  const letters = ['A', 'B', 'C', 'D', 'E', 'F']

  useEffect(() => {
    if (bioUserState?.pendingOffice !== null) {
      if (schoolData.username !== bioUserState?.pendingOffice.username) {
        getSchool(`${url}${bioUserState?.pendingOffice.username}`)
      }
    } else {
      router.push('/utils')
    }
  }, [bioUserState])

  useEffect(() => {
    if (grade.name && grade.max > 0 && grade.min && grade.remark) {
      setIsComplete(true)
    } else {
      setIsComplete(false)
    }
  }, [grade])

  useEffect(() => {
    if (!schoolData.isApplied) {
      setIsFirstTime(true)
    } else {
      setIsFirstTime(false)
    }
  }, [schoolData])

  const selectAcademicSession = (index: number) => {
    setForm('academicSession', sessions[index])
  }

  const addGrade = () => {
    if (grade.max <= grade.min) {
      setMessage('Maximum score must be greater than minimum score.', false)
      return
    }

    if (isEditingGrade && editingIndex) {
      const prevGrade = schoolData.grading[Number(editingIndex) - 1]
      const nextGrade = schoolData.grading[Number(editingIndex) + 1]

      if (prevGrade && grade.max >= prevGrade.min) {
        setMessage(
          `Grade ${grade.name} maximum score must be less than grade ${prevGrade.name} minimum score`,
          false
        )
        return
      }
      if (nextGrade && grade.min <= nextGrade.max) {
        setMessage(
          `Grade ${grade.name} minimum score must be greater than grade ${nextGrade.name} maximum score`,
          false
        )
        return
      }

      if (
        editingIndex &&
        schoolData.grading.some((g) => g.name === grade.name) &&
        grade.name !== schoolData.grading[editingIndex].name
      ) {
        setMessage(`This grade ${grade.name} already exists.`, false)
        return
      }

      SchoolStore.setState((state) => {
        const newGrading = state.schoolData.grading.map((item, index) =>
          index === editingIndex ? grade : item
        )
        return {
          schoolData: {
            ...state.schoolData,
            grading: newGrading,
          },
        }
      })
    } else {
      if (schoolData.grading.some((g) => g.name === grade.name)) {
        setMessage(`This grade ${grade.name} already exists.`, false)
        return
      }

      const lastGrade = schoolData.grading[schoolData.grading.length - 1]
      if (lastGrade && grade.max >= lastGrade.min) {
        setMessage(
          `Grade ${grade.name} maximum score must be less than grade ${lastGrade.name} minimum score`,
          false
        )
        return
      }

      const lastGradeIndex = letters.findIndex((g) => g === lastGrade.name)
      const gradeIndex = letters.findIndex((g) => g === grade.name)

      if (lastGradeIndex > gradeIndex) {
        setMessage(
          `You cannot add ${grade.name} ahead of grade ${lastGrade.name}, instead edit grade ${lastGrade.name} to ${grade.name} and continue.`,
          false
        )
        return
      }

      addGradeToStore(grade)
    }
    setGrade({ name: '', remark: '', min: 0, max: 0 })
  }

  const deleteGrade = (index: number) => {
    if (index === 0) {
      setMessage('You cannot remove the first grade', false)
      return
    }

    removeGrade(index)
  }

  const editGrade = (index: number) => {
    setIsEditingGrade(true)
    setEditingIndex(index)
    setGrade(schoolData.grading[index])
  }

  const handleSubmit = async () => {
    const inputsToValidate = [
      {
        name: 'grading',
        value: JSON.stringify(schoolData.grading),
        rules: { blank: true },
        field: 'Result Grading',
      },
      {
        name: 'isFirstTime',
        value: isFirstTime,
        rules: { blank: false, maxLength: 1000 },
        field: 'First Timing',
      },
      {
        name: 'officeId',
        value: schoolData.officeId,
        rules: { blank: true, maxLength: 1000 },
        field: 'Office Id',
      },
      {
        name: 'academicSession',
        value: JSON.stringify(schoolData.academicSession),
        rules: { blank: true },
        field: 'Academic Session',
      },
      {
        name: 'levels',
        value: JSON.stringify(schoolData.levels),
        rules: { blank: true },
        field: 'Levels',
      },
      {
        name: 'bioUserId',
        value: String(bioUser?._id),
        rules: { blank: true, maxLength: 100 },
        field: 'Username',
      },
      {
        name: 'isApplied',
        value: true,
        rules: { blank: true, maxLength: 100 },
        field: 'Username',
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
    updateItem(`${url}${schoolData._id}`, data, setMessage, () =>
      router.push(`/utils/create-office`)
    )
  }

  return (
    <>
      <div className="card_body sharp mb-auto min-h-[75vh] flex flex-1 flex-col">
        <div className="w-full text-[var(--text-secondary)] text-xl sm:text-2xl mb-6 flex justify-center text-center ">
          School Academic Settings
        </div>
        <div className="w-full uppercase text-[var(--text-secondary)] mb-3 flex justify-center text-center ">
          Click on any of the box below to select the academic sessions used by
          your school.
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mb-10 w-full">
          {sessions.map((item, index) => (
            <div
              onClick={() => selectAcademicSession(index)}
              key={index}
              className={`${
                schoolData.academicSession &&
                schoolData.academicSession.index === index
                  ? 'border-[var(--custom)]'
                  : ''
              } relative p-3 cursor-pointer hover:border-[var(--custom)] flex rounded-[10px] border border-[var(--border)] flex-col items-start`}
            >
              <div className="text-xl font-semibold uppercase">{item.name}</div>
              <ul className="pl-2 mb-3 text-lg">
                {item.divisions.map((part, index) => (
                  <li key={index} className="py-1">
                    {index + 1}. {part}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="w-full uppercase text-[var(--text-secondary)] mb-5 flex justify-center text-center ">
          Click on the plus (+) or minus (-) sign, to add or remove levels for
          your school.
        </div>
        <div className="grid  xs:grid-cols-2 sm:grid-cols-3 gap-3 mb-10 items-start w-full">
          {schoolData.levels.map((level, int) => (
            <div
              className="rounded-[10px] border border-[var(--border)] p-2"
              key={int}
            >
              <div className="mb-2 text-[var(--text-secondary)] text-lg">
                {level.levelName} Levels
              </div>
              <div className="">
                {Array.from({ length: level.maxLevel }, (_, index) => (
                  <div key={index} className={`mb-2 flex items-center `}>
                    <div className="mr-auto p-1 rounded-[5px]">
                      {level.levelName} {index + 1}
                    </div>
                    {level.maxLevel === index + 1 && (
                      <div className="flex items-center">
                        {index > 0 && (
                          <div
                            onClick={() => decreaseLevel(int)}
                            className="w-7 h-7 text-[var(--custom)] flex justify-center items-center mr-1 cursor-pointer rounded-full bg-[var(--secondary)]"
                          >
                            <Minus size={14} className="text-sm" />
                          </div>
                        )}
                        <div
                          onClick={() => increaseLevel(int)}
                          className="w-7 h-7 text-[var(--success)] flex justify-center items-center cursor-pointer rounded-full bg-[var(--secondary)]"
                        >
                          <Plus size={14} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="w-full uppercase text-[var(--text-secondary)] mb-5 flex justify-center text-center ">
          Score range for each grade in your school.
        </div>
        <div className=" mb-10 grid sm:grid-cols-2 gap-4 items-start w-full">
          {schoolData.grading.map((grade, index) => (
            <div
              key={index}
              className="rounded-[10px] relative border border-[var(--border)] p-2"
            >
              <div className="flex items-center  absolute top-2 right-2">
                {index > 0 && (
                  <div
                    onClick={() => deleteGrade(index)}
                    className="w-7 h-7 text-[var(--custom)] flex justify-center items-center mr-1 cursor-pointer rounded-full bg-[var(--secondary)]"
                  >
                    <Trash2 size={14} className="text-sm" />
                  </div>
                )}
                <div
                  onClick={() => editGrade(index)}
                  className="w-7 h-7 text-[var(--success)] flex justify-center items-center cursor-pointer rounded-full bg-[var(--secondary)]"
                >
                  <Edit size={14} />
                </div>
              </div>
              <div className="text-lg text-[var(--text-secondary)] mb-2 text-center">
                Grade {grade.name}
              </div>
              <div className="flex justify-evenly">
                <div className="rel">
                  <div className="">
                    Minimum:{' '}
                    <span className="text-[var(--text-secondary)]">
                      {grade.min}%
                    </span>{' '}
                  </div>
                </div>
                <div className="rel mx-2">
                  <div className="text">
                    Maximum:{' '}
                    <span className="text-[var(--text-secondary)]">
                      {grade.max}%
                    </span>
                  </div>
                </div>
                <div className="rel">
                  <div className="text">
                    Remark:{' '}
                    <span className="text-[var(--text-secondary)]">
                      {grade.remark}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="w-full uppercase text-[var(--text-secondary)] mb-5 flex justify-center text-center ">
          Set the score range and remark for each grade in your school.
        </div>
        <div className="items-end mb-5 gap-4 sm:gap-10 grid grid-cols-2 sm:grid-cols-5">
          <div className="rel">
            <div className="">Minimum: {grade.min}%</div>
            <input
              type="number"
              className="form-input w-10"
              placeholder="Enter minimum %"
              value={grade.min}
              min={0}
              onChange={(e) =>
                setGrade((prev) => ({
                  ...prev,
                  min: Number(e.target.value),
                }))
              }
            />
          </div>
          <div className="rel">
            <div className="">Maximum: {grade.max}%</div>
            <input
              type="number"
              placeholder="Enter maximum %"
              className="form-input"
              value={grade.max}
              min={0}
              onChange={(e) =>
                setGrade((prev) => ({
                  ...prev,
                  max: Number(e.target.value),
                }))
              }
            />
          </div>
          <div className="rel">
            <div className="flex">
              Grade: {grade.name} <span className="ml-auto">(A-F)</span>{' '}
            </div>
            <input
              type="text"
              placeholder="Enter grade"
              className="form-input"
              value={grade.name}
              maxLength={1}
              onChange={(e) => {
                const value = e.target.value.toUpperCase()
                if (!letters.includes(value)) {
                  setMessage('You can only enter a letter from A to F', false)
                  return
                }
                setGrade((prev) => ({
                  ...prev,
                  name: value,
                }))
              }}
            />
          </div>
          <div className="rel">
            <div className="">Remark: {grade.remark}</div>
            <input
              type="text"
              placeholder="Enter remark"
              className="form-input"
              value={grade.remark}
              onChange={(e) =>
                setGrade((prev) => ({
                  ...prev,
                  remark: e.target.value,
                }))
              }
            />
          </div>
          <div
            onClick={() => {
              if (isComplete) {
                addGrade()
              }
            }}
            className={`custom_btn text-center
              ${isComplete ? '' : 'disabled'}
            `}
          >
            Add Grade
          </div>
        </div>
        <div className="justify-center flex flex-wrap">
          {loading ? (
            <button className="custom_btn neutral">
              <i className="bi bi-opencollective loading"></i>
              Processing...
            </button>
          ) : (
            <>
              <button
                className={`custom_btn neutral ${
                  schoolData.academicSession && schoolData.academicSession.index
                    ? ''
                    : 'disabled'
                }`}
                onClick={() => {
                  if (
                    schoolData.academicSession &&
                    schoolData.academicSession.index
                  ) {
                    handleSubmit()
                  }
                }}
              >
                Submit Application
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default CreateSchool
