'use client'
import Link from 'next/link'
import Image from 'next/image'
import { appendForm, toDateTimeLocal } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { useState, useEffect } from 'react'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { MessageStore } from '@/src/zustand/notification/Message'
import { useParams, useRouter } from 'next/navigation'
import StateStore from '@/src/zustand/place/StateOrigin'
import CountryStore from '@/src/zustand/place/CountryOrigin'
import PictureDisplay from '@/components/Home/Media/PictureDisplay'
import WeekendStore from '@/src/zustand/exam/Weekend'

const CreateWeekend: React.FC = () => {
  const url = '/weekends'
  const {
    weekends,
    loading,
    weekendForm,
    getAWeekend,
    setForm,
    createWeekend,
    resetForm,
    updateWeekend,
  } = WeekendStore()
  const { states, getStates } = StateStore()
  const { countries, getCountries } = CountryStore()
  const [isStateList, setStateList] = useState(false)
  const [isCountryList, setCountryList] = useState(false)
  const [isPriorityList, setPriorityList] = useState(false)
  const { bioUser } = AuthStore()
  const { setMessage } = MessageStore()
  const [currentPage] = useState(1)
  const [page_size] = useState(20)
  const [sort] = useState('-createdAt')
  const priorities = ['Local', 'National', 'International']
  const { id } = useParams()
  const router = useRouter()
  const [preview, setPreview] = useState<string | null>(null)
  const [queryParams] = useState(
    `?page_size=${page_size}&page=${currentPage}&ordering=${sort}`
  )

  useEffect(() => {
    const initialize = async () => {
      if (id) {
        const existingItem = weekends.find((item) => item._id === String(id))
        if (existingItem) {
          WeekendStore.setState({ weekendForm: existingItem })
        } else {
          await getAWeekend(`${url}/${id}`, setMessage)
        }
      }
    }

    initialize()
    return () => {
      resetForm()
    }
  }, [id])

  useEffect(() => {
    if (
      (weekendForm.priority === 'National' ||
        weekendForm.priority === 'Local') &&
      countries.length === 0
    ) {
      getCountries(
        `/places/countries/?country=&page_size=350&field=country&sort=country`,
        setMessage
      )
    }
  }, [weekendForm.priority])

  const selectCountry = (country: string) => {
    setForm('country', country)
    setCountryList(false)
    getStates(
      `/places/state/?country=${country}&page_size=350&field=state&sort=state`,
      setMessage
    )
  }

  const selectState = (state: string) => {
    setForm('state', state)
    setStateList(false)
  }

  const isAtLeastOneHourFromNow = (value: string | Date): boolean => {
    const selectedTime = new Date(value).getTime()
    const now = Date.now()

    const ONE_HOUR = 60 * 60 * 1000

    return selectedTime - now >= ONE_HOUR
  }

  const handleFileChange =
    (key: keyof typeof weekendForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files ? e.target.files[0] : null
      setForm(key, file)
      if (key === 'picture' && file) {
        const localUrl = URL.createObjectURL(file)
        setPreview(localUrl)
      }
    }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(name as keyof typeof weekendForm, value.trim())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    if (weekendForm.startAt && !isAtLeastOneHourFromNow(weekendForm.startAt)) {
      setMessage('Time must be at least 1 hour from now', false)
      return
    }

    if (weekendForm.endAt && weekendForm.startAt) {
      const startTime = new Date(weekendForm.startAt).getTime()
      const endTime = new Date(weekendForm.endAt).getTime()

      const ONE_HOUR = 60 * 60 * 1000

      if (endTime - startTime <= ONE_HOUR) {
        setMessage(
          'Ending time must be at least 1 hour greater than starting time',
          false
        )
        return
      }
    }

    const inputsToValidate = [
      {
        name: 'title',
        value: weekendForm.title,
        rules: { blank: true, maxLength: 1000 },
        field: 'Title field',
      },
      {
        name: 'instruction',
        value: weekendForm.instruction,
        rules: { blank: true, maxLength: 1000 },
        field: 'Instruction field',
      },
      {
        name: 'priority',
        value: weekendForm.priority,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: 'Priority field',
      },
      {
        name: 'question',
        value: weekendForm.question,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: 'Subtitle field',
      },
      {
        name: 'country',
        value: weekendForm.country,
        rules: { blank: false, maxLength: 1000 },
        field: 'Country field',
      },
      {
        name: 'video',
        value: weekendForm.video,
        rules: { blank: false, maxSize: 1000 },
        field: 'Video file',
      },
      {
        name: 'answer',
        value: weekendForm.answer,
        rules: { blank: true },
        field: 'Content field',
      },
      {
        name: 'price',
        value: weekendForm.price,
        rules: { blank: true },
        field: 'Content field',
      },
      {
        name: 'category',
        value: weekendForm.category,
        rules: { blank: false, maxLength: 1000 },
        field: 'Category field',
      },
      {
        name: 'authorName',
        value: `Schooling Social`,
        rules: { blank: false },
        field: 'Author radio',
      },
      {
        name: 'authorUsername',
        value: `Schooling`,
        rules: { blank: false },
        field: 'Author radio',
      },
      {
        name: 'staffUsername',
        value: String(bioUser?.bioUserUsername),
        rules: { blank: false },
        field: 'Author radio',
      },
      {
        name: 'state',
        value: weekendForm.state,
        rules: { blank: false, maxLength: 1000 },
        field: 'State field',
      },
      {
        name: 'picture',
        value: weekendForm.picture,
        rules: { blank: true, maxSize: 50 },
        field: 'Picture field',
      },
      {
        name: 'startAt',
        value: weekendForm.startAt,
        rules: { blank: false, maxSize: 50 },
        field: 'Start At',
      },
      {
        name: 'endAt',
        value: weekendForm.endAt,
        rules: { blank: false, maxSize: 50 },
        field: 'Start At',
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
    if (id) {
      updateWeekend(`${url}/${id}${queryParams}`, data, setMessage, () =>
        router.push(`/team/competitions/weekends`)
      )
    } else {
      createWeekend(`${url}${queryParams}`, data, setMessage, () =>
        router.push(`/team/competitions/weekends`)
      )
    }
  }

  return (
    <>
      <div className="card_body sharp">
        <div className="custom_sm_title">
          {id ? `Update Giveaway` : `Create Giveaway`}
        </div>

        <div className="grid-2 grid-lay">
          <div className="flex flex-col relative">
            <label className="label" htmlFor="">
              News Priority
            </label>
            <div
              onClick={() => setPriorityList(!isPriorityList)}
              className="form-input cursor-pointer"
            >
              {weekendForm.priority ? weekendForm.priority : 'Select priority'}{' '}
              <i
                className={`bi bi-caret-down-fill ml-auto ${
                  isPriorityList ? 'active' : ''
                }`}
              ></i>
            </div>
            {isPriorityList && (
              <div className="input_drop">
                {priorities.map((item, index) => (
                  <div
                    onClick={() => {
                      setPriorityList(false)
                      setForm('priority', item)
                    }}
                    key={index}
                    className="input_drop_list"
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>

          {weekendForm.priority && weekendForm.priority !== 'International' && (
            <>
              <div className="flex flex-col relative mb-4">
                <label className="label flex items-center w-full" htmlFor="">
                  Country of News{' '}
                </label>
                <div
                  onClick={() => {
                    setCountryList(!isCountryList)
                    setStateList(false)
                  }}
                  className="form-input cursor-pointer"
                >
                  {weekendForm.country ? weekendForm.country : 'Select Country'}
                  <i className="ml-auto bi bi-caret-down-fill"></i>
                </div>

                {isCountryList && (
                  <div className="w-full z-30 absolute left-0 top-[70px] border border-[var(--border)] bg-[var(--primary)] max-h-[300px] overflow-auto rounded-[5px] search">
                    {countries.map((item, index) => (
                      <div
                        onClick={() => selectCountry(item.country)}
                        key={index}
                        className="input_drop_list"
                      >
                        {item.countryFlag && (
                          <Image
                            className="mr-3"
                            src={String(item.countryFlag)}
                            alt="Captured"
                            sizes="100vw"
                            width={0}
                            height={0}
                            style={{ width: '60px', maxWidth: '30px' }}
                          />
                        )}
                        {item.country}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {weekendForm.priority === 'Local' && (
                <div className="flex flex-col relative mb-4">
                  <label className="label flex items-center w-full" htmlFor="">
                    State of News{' '}
                  </label>
                  <div
                    onClick={() => {
                      setStateList(!isStateList)
                      setStateList(false)
                    }}
                    className="form-input cursor-pointer"
                  >
                    {weekendForm.state ? weekendForm.state : 'Select State'}
                    <i className="ml-auto bi bi-caret-down-fill"></i>
                  </div>

                  {isStateList && (
                    <div className="w-full z-30 absolute left-0 top-[70px] border border-[var(--border)] bg-[var(--primary)] max-h-[300px] overflow-auto rounded-[5px] search">
                      {states.map((item, index) => (
                        <div
                          onClick={() => selectState(item.state)}
                          key={index}
                          className="input_drop_list"
                        >
                          {item.state}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Title
            </label>
            <input
              className="form-input"
              name="title"
              value={weekendForm.title}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter title"
            />
          </div>

          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Instruction
            </label>
            <input
              className="form-input"
              name="instruction"
              value={weekendForm.instruction}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter instruction"
            />
          </div>

          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Question
            </label>
            <input
              className="form-input"
              name="question"
              value={weekendForm.question}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter question"
            />
          </div>

          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Answer
            </label>
            <input
              className="form-input"
              name="answer"
              value={weekendForm.answer}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter answer"
            />
          </div>
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Price
            </label>
            <input
              className="form-input"
              name="price"
              value={weekendForm.price}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter price"
            />
          </div>
          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Category
            </label>
            <input
              className="form-input"
              name="category"
              value={weekendForm.category}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter category"
            />
          </div>
          <div className="flex flex-col items-start">
            <label className="label" htmlFor="time">
              Starting Time
            </label>
            <div className="relative">
              <input
                id="time"
                className="form-input"
                name="startAt"
                value={toDateTimeLocal(weekendForm.startAt)}
                onChange={handleInputChange}
                type="datetime-local"
              />
              <span className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                🗓️
              </span>
            </div>
          </div>
          <div className="flex flex-col items-start">
            <label className="label" htmlFor="time">
              Ending Time
            </label>
            <div className="relative">
              <input
                id="time"
                className="form-input"
                name="endAt"
                value={toDateTimeLocal(weekendForm.endAt)}
                onChange={handleInputChange}
                type="datetime-local"
              />
              <span className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                🗓️
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="relative mb-4 w-full max-w-[400px] h-[250px] rounded-xl  overflow-hidden">
            {preview ? (
              <PictureDisplay source={String(preview)} />
            ) : weekendForm?.picture ? (
              <PictureDisplay source={String(weekendForm.picture)} />
            ) : (
              <div className="bg-[var(--secondary)] h-full w-full" />
            )}
          </div>
        </div>

        <div className="table-action flex flex-wrap">
          {loading ? (
            <button className="custom_btn">
              <i className="bi bi-opencollective loading"></i>
              Processing...
            </button>
          ) : (
            <>
              <label htmlFor="picture" className="custom_btn mr-3">
                <input
                  className="input-file"
                  type="file"
                  name="picture"
                  id="picture"
                  accept="image/*"
                  onChange={handleFileChange('picture')}
                />
                <i className="bi bi-cloud-arrow-up text-2xl mr-2"></i>
                Picture
              </label>

              <label htmlFor="video" className="custom_btn mr-3">
                <input
                  className="input-file"
                  type="file"
                  name="video"
                  id="video"
                  accept=""
                  onChange={handleFileChange('video')}
                />
                <i className="bi bi-cloud-arrow-up text-2xl mr-2"></i>
                Video
              </label>
              <button className="custom_btn" onClick={handleSubmit}>
                Submit
              </button>
              <Link
                href="/team/competitions/weekends"
                className="custom_btn ml-auto "
              >
                Weekends Table
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default CreateWeekend
