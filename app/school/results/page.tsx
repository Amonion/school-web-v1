'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SchoolStore from '@/src/zustand/school/School'
import { AuthStore } from '@/src/zustand/user/AuthStore'

const CreateSchool: React.FC = () => {
  const url = '/schools/'
  const { schoolData, getSchool } = SchoolStore()
  const { bioUserState } = AuthStore()

  const router = useRouter()

  useEffect(() => {
    if (bioUserState.activeOffice !== null) {
      if (schoolData.username !== bioUserState.activeOffice.username) {
        getSchool(`${url}${bioUserState.activeOffice.username}`)
      }
    } else {
      router.push('/utils')
    }
  }, [])

  return (
    <>
      <div className="card_body sharp mb-auto min-h-[75vh] flex flex-1 flex-col">
        <div className="w-full text-[var(--text-secondary)] text-xl sm:text-2xl mb-4 flex justify-center text-center ">
          {schoolData.name} Results
        </div>

        <table className="min-w-[600px] w-full text-sm">
          <thead>
            <tr className="">
              <th className="py-2 text-left">S/N</th>
              <th className="py-2 text-right">Teachers</th>
              <th className="py-2 text-right">Subject</th>
              <th className="py-2 text-right">Students</th>
              <th className="py-2 text-right">Time</th>
            </tr>
          </thead>
          <tbody>
            {/* {topPosts.map((item, index) => (
                      <tr
                        key={index}
                        className={`${index % 2 === 1 ? 'bg-[var(--secondary)]' : ''}`}
                      >
                        <td className="py-2 line-clamp-1">
                          <div
                            className="line-clamp-1 overflow-ellipsis"
                            dangerouslySetInnerHTML={{
                              __html: item.content,
                            }}
                          />
                        </td>
                        <td className="py-2 text-right">{formatCount(item.views)}</td>
                        <td className="py-2 text-right">{formatCount(item.likes)}</td>
                        <td className="py-2 text-right">
                          {formatCount(item.bookmarks)}
                        </td>
                        <td className="py-2 text-right">{formatCount(item.replies)}</td>
                        <td className="py-2 text-right">{formatCount(item.shares)}</td>

                        <td className="py-2 text-right">
                          <span className="text-sm">
                            {formatDateToDDMMYY(String(item.createdAt))}
                          </span>
                        </td>
                      </tr>
                    ))} */}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default CreateSchool
