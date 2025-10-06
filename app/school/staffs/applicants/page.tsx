'use client'
import Image from 'next/image'
import { formatDate, formatTimeTo12Hour } from '@/lib/helpers'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { MessageStore } from '@/src/zustand/notification/Message'
import StaffStore from '@/src/zustand/school/Staff'
import NotFound from '@/components/NotFound'
import PageTitle from '@/components/PageTitle'
import NotificationTemplateStore, {
  NotificationTemplate,
} from '@/src/zustand/notification/NotificationTemplate'
import OfficeStore from '@/src/zustand/utility/Office'

const SchoolStaffs: React.FC = () => {
  const {
    applicants,
    selectedApplicants,
    loadingOffice,
    currentPage,
    page_size,
    toggleCheckedApplicants,
    getApplicants,
    updateStaff,
  } = StaffStore()
  const { officeForm } = OfficeStore()
  const { setMessage } = MessageStore()
  const [displayBox, setDisplayBox] = useState(false)
  const [isNotification, setIsNotification] = useState(false)
  const { formData, results, getItems } = NotificationTemplateStore()

  useEffect(() => {
    if (!officeForm.username) return
    if (applicants.length === 0) {
      getApplicants(
        `/offices/?username=${officeForm.username}&isUserApplied=true&page_size=${page_size}&page=${currentPage}&userType=Staff`,
        setMessage
      )
    }
    getItems(
      `/offices/notification-templates/?officeUsername=${officeForm?.username}&page_size=${page_size}&page=${currentPage}`,
      setMessage
    )
  }, [officeForm])

  const approveVerification = (approval: boolean) => {
    if (!officeForm.username) return
    const data = {
      selectedApplicants,
      notificationId: formData._id,
      status: approval,
      officeId: officeForm.officeId,
      userType: 'Staff',
    }

    updateStaff(
      `/schools/approve-application/${officeForm.username}?page_size=${page_size}&page=${currentPage}&username=${officeForm.username}&userType=Staff`,
      data,
      setMessage,
      () => setDisplayBox(false)
    )
  }

  const setDisplay = () => {
    setDisplayBox((e) => !e)
  }

  const selectNotification = (item: NotificationTemplate) => {
    NotificationTemplateStore.setState({ formData: item })
    setIsNotification(false)
  }
  return (
    <>
      <PageTitle page="Staff Applicants" title="" />

      {applicants.length === 0 ? (
        <NotFound message="There is no current applicants" />
      ) : (
        <>
          <div className="overflow-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-[var(--primary)]">
                  <th className="py-2">S/N</th>
                  <th className="py-2">Photo</th>
                  <th className="py-2">Username</th>
                  <th className="py-2">Name</th>
                  <th className="py-2">Intro</th>
                  <th className="py-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((item, index) => (
                  <tr
                    key={index}
                    className={`${
                      index % 2 === 1 ? 'bg-[var(--primary)]' : ''
                    } text-sm`}
                  >
                    <td className="py-2">
                      <div className="flex items-center">
                        <div
                          className={`checkbox ${
                            item.isChecked ? 'active' : ''
                          }`}
                          onClick={() => toggleCheckedApplicants(index)}
                        >
                          {item.isChecked && (
                            <i className="bi bi-check text-white text-lg"></i>
                          )}
                        </div>
                        {(currentPage - 1) * page_size + index + 1}
                      </div>
                    </td>
                    <td className="py-2">
                      {item.bioUserPicture && (
                        <div className="w-12 relative h-12 rounded-full overflow-hidden">
                          <Image
                            src={item.bioUserPicture}
                            alt="Profile Background"
                            fill
                            className="object-cover"
                            priority
                          />
                        </div>
                      )}
                    </td>
                    <td className="py-2 text-base">
                      <Link href={`/school/staffs/${item.bioUserUsername}`}>
                        {item.bioUserUsername}
                      </Link>
                    </td>
                    <td className="py-2">{item.bioUserDisplayName}</td>
                    <td className="py-2">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: item.bioUserIntro,
                        }}
                      />
                    </td>

                    <td className="py-2">
                      <div className="flex flex-col">
                        <span className="text-sm mb-1">
                          {formatTimeTo12Hour(item.createdAt)}
                        </span>
                        <span className="text-sm">
                          {formatDate(String(item.createdAt))}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-action bg-[var(--primary)] p-3 flex flex-wrap">
            {loadingOffice ? (
              <button className="custom_btn">
                <i className="bi bi-opencollective loading"></i>
                Processing...
              </button>
            ) : (
              <>
                {selectedApplicants.length > 0 && (
                  <button onClick={setDisplay} className="custom_btn">
                    Take Action
                  </button>
                )}
                <Link href="/school/staffs" className="custom_btn ml-auto ">
                  Staffs
                </Link>
              </>
            )}
          </div>
        </>
      )}

      {displayBox && (
        <div
          onClick={() => setDisplayBox(false)}
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
              <div className="flex flex-col relative mb-4">
                <div
                  onClick={() => {
                    setIsNotification(!isNotification)
                  }}
                  className="form-input cursor-pointer min-w-[250px]"
                >
                  {formData?.title ? formData?.title : 'Select Message to Send'}
                  <i className="ml-auto bi bi-caret-down-fill"></i>
                </div>

                {isNotification && results.length > 0 && (
                  <div className="dropdownList top-[50px]">
                    {results.map((item, index) => (
                      <div
                        onClick={() => selectNotification(item)}
                        key={index}
                        className="input_drop_list"
                      >
                        {item.title}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {formData.title && (
                <div className="flex flex-col">
                  <div className="text-start ml-auto mb-5 sm:text-lg">
                    <div className="mb-1">The Management</div>
                    <div className="mb-1">{officeForm?.name}</div>
                    <div className="mb-1">
                      {officeForm?.area}, {officeForm?.state}
                    </div>
                    <div className="mb-1">{formatDate(new Date())}</div>
                  </div>
                  <div className="text-start sm:text-lg mr-auto mb-5">
                    <div className="mb-1">The Receiver Name</div>
                    <div className="mb-1">
                      The Receiver Address, The Receiver Area
                    </div>
                    <div className="mb-1">
                      The Receiver State, The Receiver Country.
                    </div>
                    <div className="mb-1">Dear Receiver,</div>
                  </div>
                </div>
              )}

              {formData.title && (
                <div className="text-center text-lg mb-3 uppercase text-[var(--text-secondary)]">
                  {formData.title}
                </div>
              )}
              {formData.content && (
                <div
                  className="mb-5"
                  dangerouslySetInnerHTML={{ __html: formData.content }}
                ></div>
              )}
              {formData.title && (
                <div className="table-action flex flex-wrap">
                  <button
                    className="custom_btn mr-3 success"
                    onClick={() => approveVerification(true)}
                  >
                    Approve
                  </button>
                  <button
                    className="custom_btn mr-auto danger"
                    onClick={() => approveVerification(false)}
                  >
                    Decline
                  </button>

                  <button
                    className="custom_btn"
                    onClick={() => setDisplayBox((e) => !e)}
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default SchoolStaffs
