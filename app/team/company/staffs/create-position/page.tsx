'use client'
import Link from 'next/link'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { useState, useEffect } from 'react'
import PositionStore, { Position } from '@/src/zustand/app/Position'
import { MessageStore } from '@/src/zustand/notification/Message'

const CreatePosition: React.FC = () => {
  const url = '/company/positions/'
  const [isEditing, setIsEditing] = useState(false)
  const [id, setId] = useState('')
  const [currentPage] = useState(1)
  const [page_size] = useState(5)
  const [sort] = useState('-createdAt')
  const [queryParams] = useState(
    `?page_size=${page_size}&page=${currentPage}&ordering=${sort}`
  )
  const [name, setName] = useState('')
  const { setMessage } = MessageStore()
  const {
    positionFormData,
    setPositionForm,
    getPositions,
    positionResults,
    loading,
    resetForm,
    postItem,
    updateItem,
  } = PositionStore()

  useEffect(() => {
    resetForm()
  }, [])

  useEffect(() => {
    const initialize = async () => {
      const query = window.location.search
      const itemId = new URLSearchParams(query).get('id')
      const name = new URLSearchParams(query).get('name')

      if (itemId !== null) {
        setName(String(name))
        setId(itemId)
        setIsEditing(true)

        const existingItem = positionResults.find((item) => item._id === itemId)

        if (existingItem) {
          populateFields(existingItem)
        } else {
          await getPositions(`${url}`, setMessage)

          const fetchedItems = PositionStore.getState().positionResults.find(
            (item) => item._id === itemId
          )

          if (fetchedItems) {
            populateFields(fetchedItems)
          } else {
            console.warn('Place with the specified ID was not found.')
          }
        }
      } else {
        setId('')
        setIsEditing(false)
        setName('')
      }
    }

    initialize()
  }, [positionResults, getPositions])

  const populateFields = (item: Position) => {
    setPositionForm('level', item.level)
    setPositionForm('salary', item.salary)
    setPositionForm('role', item.role)
    setPositionForm('salary', item.salary)
    setPositionForm('duties', item.duties)
    setPositionForm('position', item.position)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setPositionForm(name as keyof typeof positionFormData, value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    const inputsToValidate = [
      {
        name: 'duties',
        value: positionFormData.duties,
        rules: { blank: true, minLength: 1, maxLength: 100 },
        field: 'Duties',
      },
      {
        name: 'role',
        value: positionFormData.role,
        rules: { blank: true, minLength: 1, maxLength: 100 },
        field: 'Role',
      },
      {
        name: 'level',
        value: positionFormData.level,
        rules: { blank: true, maxLength: 3 },
        field: 'Level',
      },
      {
        name: 'salary',
        value: positionFormData.salary,
        rules: { blank: true, maxLength: 15 },
        field: 'Salary',
      },
      {
        name: 'position',
        value: positionFormData.position,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Position',
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
    e.preventDefault()
    const data = appendForm(inputsToValidate)
    if (isEditing) {
      updateItem(`${url}${id}/${queryParams}`, data, setMessage)
    } else {
      await postItem(url, data, setMessage)
    }
  }

  return (
    <>
      <div className="card_body">
        <div className="custom_sm_title">{`${
          isEditing ? `Edit ${name} Position` : `Create Position`
        }`}</div>
        <div className="grid-2 grid-lay">
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Position Salary
            </label>
            <input
              className="form-input"
              name="salary"
              value={positionFormData.salary}
              onChange={handleInputChange}
              type="number"
              placeholder="Enter position salary"
            />
          </div>
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Position Name
            </label>
            <input
              className="form-input"
              type="text"
              name="position"
              value={positionFormData.position}
              onChange={handleInputChange}
              placeholder="Enter position name"
            />
          </div>
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Position Role
            </label>
            <input
              className="form-input"
              type="text"
              name="role"
              value={positionFormData.role}
              onChange={handleInputChange}
              placeholder="Enter position role"
            />
          </div>
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Position Level
            </label>
            <input
              className="form-input"
              name="level"
              value={positionFormData.level}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter position level"
            />
          </div>
        </div>
        <div className="flex flex-col mb-2">
          <label className="label" htmlFor="">
            Duties
          </label>
          <textarea
            value={positionFormData.duties}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Start writin"
            name="duties"
            id=""
          ></textarea>
        </div>
        <div className="table-action flex">
          {loading ? (
            <button className="custom_btn">
              <i className="bi bi-opencollective loading"></i>
              Processing...
            </button>
          ) : (
            <>
              {isEditing ? (
                <button className="custom_btn" onClick={handleSubmit}>
                  Update Position
                </button>
              ) : (
                <button className="custom_btn" onClick={handleSubmit}>
                  Create Position
                </button>
              )}
              <Link
                href="/team/company/staffs/positions"
                className="custom_btn ml-auto "
              >
                Position Table
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default CreatePosition
