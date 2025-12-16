'use client'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { MessageStore } from '@/src/zustand/notification/Message'
import StateStore from '@/src/zustand/place/StateOrigin'
import { useParams } from 'next/navigation'

const CreateState: React.FC = () => {
  const url = '/places/state/'
  const { setMessage } = MessageStore()
  const {
    stateForm,
    loadingStates,
    page_size,
    setItemForm,
    showStateForm,
    updateItem,
    postItem,
  } = StateStore()
  const { page, country } = useParams()
  const params = `?country=${country}&page_size=${page_size}&page=${
    page ? page : 1
  }&sort=state`

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setItemForm(name as keyof typeof stateForm, value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    const inputsToValidate = [
      {
        name: 'state',
        value: stateForm.state,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: 'State field',
      },
      {
        name: 'stateCapital',
        value: stateForm.stateCapital,
        rules: { blank: false, maxLength: 1000 },
        field: 'Capital field',
      },
      {
        name: 'source',
        value: 'State',
        rules: { blank: false, minLength: 3, maxLength: 1000 },
        field: 'State ',
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
    if (stateForm.id) {
      updateItem(`${url}${stateForm.id}${params}`, data, setMessage, () =>
        showStateForm(false)
      )
    } else {
      await postItem(`${url}${params}`, data, setMessage, () =>
        showStateForm(false)
      )
    }
  }

  return (
    <>
      <div
        onClick={() => showStateForm(false)}
        className="fixed bg-black/50  w-full h-full flex items-center justify-center z-40 top-0 left-0"
      >
        <div
          onClick={(e) => {
            e.stopPropagation()
          }}
          className="flex max-w-[800px]"
        >
          <div className="card_body sharp">
            <div className="custom_sm_title">
              {stateForm.id ? `Update Country` : `Create Country`}
            </div>
            <div className="grid-2 grid-lay">
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  State
                </label>
                <input
                  className="form-input"
                  name="state"
                  value={stateForm.state}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="Enter state"
                />
              </div>
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  State Capital
                </label>
                <input
                  className="form-input"
                  name="stateCapital"
                  value={stateForm.stateCapital}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="Enter capital"
                />
              </div>
            </div>

            <div className="table-action gap-4 flex flex-wrap">
              {loadingStates ? (
                <button className="custom_btn">
                  <i className="bi bi-opencollective loading"></i>
                  Processing...
                </button>
              ) : (
                <>
                  <button className="custom_btn" onClick={handleSubmit}>
                    {stateForm.id ? `Update State` : `Create State`}
                  </button>
                  <div
                    onClick={() => showStateForm(false)}
                    className="custom_btn ml-auto "
                  >
                    Close Form
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CreateState
