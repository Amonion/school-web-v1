'use client'
import PageTitle from '@/components/PageTitle'
import { MessageStore } from '@/src/zustand/notification/Message'
import CourseStore from '@/src/zustand/school/Courses'
import OfficeStore from '@/src/zustand/utility/Office'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import PictureDisplay from '@/components/Home/Media/PictureDisplay'

export default function Subjects() {
  const { setMessage } = MessageStore()
  const { officeForm } = OfficeStore()
  const { subject, getSubject } = CourseStore()
  const { id } = useParams()
  const url = '/courses/subjects'

  useEffect(() => {
    if (id) {
      getSubject(`${url}/${id}`, setMessage)
    }
  }, [id])

  return (
    <>
      <PageTitle page="Subject:" title={officeForm.name} />

      <div className="card_body sharp">
        <div className="flex uppercase text-lg text-[var(--text-secondary)] mb-5">
          <div className="mr-3">
            {subject.levelName} {subject.level}:
          </div>
          <div className="">{subject.name}</div>
        </div>
        {subject.picture && (
          <div className="relative w-full mb-3 max-w-[500px] h-auto rounded-xl bg-[var(--secondary)] overflow-hidden ">
            <PictureDisplay source={String(subject.picture)} />
          </div>
        )}
        <div
          className=""
          dangerouslySetInnerHTML={{
            __html: subject.description,
          }}
        />
      </div>
    </>
  )
}
