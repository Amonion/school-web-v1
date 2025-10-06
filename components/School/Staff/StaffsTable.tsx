'use client'
import Image from 'next/image'
import { formatDate } from '@/lib/helpers'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { MessageStore } from '@/src/zustand/notification/Message'
import StaffStore from '@/src/zustand/school/Staff'
import NotFound from '@/components/NotFound'
import PageTitle from '@/components/PageTitle'
import OfficeStore from '@/src/zustand/utility/Office'
import { BookOpenText, Send, Trash2, UserPlus } from 'lucide-react'
import SendMessage from '@/components/School/SendMessageBox'
import NotificationTemplateStore from '@/src/zustand/notification/NotificationTemplate'
import SchoolPositions from '@/components/School/Staff/SchoolPositions'
import SchoolStore from '@/src/zustand/school/School'
import CourseStore from '@/src/zustand/school/Courses'
import SubjectsOverlay from './SubjectsOverlay'

const StaffsTable: React.FC = () => {
  const {
    staffs,
    applicantPage,
    currentPage,
    page_size,
    loadingOffice,
    selectedItems,
    toggleChecked,
    updateStaff,
    getStaffs,
  } = StaffStore()
  const { setMessage } = MessageStore()
  const { officeForm } = OfficeStore()
  const [displayBox, setDisplayBox] = useState(false)
  const [displayPositions, setDisplayPositions] = useState(false)
  const { formData } = NotificationTemplateStore()
  const { staffPositions } = SchoolStore()
  const { displaySubjects, setDisplaySubjects } = CourseStore()

  useEffect(() => {
    if (!officeForm.username) return
    getStaffs(
      `/schools/staffs/?page_size=${page_size}&isUserActive=true&page=${currentPage}&username=${officeForm.username}&userType=Staff`,
      setMessage
    )
  }, [officeForm])

  const handleSendMessage = () => {
    if (selectedItems.length === 0) {
      setMessage('Please select at least one staff to send message', false)
      setDisplayBox(false)
      return
    }
    const form = {
      selectedStaffs: selectedItems,
      message: formData,
      officeUsername: officeForm.username,
    }
    updateStaff(`/messages/send`, form, setMessage, () => setDisplayBox(false))
  }

  const handleSetPositions = () => {
    if (selectedItems.length === 0) {
      setMessage('Please select at least one staff to assign role to', false)
      setDisplayPositions(false)
      return
    }
    if (staffPositions.length === 0) {
      setMessage('Please select at least one role to assign', false)
      setDisplayPositions(false)
      return
    }

    const form = {
      selectedStaffs: selectedItems,
      staffPositions: staffPositions,
      staffType: 'Staff',
    }

    updateStaff(
      `/offices/?page_size=${page_size}&isUserActive=true&page=${currentPage}&username=${officeForm.username}&userType=Staff`,
      form,
      setMessage,
      () => setDisplayPositions(false)
    )
  }

  return (
    <>
      <PageTitle page="Staffs:" title={officeForm.name} />

      {staffs.length === 0 ? (
        <NotFound message="No staffs found" />
      ) : (
        <>
          <div className="overflow-auto mb-3">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-[var(--primary)]">
                  <th className="py-2">S/N</th>
                  <th className="py-2">Photo</th>
                  <th className="py-2">Username</th>
                  <th className="py-2">Name</th>
                  <th className="py-2">Rank</th>
                  <th className="py-2">Joined</th>
                </tr>
              </thead>
              <tbody>
                {staffs.map((item, index) => (
                  <tr
                    key={index}
                    className={`${
                      index % 2 === 1 ? 'bg-[var(--primary)]' : ''
                    }`}
                  >
                    <td className="py-2">
                      <div className="flex items-center">
                        <div
                          className={`checkbox ${
                            item.isChecked ? 'active' : ''
                          }`}
                          onClick={() => toggleChecked(index)}
                        >
                          {item.isChecked && (
                            <i className="bi bi-check text-white text-lg"></i>
                          )}
                        </div>
                        {(applicantPage - 1) * page_size + index + 1}
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
                      <Link
                        href={`/school/staffs/staff/${item.bioUserUsername}`}
                      >
                        {item.bioUserUsername}
                      </Link>
                    </td>
                    <td className="py-2">{item.bioUserDisplayName}</td>
                    <td className="py-2">{item.level}</td>

                    <td className="py-2">
                      <div className="flex flex-col">
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
                <button
                  onClick={() => setDisplayBox(true)}
                  className="flex items-center mr-5"
                >
                  <Send className="h-5 w-5 text-[var(--custom)] mr-1" /> Send
                  Message
                </button>
                <button
                  onClick={() => setDisplayPositions(true)}
                  className="flex items-center mr-5"
                >
                  <UserPlus className="h-5 w-5 text-[var(--custom)] mr-1" />
                  Assign Role
                </button>
                <button
                  onClick={() => setDisplaySubjects(true)}
                  className="flex items-center mr-5"
                >
                  <BookOpenText className="h-5 w-5 text-[var(--custom)] mr-1" />
                  Assign Subjects
                </button>
                <button className="flex items-center mr-5">
                  <Trash2 className="h-5 w-5 text-[var(--custom)] mr-1" />
                  Delete
                </button>
              </>
            )}
          </div>

          {displayBox && (
            <SendMessage
              setDisplayBox={setDisplayBox}
              handleSubmit={handleSendMessage}
              action="Send Message"
            />
          )}

          {displaySubjects && <SubjectsOverlay />}

          {displayPositions && (
            <SchoolPositions
              setDisplayBox={setDisplayPositions}
              handleSubmit={handleSetPositions}
            />
          )}
        </>
      )}
    </>
  )
}

export default StaffsTable
