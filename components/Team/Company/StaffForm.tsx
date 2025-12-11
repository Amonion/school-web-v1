'use client'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { useState } from 'react'
import PositionStore from '@/src/zustand/app/Position'
import { MessageStore } from '@/src/zustand/notification/Message'
import CustomBtn from '@/components/CustomBtn'
import { useParams } from 'next/navigation'

const StaffForm: React.FC = () => {
  const url = '/company/positions/'
  const { page } = useParams()
  const [page_size] = useState(5)
  const [sort] = useState('-createdAt')
  const [queryParams] = useState(
    `?page_size=${page_size}&page=${page ? page : 1}&ordering=${sort}`
  )
  const { setMessage } = MessageStore()
  const {
    positionFormData,
    loading,
    showPositionForm,
    setPositionForm,
    postItem,
    updateItem,
  } = PositionStore()

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setPositionForm(name as keyof typeof positionFormData, value)
  }

  const handleSubmit = async () => {
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
    const data = appendForm(inputsToValidate)
    if (positionFormData._id) {
      updateItem(
        `${url}${positionFormData._id}/${queryParams}`,
        data,
        setMessage
      )
    } else {
      await postItem(url, data, setMessage)
    }
  }

  return (
    <>
      <div
        onClick={() => showPositionForm(false)}
        className="fixed bg-black/50  w-full h-full flex items-center justify-center z-40 top-0 left-0"
      >
        <div
          onClick={(e) => {
            e.stopPropagation()
          }}
          className="flex max-w-[800px]"
        >
          <div className="card_body w-full sharp">
            <div className="custom_sm_title">{`${
              positionFormData._id ? `Edit Position` : `Create Position`
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
              <div className="">
                <CustomBtn
                  onClick={handleSubmit}
                  loading={loading}
                  label={
                    positionFormData._id ? 'Update Position' : 'Create Position'
                  }
                />
              </div>
              <div
                onClick={() => showPositionForm(false)}
                className="custom_btn ml-auto "
              >
                Close Form
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default StaffForm
