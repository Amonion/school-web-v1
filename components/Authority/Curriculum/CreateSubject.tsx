'use client'
import PictureDisplay from '@/components/Home/Media/PictureDisplay'
import QuillEditor from '@/components/Team/Editor/QuillEditor'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { MessageStore } from '@/src/zustand/notification/Message'
import CourseStore from '@/src/zustand/school/Courses'
import OfficeStore from '@/src/zustand/utility/Office'
import Image from 'next/image'
import { useState } from 'react'

export default function CreateSubject() {
  const { setMessage } = MessageStore()
  const { officeForm } = OfficeStore()
  const [previewUrl, setPreviewUrl] = useState('')
  const [isClass, setClass] = useState(false)
  const {
    subject,
    page_size,
    loading,
    setIsSubject,
    updateSubject,
    postSubject,
    setSubject,
  } = CourseStore()
  const url = '/courses/subjects/'

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setSubject(name as keyof typeof subject, value)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const localUrl = URL.createObjectURL(file)
      setPreviewUrl(localUrl)
      setSubject('picture', file)
    }
  }

  const selectClass = (i: number) => {
    setSubject('level', i + 1)
    setClass(false)
  }

  const handleSubmit = () => {
    const ministerInputs = [
      {
        name: 'description',
        value: subject.description,
        rules: { blank: true },
        field: 'Description field',
      },
      {
        name: 'country',
        value: subject.country,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: 'Country field',
      },
      {
        name: 'level',
        value: subject.level,
        rules: { blank: true, maxLength: 2 },
        field: 'Level field',
      },
      {
        name: 'levelName',
        value: subject.levelName,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: 'Level name field',
      },
      {
        name: 'subjectCode',
        value: subject.subjectCode,
        rules: { blank: false, maxLength: 1000 },
        field: 'Subject code',
      },
      {
        name: 'curriculumTitle',
        value: subject.curriculumTitle,
        rules: { blank: true, maxLength: 1000 },
        field: 'Curriculum title',
      },
      {
        name: 'name',
        value: subject.name,
        rules: { blank: true, maxLength: 1000 },
        field: 'Subject name',
      },
      {
        name: 'schoolUsername',
        value: 'all',
        rules: { blank: true, maxLength: 1000 },
        field: 'Subsection name',
      },
      {
        name: 'picture',
        value: subject.picture,
        rules: { blank: false, maxLength: 1000 },
        field: 'Max level name',
      },
    ]
    const commissionerInputs = [
      {
        name: 'state',
        value: officeForm.state,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: 'State field',
      },
    ]

    const inputsToValidate =
      officeForm.username === 'Minister'
        ? [
            ...ministerInputs,
            {
              name: 'state',
              value: 'all',
              rules: { blank: true, minLength: 3, maxLength: 1000 },
              field: 'State field',
            },
          ]
        : [...ministerInputs, ...commissionerInputs]

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
    if (subject._id) {
      if (officeForm.username === 'Minister') {
        updateSubject(
          `${url}${subject._id}?country=${officeForm.country}&state=all&page_size=${page_size}`,
          data,
          setMessage,
          () => setIsSubject(false)
        )
      } else if (officeForm.username === 'Commissioner') {
        updateSubject(
          `${url}${subject._id}?country=${officeForm.country}&state[in]=all,${officeForm.state}&state=all&page_size=${page_size}`,
          data,
          setMessage,
          () => setIsSubject(false)
        )
      }
    } else {
      postSubject(
        `${url}?country=${officeForm.country}&page_size=${page_size}`,
        data,
        setMessage,
        () => setIsSubject(false)
      )
    }
  }
  return (
    <>
      <div
        onClick={() => setIsSubject(false)}
        className="fixed bg-black/50  w-full h-full flex items-center justify-center z-40 top-0 left-0"
      >
        <div
          onClick={(e) => {
            e.stopPropagation()
          }}
          className="flex w-full max-w-[1200px]"
        >
          <div className="w-0 md:w-[290px]"></div>
          <div className="card_body w-full overflow-auto min-h-[300px] max-h-[100vh] sharp flex-1 border border-[var(--border)]">
            <div className="flex flex-col w-full justify-center mb-5">
              <div className="relative mx-auto w-[150px] mb-3 h-[100px] rounded-xl bg-[var(--secondary)] overflow-hidden ">
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt="Profile Background"
                    fill
                    className="object-cover"
                    priority
                  />
                ) : subject.picture ? (
                  <PictureDisplay source={String(subject.picture)} />
                ) : (
                  <div className="bg-[var(--secondary)] w-full h-full"></div>
                )}
              </div>
              <div className="flex justify-center">
                <label htmlFor="banner" className="custom_btn">
                  <input
                    type="file"
                    id="banner"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  Upload Banner
                </label>
              </div>
            </div>

            <div className="grid-2 grid-lay">
              <div className="relative">
                <label className="label flex items-center w-full" htmlFor="">
                  Subject Class
                </label>

                <div
                  onClick={() => {
                    setClass(!isClass)
                  }}
                  className="form-input cursor-pointer"
                >
                  {subject.level
                    ? `${subject.levelName} ${subject.level}`
                    : 'Select Class'}
                  <i className="ml-auto bi bi-caret-down-fill"></i>
                </div>
                {isClass && subject.maxLevel > 0 && (
                  <div
                    className={`w-full z-30 absolute left-0  border border-[var(--border)] bg-[var(--primary)] rounded-[5px] ${
                      isClass
                        ? 'overflow-auto max-h-[300px]'
                        : 'overflow-hidden h-0'
                    }`}
                  >
                    {Array.from({ length: subject.maxLevel }, (_, i) => (
                      <div
                        onClick={() => selectClass(i)}
                        key={i}
                        className="input_drop_list"
                      >
                        {subject.levelName} {i + 1}
                      </div>
                    ))}
                  </div>
                )}
                {/* )} */}
              </div>
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Subject
                </label>
                <input
                  className="form-input"
                  name="name"
                  value={subject.name}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="Enter subject"
                />
              </div>

              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Subject Code
                </label>
                <input
                  className="form-input"
                  name="subjectCode"
                  value={subject.subjectCode}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="Enter subject short name"
                />
              </div>
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Curriculum
                </label>
                <input
                  className="form-input"
                  name="curriculumTitle"
                  value={subject.curriculumTitle}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="Enter curriculum title"
                />
              </div>
            </div>

            <QuillEditor
              contentValue={subject.description}
              onChange={(e) => {
                setSubject('description', e)
              }}
            />
            {loading ? (
              <button className="custom_btn ">
                <i className="bi bi-opencollective loading"></i>

                <div>Processing...</div>
              </button>
            ) : (
              <div className="table-action flex flex-wrap">
                <button
                  className="custom_btn mr-3 success"
                  onClick={() => handleSubmit()}
                >
                  Submit
                </button>

                <button
                  className="custom_btn ml-auto"
                  onClick={() => setIsSubject(false)}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
