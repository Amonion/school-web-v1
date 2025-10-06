'use client'
import Link from 'next/link'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { useState, useEffect } from 'react'
import QuillEditor from '@/components/Team/Editor/QuillEditor'
import NewsStore from '@/src/zustand/news/News'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { MessageStore } from '@/src/zustand/notification/Message'
import PlaceStore, { Place } from '@/src/zustand/place/Place'
import { useParams, useRouter } from 'next/navigation'

const CreateNews: React.FC = () => {
  const url = '/news'
  const {
    newsForm,
    setForm,
    getANews,
    loading,
    postItem,
    results,
    resetForm,
    updateNews,
  } = NewsStore()
  const { searchItem, searchedItems } = PlaceStore()
  const [name, setName] = useState('')
  const [isStateList, setStateList] = useState(false)
  const [isPriorityList, setPriorityList] = useState(false)
  const { user } = AuthStore()
  const { setMessage } = MessageStore()
  const [currentPage] = useState(1)
  const [page_size] = useState(20)
  const [sort] = useState('-createdAt')
  const priorities = ['Local', 'National', 'International']
  const { id } = useParams()
  const router = useRouter()

  const [queryParams] = useState(
    `?page_size=${page_size}&page=${currentPage}&ordering=${sort}`
  )

  useEffect(() => {
    const initialize = async () => {
      if (id) {
        setName(String(name))
        const existingItem = results.find((item) => item._id === String(id))
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

  const handleSearchPlace = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setStateList(true)
    searchItem(`/places/state/?state=${value}&page_size=50&field=state`)
  }

  const selectPlace = (place: Place) => {
    setForm('continent', place.continent)
    setForm('country', place.country)
    setForm('state', place.state)
    setForm('placeId', place.id)
    setStateList(false)
  }

  const handleFileChange =
    (key: keyof typeof newsForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files ? e.target.files[0] : null
      setForm(key, file)
    }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm(name as keyof typeof newsForm, value)
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
        name: 'placeId',
        value: newsForm.placeId,
        rules: { blank: false, maxLength: 1000 },
        field: 'Place Id',
      },
      {
        name: 'level',
        value: newsForm.level,
        rules: { blank: false, maxLength: 1000 },
        field: 'Level field',
      },
      {
        name: 'tags',
        value: newsForm.tags,
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
        name: 'videoUrl',
        value: newsForm.videoUrl,
        rules: { blank: false, maxLength: 1000 },
        field: 'Video URL field',
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
        name: 'publishedAt',
        value: newsForm.publishedAt,
        rules: { blank: true, maxLength: 1000 },
        field: 'PublishedAt date field',
      },
      {
        name: 'author',
        value: user ? user.username : `Schooling Social`,
        rules: { blank: false },
        field: 'Author radio',
      },

      {
        name: 'state',
        value: newsForm.state,
        rules: { blank: true, maxLength: 1000 },
        field: 'State field',
      },
      {
        name: 'picture',
        value: newsForm.picture,
        rules: { blank: true, maxSize: 50 },
        field: 'Picture field',
      },

      {
        name: 'continent',
        value: newsForm.continent,
        rules: { blank: true, maxLength: 1000 },
        field: 'Continent field',
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
          <div className="flex flex-col relative">
            <label className="label" htmlFor="">
              State Name: {newsForm.state}
            </label>
            <input
              className="form-input"
              name="continent"
              onChange={handleSearchPlace}
              type="text"
              placeholder="Search news state"
            />
            {isStateList && (
              <div className="input_drop">
                {searchedItems.map((item, index) => (
                  <div
                    onClick={() => selectPlace(item)}
                    key={index}
                    className="input_drop_list"
                  >
                    {item.state}, {item.country}
                  </div>
                ))}
              </div>
            )}
          </div>

          {newsForm.state && (
            <>
              <div className="flex flex-col relative">
                <label className="label" htmlFor="">
                  Country Name
                </label>
                <div className="form-input">
                  {newsForm.country ? newsForm.country : 'First enter state'}
                </div>
              </div>

              <div className="flex flex-col relative">
                <label className="label" htmlFor="">
                  Continent Name
                </label>
                <div className="form-input">
                  {newsForm.continent
                    ? newsForm.continent
                    : 'First enter news state'}
                </div>
              </div>
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
              value={newsForm.tags}
              onChange={handleInputChange}
              type="text"
              placeholder="Enter tags"
            />
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

          <div className="flex flex-col">
            <label className="label" htmlFor="">
              To Publish On
            </label>
            <div className="flex justify-between">
              <div className="form-input sm w-input mr-6">
                {newsForm.publishedAt
                  ? `${newsForm.publishedAt}`
                  : `Set Date & Time`}
              </div>

              <label
                className="ml-auto rounded-[5px] relative cursor-pointer flex justify-center items-center px-4 h-10 bg-[var(--border-background)]"
                htmlFor="date"
              >
                <i className="cursor-pointer bi bi-calendar-week absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"></i>
                <input
                  id="date"
                  className="sm opacity-0 w-8"
                  name="publishedAt"
                  type="datetime-local"
                  onChange={handleInputChange}
                />
              </label>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="label" htmlFor="">
              Is Featured
            </label>

            <div
              onClick={() => setForm('isFeatured', !newsForm.isFeatured)}
              className="custom_btn line neutral w-14"
            >
              {' '}
              <div
                className={`checkbox ${newsForm.isFeatured ? 'active' : ''}`}
                onClick={() => setForm('isFeatured', !newsForm.isFeatured)}
              >
                {newsForm.isFeatured && (
                  <i className="bi bi-check text-white text-lg"></i>
                )}
              </div>
            </div>
          </div>
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
              <label htmlFor="picture" className="custom_btn ">
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

              <label htmlFor="video" className="custom_btn ">
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
