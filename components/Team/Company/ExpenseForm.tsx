'use client'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { useState } from 'react'
import QuillEditor from '@/components/Team/Editor/QuillEditor'
import ExpensesStore from '@/src/zustand/app/Expenses'
import { MessageStore } from '@/src/zustand/notification/Message'
import CustomBtn from '@/components/CustomBtn'

const CreateExpenseForm: React.FC = () => {
  const url = '/company/expenses/'
  const { expensesForm, loading, postItem, showForm, updateItem, setForm } =
    ExpensesStore()

  const [content, setContent] = useState('')
  const { setMessage } = MessageStore()
  const [currentPage] = useState(1)
  const [page_size] = useState(5)
  const [sort] = useState('-createdAt')
  const [queryParams] = useState(
    `?page_size=${page_size}&page=${currentPage}&ordering=${sort}`
  )

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(name as keyof typeof expensesForm, value)
  }

  const handleFileChange =
    (key: keyof typeof expensesForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files ? e.target.files[0] : null
      setForm(key, file)
    }

  const handleSubmit = async (e: React.FormEvent) => {
    const inputsToValidate = [
      {
        name: 'name',
        value: expensesForm.name,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Expenses field',
      },
      {
        name: 'amount',
        value: expensesForm.amount,
        rules: { blank: true, maxLength: 1000 },
        field: 'Amount field',
      },
      {
        name: 'receipt',
        value: expensesForm.receipt,
        rules: { blank: false, maxSize: 10 },
        field: 'Receipt file',
      },

      {
        name: 'description',
        value: content,
        rules: { blank: false, maxLength: 1000 },
        field: 'Description field',
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
    if (expensesForm) {
      updateItem(`${url}${expensesForm._id}${queryParams}`, data, setMessage)
    } else {
      postItem(`${url}${queryParams}`, data, setMessage)
    }
  }

  return (
    <>
      <div
        onClick={() => showForm(false)}
        className="fixed bg-black/50  w-full h-full flex items-center justify-center z-40 top-0 left-0"
      >
        <div
          onClick={(e) => {
            e.stopPropagation()
          }}
          className="flex max-w-[800px]"
        >
          <div className="card_body sharp">
            <div className="grid-2 grid-lay">
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Name
                </label>
                <input
                  className="form-input"
                  name="name"
                  value={expensesForm.name}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="Enter name"
                />
              </div>
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Amount
                </label>
                <input
                  className="form-input"
                  name="amount"
                  value={expensesForm.amount}
                  onChange={handleInputChange}
                  type="number"
                  placeholder="Enter amount"
                />
              </div>
            </div>

            <QuillEditor
              contentValue={content}
              onChange={(content) => setContent(content)}
            />

            <div className="table-action gap-4 flex flex-wrap">
              {loading ? (
                <CustomBtn label="" loading={true} />
              ) : (
                <>
                  <label htmlFor="receipt" className="custom_btn ">
                    <input
                      className="input-file"
                      type="file"
                      name="receipt"
                      id="receipt"
                      accept="image/*"
                      onChange={handleFileChange('receipt')}
                    />
                    <i className="bi bi-cloud-arrow-up text-2xl mr-2"></i>
                    Receipt
                  </label>

                  <button className="custom_btn" onClick={handleSubmit}>
                    Submit
                  </button>
                  <button
                    className="custom_btn ml-auto"
                    onClick={() => showForm(false)}
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CreateExpenseForm
