'use client'
import Image from 'next/image'
import { appendForm, formatDateToDDMMYY } from '@/lib/helpers'
import NotFound from '@/components/NotFound'
import { useEffect, useState } from 'react'
import OfficeStore from '@/src/zustand/utility/Office'
import { MessageStore } from '@/src/zustand/notification/Message'
import CurriculumStore from '@/src/zustand/school/Curriculum'
import QuillEditor from '@/components/Team/Editor/QuillEditor'
import { validateInputs } from '@/lib/validation'
import PictureDisplay from '@/components/Home/Media/PictureDisplay'
import PageTitle from '@/components/PageTitle'

export default function UtilsDashboard() {
  const { setMessage, setBoxVisibility, isBoxVisible } = MessageStore()
  const {
    getActivities,
    getActivity,
    setActivity,
    postActivity,
    updateActivity,
    deleteActivity,
    activityForm,
    page_size,
    activities,
    loading,
  } = CurriculumStore()
  const { officeForm } = OfficeStore()
  const [content, setContent] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [isEditing, setEditing] = useState(false)
  const url = '/academic-levels/activities'

  useEffect(() => {
    if (!officeForm.username) return
    getActivities(
      `${url}/?country=${officeForm.name}&${
        officeForm.username === 'Minister'
          ? 'officeUsername=Minister'
          : `officeUsername[in]=${officeForm.username},Minister`
      }&page_size=${page_size}&page=1&ordering=-createdAt`,
      setMessage
    )
  }, [officeForm])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setActivity(name as keyof typeof activityForm, value)
  }

  const deleteItem = (id: string) => {
    deleteActivity(`${url}/${id}`, setMessage)
  }
  const editItem = (id: string) => {
    getActivity(`${url}/${id}`, setMessage, () => {
      setEditing(true)
      setBoxVisibility(true)
      setContent(activityForm.content || '')
      if (activityForm.startingDate) {
        const startDay = new Date(activityForm.startingDate)
          .toISOString()
          .split('T')[0]
        setActivity('startingDate', startDay)
      }
      if (activityForm.endingDate) {
        const endDay = new Date(activityForm.endingDate)
          .toISOString()
          .split('T')[0]
        setActivity('endingDate', endDay)
      }
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const localUrl = URL.createObjectURL(file)
      setPreviewUrl(localUrl)
      setActivity('picture', file)
    }
  }

  const handleSubmit = () => {
    const inputsToValidate = [
      {
        name: 'officeUsername',
        value: officeForm.username,
        rules: { blank: true },
        field: 'Username field',
      },
      {
        name: 'state',
        value: officeForm.state,
        rules: { blank: true },
        field: 'Username field',
      },
      {
        name: 'picture',
        value: activityForm.picture,
        rules: { blank: true },
        field: 'Picture field',
      },
      {
        name: 'content',
        value: activityForm.content,
        rules: { blank: true },
        field: 'Content field',
      },
      {
        name: 'country',
        value: officeForm.country,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: 'Country field',
      },
      {
        name: 'isHoliday',
        value: activityForm.isHoliday,
        rules: { blank: false },
        field: 'Title field',
      },
      {
        name: 'title',
        value: activityForm.title,
        rules: { blank: true },
        field: 'Title field',
      },
      {
        name: 'startingDate',
        value: activityForm.startingDate,
        rules: { blank: true },
        field: 'Starting Date',
      },
      {
        name: 'endingDate',
        value: activityForm.endingDate,
        rules: { blank: false },
        field: 'Level',
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
    if (isEditing) {
      updateActivity(
        `${url}/${activityForm._id}?country=${officeForm.country}&page_size=${page_size}`,
        data,
        setMessage,
        () => setBoxVisibility(false)
      )
    } else {
      postActivity(
        `${url}/?country=${officeForm.country}&page_size=${page_size}`,
        data,
        setMessage,
        () => setBoxVisibility(false)
      )
    }
  }

  return (
    <div className="flex-1 flex flex-col pt-3 sm:pt-0 text-[var(--text-primary)] w-full">
      <PageTitle page="Activities:" title={officeForm.name} />

      <div className=" flex-1 sharp">
        {activities.map((item, index) => (
          <div className="flex flex-wrap mb-2" key={index}>
            <div className="overflow-hidden border border-[var(--border)] w-full min:h-[100px] sm:min-h-full min-w-[100px] sm:w-[100px] mr-1 sm:mr-2">
              {item.picture ? (
                <Image
                  className="object-contain "
                  src={String(item.picture)}
                  loading="lazy"
                  alt="username"
                  sizes="100vw"
                  height={0}
                  width={0}
                  style={{ height: '100%', width: '100%' }}
                />
              ) : (
                <Image
                  className="object-contain "
                  src={officeForm.logo}
                  loading="lazy"
                  alt="username"
                  sizes="100vw"
                  height={0}
                  width={0}
                  style={{ height: '100%', width: '100%' }}
                />
              )}
            </div>
            <div className="flex flex-col flex-1 py-2 px-[10px] bg-[var(--white)]">
              <div className="flex mb-2 flex-wrap items-end justify-between">
                <div
                  className={` uppercase overflow-ellipsis line-clamp-1 text-[var(--text-secondary)] mr-2`}
                >
                  {item.title}
                </div>
                <div className="text-[12px]">
                  {formatDateToDDMMYY(item.startingDate)}{' '}
                  {item.endingDate
                    ? `- ${formatDateToDDMMYY(item.endingDate)}`
                    : ''}
                </div>
              </div>
              <div className="flex items-center">
                <div
                  className="line-clamp-3 text-sm sm:text-base overflow-ellipsis"
                  dangerouslySetInnerHTML={{ __html: item.content }}
                ></div>{' '}
                {(officeForm.username === 'Minister' ||
                  item.officeUsername === officeForm.username) && (
                  <div className="ml-auto flex items-center">
                    <i
                      onClick={() => editItem(item._id)}
                      className="bi bi-pencil-square text-[var(--success)] cursor-pointer"
                    ></i>
                    <i
                      onClick={() => deleteItem(item._id)}
                      className="bi bi-trash text-[var(--custom)] cursor-pointer ml-3"
                    ></i>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {activities.length === 0 && <NotFound message="No Activities" />}
      </div>
      {isBoxVisible && (
        <div
          onClick={() => setBoxVisibility(false)}
          className="fixed bg-black/50  w-full h-full flex items-center justify-center z-40 top-0 left-0"
        >
          <div
            onClick={(e) => {
              e.stopPropagation()
            }}
            className="flex w-full max-w-[1200px]"
          >
            <div className="w-0 md:w-[290px]"></div>
            <div className="card_body w-full flex flex-col overflow-auto min-h-[300px] max-h-[100vh] sharp flex-1 border border-[var(--border)]">
              <div className="flex w-full justify-center mb-1">
                <div className="relative w-[150px]  h-[100px] rounded-xl bg-[var(--secondary)] overflow-hidden ">
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt="Profile Background"
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <PictureDisplay source={String(activityForm.picture)} />
                  )}
                </div>
              </div>

              <label htmlFor="banner" className="custom_btn mx-auto mb-5">
                <input
                  type="file"
                  id="banner"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                Upload Banner
              </label>

              <div className="grid sm:grid-cols-2 gap-3 mb-3">
                <div className="flex flex-col">
                  <label className="label" htmlFor="">
                    Title
                  </label>
                  <input
                    className="form-input"
                    name="title"
                    value={activityForm.title}
                    onChange={handleInputChange}
                    type="text"
                    placeholder="Enter activity title"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <label className="label" htmlFor="">
                      Starting Time
                    </label>
                    <input
                      className="border border-[var(--border)] bg-transparent rounded-[5px] p-[6px] w-[150px] sm:w-[180px]"
                      name="startingDate"
                      value={String(activityForm.startingDate)}
                      onChange={(e) =>
                        setActivity('startingDate', e.target.value)
                      }
                      type="date"
                      // type="datetime-local"
                      placeholder="Enter activity title"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="label" htmlFor="">
                      Ending Time
                    </label>
                    <input
                      className="border border-[var(--border)] bg-transparent rounded-[5px] p-[6px] w-[150px] sm:w-[180px]"
                      name="endingDate"
                      value={String(activityForm.endingDate)}
                      onChange={handleInputChange}
                      type="date"
                      // type="datetime-local"
                      placeholder="Enter activity title"
                    />
                  </div>
                </div>
              </div>

              <QuillEditor
                contentValue={content}
                onChange={(e) => {
                  setContent(e)
                  setActivity('content', e)
                }}
              />
              <div className="flex">
                {loading ? (
                  <button className="custom_btn ">
                    <i className="bi bi-opencollective loading"></i>

                    <div>Processing...</div>
                  </button>
                ) : (
                  <div className="table-action w-full flex flex-wrap">
                    <button
                      className="custom_btn mr-3 success"
                      onClick={() => handleSubmit()}
                    >
                      Submit
                    </button>
                    <div
                      onClick={() => {
                        setActivity('isHoliday', !activityForm.isHoliday)
                      }}
                      className="custom_btn line neutral mr-3"
                    >
                      <div
                        className={`checkbox ${
                          activityForm.isHoliday ? 'active' : ''
                        }`}
                        onClick={() =>
                          setActivity('isHoliday', !activityForm.isHoliday)
                        }
                      >
                        {activityForm.isHoliday && (
                          <i className="bi bi-check text-white text-lg"></i>
                        )}
                      </div>
                      Is Holiday?
                    </div>

                    <button
                      className="custom_btn ml-auto"
                      onClick={() => setBoxVisibility(false)}
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="card_body sharp mt-auto flex justify-end">
        {loading ? (
          <div className={`custom_btn neutral disabled`}>Processing</div>
        ) : (
          <div
            onClick={() => setBoxVisibility(true)}
            className={`custom_btn neutral`}
          >
            Create Activity
          </div>
        )}
      </div>
    </div>
  )
}
