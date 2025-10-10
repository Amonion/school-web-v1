'use client'
import Link from 'next/link'
import Image from 'next/image'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { useState, useEffect } from 'react'
import QuillEditor from '@/components/Team/Editor/QuillEditor'
import NewsStore from '@/src/zustand/news/News'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { MessageStore } from '@/src/zustand/notification/Message'
import { useParams, useRouter } from 'next/navigation'
import StateStore from '@/src/zustand/place/StateOrigin'
import CountryStore from '@/src/zustand/place/CountryOrigin'
import PictureDisplay from '@/components/Home/Media/PictureDisplay'

const CreateNews: React.FC = () => {
  const url = '/news'
  const {
    newsForm,
    setForm,
    getANews,
    loading,
    postItem,
    news,
    resetForm,
    updateNews,
  } = NewsStore()
  const { states, getStates } = StateStore()
  const { countries, getCountries } = CountryStore()
  const [name, setName] = useState('')
  const [isStateList, setStateList] = useState(false)
  const [isCountryList, setCountryList] = useState(false)
  const [isPriorityList, setPriorityList] = useState(false)
  const { bioUser } = AuthStore()
  const { setMessage } = MessageStore()
  const [currentPage] = useState(1)
  const [page_size] = useState(20)
  const [tag, setTag] = useState('')
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
        setName(String(name))
        const existingItem = news.find((item) => item._id === String(id))
        if (existingItem) {
          NewsStore.setState({ newsForm: existingItem })
        } else {
          await getANews(`${url}/${id}`, setMessage)
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
      (newsForm.priority === 'National' || newsForm.priority === 'Local') &&
      countries.length === 0
    ) {
      getCountries(
        `/places/countries/?country=&page_size=350&field=country&sort=country`,
        setMessage
      )
    }
  }, [newsForm.priority])

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

  const handleFileChange =
    (key: keyof typeof newsForm) =>
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
    setForm(name as keyof typeof newsForm, value)
  }

  const handleTag = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value
    setTag(value)
    if (value.includes(',')) {
      newsForm.tags.push(value.replace(',', ''))
      setForm('tags', newsForm.tags)
      setTag('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    const inputsToValidate = [
      {
        name: 'title',
        value: newsForm.title,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Title field',
      },
      {
        name: 'priority',
        value: newsForm.priority,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Priority field',
      },
      {
        name: 'subtitle',
        value: newsForm.subtitle,
        rules: { blank: true, minLength: 3, maxLength: 100 },
        field: 'Subtitle field',
      },
      {
        name: 'country',
        value: newsForm.country,
        rules: { blank: false, maxLength: 1000 },
        field: 'Country field',
      },
      {
        name: 'tags',
        value: JSON.stringify(newsForm.tags),
        rules: { blank: true, maxLength: 1000 },
        field: 'Tags field',
      },
      {
        name: 'video',
        value: newsForm.video,
        rules: { blank: false, maxSize: 1000 },
        field: 'Video file',
      },
      {
        name: 'content',
        value: newsForm.content,
        rules: { blank: true, minLength: 20 },
        field: 'Content field',
      },
      {
        name: 'isFeatured',
        value: newsForm.isFeatured,
        rules: { blank: false },
        field: 'Is Featued radio field',
      },
      {
        name: 'category',
        value: newsForm.category,
        rules: { blank: false, maxLength: 1000 },
        field: 'Category field',
      },
      {
        name: 'author',
        value: bioUser ? bioUser.bioUserDisplayName : `Schooling Social`,
        rules: { blank: false },
        field: 'Author radio',
      },
      {
        name: 'state',
        value: newsForm.state,
        rules: { blank: false, maxLength: 1000 },
        field: 'State field',
      },
      {
        name: 'picture',
        value: newsForm.picture,
        rules: { blank: true, maxSize: 50 },
        field: 'Picture field',
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
      updateNews(`${url}/${id}${queryParams}`, data, setMessage, () =>
        router.push(`/team/news`)
      )
    } else {
      postItem(`${url}${queryParams}`, data, setMessage)
    }
  }

  return (
    <>
      <div className="card_body sharp">
        <div className="custom_sm_title">
          {name ? `Update ${name}` : `Create News`}
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
              {newsForm.priority ? newsForm.priority : 'Select priority'}{' '}
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

          {newsForm.priority && newsForm.priority !== 'International' && (
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
                  {newsForm.country ? newsForm.country : 'Select Country'}
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

              {newsForm.priority === 'Local' && (
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
                    {newsForm.state ? newsForm.state : 'Select State'}
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
              value={newsForm.title}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter title"
            />
          </div>

          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Subtitle
            </label>
            <input
              className="form-input"
              name="subtitle"
              value={newsForm.subtitle}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter subtitle"
            />
          </div>

          <div className="flex flex-col">
            <label className="label" htmlFor="">
              SEO Description
            </label>
            <input
              className="form-input"
              name="seoDescription"
              value={newsForm.seoDescription}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter seo description"
            />
          </div>

          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Tags
            </label>
            <input
              className="form-input"
              name="tags"
              value={tag}
              onChange={handleTag}
              type="text"
              placeholder="Enter tags: Maths, English, ..."
            />
            <div className="flex flex-wrap">
              {newsForm.tags?.map((item, index) => (
                <span
                  className="text-[12px] cursor-pointer px-2 mr-1 mb-1 border border-[var(--border)]"
                  key={index}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Category
            </label>
            <input
              className="form-input"
              name="category"
              value={newsForm.category}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter category"
            />
          </div>
        </div>

        <div className="relative my-10 w-full h-[250px] rounded-xl  overflow-hidden">
          {preview ? (
            <PictureDisplay source={String(preview)} />
          ) : newsForm?.picture ? (
            <PictureDisplay source={String(newsForm.picture)} />
          ) : (
            <div className="bg-[var(--secondary)] h-full w-full" />
          )}
        </div>

        <QuillEditor
          contentValue={newsForm.content}
          onChange={(content) => setForm('content', content)}
        />

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
              <Link href="/team/news" className="custom_btn ml-auto ">
                News Table
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default CreateNews
