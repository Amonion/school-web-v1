'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import SchoolStore from '@/src/zustand/school/School'
import { MessageStore } from '@/src/zustand/notification/Message'
import PictureDisplay from '@/components/Home/Media/PictureDisplay'

const CreateSchool: React.FC = () => {
  const url = '/schools'
  const itemId: string | null = null
  const { schoolData, getSchool, loading, schoolResults, updateItem } =
    SchoolStore()
  const { username } = useParams()
  const { setMessage } = MessageStore()
  const [reason, setReason] = useState('')
  const router = useRouter()

  useEffect(() => {
    const existingItem = schoolResults.find((item) => item._id === itemId)
    if (existingItem) {
      SchoolStore.setState({ schoolData: existingItem })
    } else {
      getSchool(`${url}/${username}`)
    }
  }, [])

  const handleSubmit = async (status: boolean) => {
    if (!status && reason.length < 20) {
      setMessage(
        'Please write reason of declining the application, at least 20 characters',
        false
      )
      return
    }
    updateItem(
      `${url}/approve/${schoolData.username}`,
      {
        isApplied: !status,
        isVerified: status,
        content: reason,
        isApproved: status,
        isNew: !status,
      },
      setMessage,
      () => router.replace(`/team/schools/table`)
    )
  }

  return (
    <>
      <div className="card_body sharp mb-2 min-h-[75vh] flex flex-col">
        <div className="w-full text-[var(--text-secondary)] text-xl sm:text-2xl mb-4 flex justify-center text-center ">
          Review School
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mb-4 w-full mx-auto">
          <div className="flex flex-col w-full ">
            <div className="flex flex-col relative mb-4">
              <label className="label flex items-center w-full" htmlFor="">
                Country of School{' '}
              </label>
              <div className="form-input cursor-pointer">
                {schoolData.country}
                <i className="ml-auto bi bi-caret-down-fill"></i>
              </div>
            </div>

            <div className="flex flex-col relative mb-4">
              <label className="label flex items-center w-full" htmlFor="">
                State of School{' '}
              </label>
              <div className="form-input cursor-pointer">
                {schoolData.state}
                <i className="ml-auto bi bi-caret-down-fill"></i>
              </div>
            </div>

            <div className="flex flex-col relative mb-4">
              <label className="label flex items-center w-full" htmlFor="">
                Area of School{' '}
              </label>
              <div className="form-input cursor-pointer">
                {schoolData.area}
                <i className="ml-auto bi bi-caret-down-fill"></i>
              </div>
            </div>

            <div className="mb-4" />
            <div className="flex flex-col relative mb-4">
              <label className="label flex items-center w-full" htmlFor="">
                Academic Levels
              </label>
              <div className="form-input cursor-pointer">
                Select academic levels
                <i className="ml-auto bi bi-caret-down-fill"></i>
              </div>
              {schoolData.levels.length > 0 && (
                <div className="flex items-center mt-1 flex-wrap">
                  {schoolData.levels.map((item, index) => (
                    <div
                      key={index}
                      className="px-2 py-[1px] rounded-[25px] mb-1 mr-2 border text-sm border-[var(--border)]"
                    >
                      {item.levelName}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <div className="flex flex-col mb-4 relative">
              <label className="label" htmlFor="">
                School Name
              </label>
              <input
                className="form-input"
                value={schoolData.name}
                type="text"
                placeholder="Enter username"
              />
            </div>

            <div className="flex flex-col mb-4 relative">
              <label className="label" htmlFor="">
                School Username
              </label>
              <input
                className="form-input"
                value={schoolData.username}
                type="text"
                placeholder="Enter username"
              />
            </div>

            <div className="flex flex-col mb-4 relative">
              <label className="label" htmlFor="">
                Owner Username
              </label>
              <input
                className="form-input"
                value={schoolData.ownerUsername}
                type="text"
                placeholder="Enter username"
              />
            </div>

            <div className="flex flex-col mb-4 relative">
              <label className="label" htmlFor="">
                Document
              </label>
              <a
                href={String(schoolData.document)}
                target="_blank"
                rel="noopener noreferrer"
                className="form-input"
              >
                Open Document
              </a>
            </div>

            <div className="w-full relative mb-4 flex items-center justify-center flex-col">
              <div className="max-h-[150px] relative overflow-hidden max-w-[300px]">
                <PictureDisplay
                  source={String(schoolData.idCard)}
                  displayCover={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card_body sharp mb-2 flex flex-1 flex-col">
        <div className="w-full text-[var(--text-secondary)] text-xl sm:text-2xl mb-4 flex justify-center text-center ">
          School Media Settings
        </div>

        <div className="flex flex-col w-full max-w-[600px] mx-auto">
          <div className="relative w-full sm:h-64 h-[170px] xs:h-[200px] rounded-xl bg-[var(--secondary)] overflow-hidden mb-5 ">
            <PictureDisplay source={String(schoolData.media)} />
          </div>

          <div className="w-full relative mb-5 flex items-center justify-center flex-col">
            <div className="mx-auto mb-2 w-24  max-w-24 min-h-24 overflow-hidden bg-[var(--primary)] rounded-full flex items-center justify-center border border-[var(--border)]">
              <PictureDisplay source={String(schoolData.logo)} />
            </div>
          </div>

          <div className="grid xs-grid-cols-2 gap-3 mb-3">
            <div className="mb-5">
              <div className="form-input mb-5">{schoolData.username}</div>
            </div>
            <div className="mb-5">
              <div className="form-input mb-5">{schoolData.name}</div>
            </div>
          </div>
          <div className="mb-5">
            <div className="form-input mb-5">{schoolData.description}</div>
          </div>
        </div>
      </div>

      <div className="card_body sharp mb-2 min-h-[75vh] flex flex-1 flex-col">
        <div className="w-full text-[var(--text-secondary)] text-xl sm:text-2xl mb-6 flex justify-center text-center ">
          School Academic Settings
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-10 w-full">
          <div
            className={`relative p-3 cursor-pointer hover:border-[var(--custom)] flex rounded-[10px] border border-[var(--border)] flex-col items-start`}
          >
            <div className="text-xl font-semibold uppercase">
              {schoolData.academicSession.name}
            </div>
            <ul className="pl-2 mb-3 text-lg">
              {schoolData.academicSession.divisions.map((part, index) => (
                <li key={index} className="py-1">
                  {index + 1}. {part}
                </li>
              ))}
            </ul>
          </div>
          {schoolData.levels.map((level, int) => (
            <div
              className="rounded-[10px] border border-[var(--border)] p-2"
              key={int}
            >
              <div className="mb-2 text-[var(--text-secondary)] text-lg">
                {level.levelName} Levels
              </div>
              <div className="">
                {Array.from({ length: level.maxLevel }, (_, index) => (
                  <div key={index} className={`mb-2 flex items-center `}>
                    <div className="mr-auto p-1 rounded-[5px]">
                      {level.levelName} {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="w-full uppercase text-[var(--text-secondary)] mb-5 flex justify-center text-center ">
          Score range for each grade.
        </div>
        <div className=" mb-10 grid sm:grid-cols-2 gap-4 items-start w-full">
          {schoolData.grading.map((grade, index) => (
            <div
              key={index}
              className="rounded-[10px] relative border border-[var(--border)] p-2"
            >
              <div className="text-lg text-[var(--text-secondary)] mb-2 text-center">
                Grade {grade.name}
              </div>
              <div className="flex justify-evenly">
                <div className="rel">
                  <div className="">
                    Minimum:{' '}
                    <span className="text-[var(--text-secondary)]">
                      {grade.min}%
                    </span>{' '}
                  </div>
                </div>
                <div className="rel mx-2">
                  <div className="text">
                    Maximum:{' '}
                    <span className="text-[var(--text-secondary)]">
                      {grade.max}%
                    </span>
                  </div>
                </div>
                <div className="rel">
                  <div className="text">
                    Remark:{' '}
                    <span className="text-[var(--text-secondary)]">
                      {grade.remark}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card_body sharp mb-2">
        <div className="mb-4 flex justify-center">
          <textarea
            className="max-w-[300px] w-full p-2 outline-none h-full border-none rounded-[5px] bg-[var(--secondary)] max-h-[200px] overflow-auto"
            placeholder="Enter reasone for decline"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          ></textarea>
        </div>

        <div className="justify-center flex flex-wrap">
          {loading ? (
            <button className="custom_btn neutral">
              <i className="bi bi-opencollective loading"></i>
              Processing...
            </button>
          ) : (
            <>
              <div className="flex mx-auto justify-center items-center">
                <button
                  className={`custom_btn mx-2 success`}
                  onClick={() => handleSubmit(true)}
                >
                  Approve
                </button>
                <button
                  className={`custom_btn mx-2 neutral`}
                  onClick={() => handleSubmit(false)}
                >
                  Decline
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default CreateSchool
