'use client'
import { useState } from 'react'
import SchoolStore from '@/src/zustand/school/School'
import { MessageStore } from '@/src/zustand/notification/Message'
import { Edit, PlusCircle, Trash2 } from 'lucide-react'
import { validateInputs } from '@/lib/validation'
import { appendForm } from '@/lib/helpers'

const CreateSchool: React.FC = () => {
  const url = '/schools/'
  const {
    schoolData,
    loading,
    schoolPositions,
    updateItem,
    removeGrade,
    addGradeToStore,
  } = SchoolStore()
  const [grade, setGrade] = useState({ name: '', remark: '', min: 0, max: 0 })
  const { setMessage } = MessageStore()
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isEditingGrade, setIsEditingGrade] = useState(false)
  const letters = ['A', 'B', 'C', 'D', 'E', 'F']
  const arms = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
  ]

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

  const addArms = (id: string, int: number) => {
    SchoolStore.setState((state) => {
      const newPositions = state.schoolPositions.map((item) =>
        item._id === id
          ? {
              ...item,
              positionDivisions:
                int >= 0
                  ? [
                      ...item.positionDivisions,
                      { arm: arms[int + 1], isChecked: false },
                    ]
                  : item.positionDivisions.slice(0, -1),
            }
          : item
      )

      return {
        schoolPositions: newPositions,
      }
    })
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
        name: 'positions',
        value: JSON.stringify(schoolPositions),
        rules: { blank: true },
        field: 'Result Grading',
      },
      {
        name: 'officeId',
        value: schoolData.officeId,
        rules: { blank: true, maxLength: 1000 },
        field: 'Office Id',
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
    updateItem(`${url}${schoolData._id}`, data, setMessage)
  }

  return (
    <>
      <div className="card_body sharp mb-auto min-h-[75vh] flex flex-1 flex-col">
        <div className="w-full uppercase text-[var(--text-secondary)] mb-5 flex justify-center text-center ">
          academic Sessions for your school.
        </div>
        <div className="flex justify-center mb-10 w-full">
          <ul className="mb-3 text-lg rounded-[10px] border border-[var(--border)] p-2">
            {schoolData.academicSession.divisions.map((part, index) => (
              <li key={index} className="py-1">
                {index + 1}. {part}
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full uppercase text-[var(--text-secondary)] mb-5 flex justify-center text-center ">
          academic levels for your school.
        </div>

        <div className="grid xs:grid-cols-2 sm:grid-cols-3 gap-3 mb-10 items-start w-full">
          {schoolData.levels.map((level, int) => (
            <div className="" key={int}>
              <div className="mb-2 text-[var(--text-secondary)] text-lg">
                {level.levelName} Levels
              </div>

              <div>
                {Array.from({ length: level.maxLevel }, (_, index) => (
                  <div
                    key={index}
                    className="mb-2 rounded-[10px] border border-[var(--border)] p-2"
                  >
                    <div className="mr-auto p-1 rounded-[5px]">
                      {level.levelName} {index + 1}
                    </div>

                    {/* 🔥 Loop over classes, filtered by positionName */}
                    {schoolPositions
                      .filter(
                        (cls) =>
                          cls.positionName === level.levelName &&
                          cls.positionsIndex === index
                      )
                      .map((cls) =>
                        cls.positionDivisions.map((division, x) => (
                          <div key={x} className="flex items-start px-2 mb-2">
                            {division.arm}{' '}
                            <div className="flex ml-auto">
                              {x === cls.positionDivisions.length - 1 && (
                                <PlusCircle
                                  onClick={() => addArms(cls._id, x)}
                                  size={18}
                                  className="text-sm cursor-pointer"
                                />
                              )}
                              {x > 0 &&
                                x === cls.positionDivisions.length - 1 && (
                                  <Trash2
                                    onClick={() => addArms(cls._id, -x)}
                                    size={18}
                                    className="text-sm ml-3 cursor-pointer"
                                  />
                                )}
                            </div>
                          </div>
                        ))
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
          <div onClick={() => addGrade()} className={`custom_btn text-center`}>
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
