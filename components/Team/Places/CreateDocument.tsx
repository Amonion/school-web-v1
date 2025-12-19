'use client'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import DocumentStore from '@/src/zustand/place/Document'
import { MessageStore } from '@/src/zustand/notification/Message'
import CustomBtn from '@/components/CustomBtn'
import { useParams } from 'next/navigation'

const CreateDocumentForm: React.FC = () => {
  const url = '/documents'
  const { page, country } = useParams()
  const params = `?country=${country}&page_size=${20}&page=${
    page ? page : 1
  }&ordering=name`
  const { setMessage } = MessageStore()
  const { documentForm, loading, setForm, showForm, updateItem, postItem } =
    DocumentStore()

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(name as keyof typeof documentForm, value)
  }

  const handleFileChange =
    (key: keyof typeof documentForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files ? e.target.files[0] : null
      setForm(key, file)
    }

  const handleSubmit = async () => {
    const inputsToValidate = [
      {
        name: 'country',
        value: documentForm.country,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: 'Country field',
      },
      {
        name: 'description',
        value: documentForm.description.trim(),
        rules: { blank: false, maxLength: 1000 },
        field: 'Description field',
      },
      {
        name: 'picture',
        value: documentForm.picture,
        rules: { blank: false, maxSize: 10 },
        field: 'Picture file',
      },
      {
        name: 'name',
        value: documentForm.name.trim(),
        rules: { blank: true, maxLength: 1000 },
        field: 'Document Name',
      },
      {
        name: 'required',
        value: documentForm.required,
        rules: { blank: false, maxLength: 1000 },
        field: 'Required',
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
    if (documentForm._id) {
      updateItem(`${url}/${documentForm._id}${params}`, data, setMessage, () =>
        showForm(false)
      )
    } else {
      await postItem(`${url}${params}`, data, setMessage, () => showForm(false))
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
            <div className="custom_sm_title">
              {documentForm._id ? `Update Document` : `Create Document`}
            </div>

            <div className="flex flex-col mb-2">
              <label className="label" htmlFor="">
                Name
              </label>
              <div className="flex">
                <input
                  className="form-input"
                  name="name"
                  value={documentForm.name}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="Enter Name"
                />
              </div>
            </div>

            <div className="flex flex-col mb-2">
              <label className="label" htmlFor="">
                Document Description
              </label>
              <div className="flex">
                <textarea
                  name="description"
                  value={documentForm.description}
                  onChange={handleInputChange}
                  placeholder="Write document description"
                  className="form-input"
                ></textarea>
              </div>
            </div>

            <div className="table-action gap-4 flex flex-wrap">
              {loading ? (
                <CustomBtn label="Processing..." loading={false} />
              ) : (
                <>
                  <label htmlFor="banner" className="custom_btn ">
                    <input
                      className="input-file"
                      type="file"
                      name="picture"
                      id="banner"
                      accept="image/*"
                      onChange={handleFileChange('picture')}
                    />
                    <i className="bi bi-cloud-arrow-up text-2xl mr-2"></i>
                    Picture
                  </label>

                  <button className="custom_btn" onClick={handleSubmit}>
                    Create Document
                  </button>

                  <div
                    onClick={() => showForm(false)}
                    className="custom_btn ml-auto"
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

export default CreateDocumentForm
