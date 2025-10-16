'use client'
import { useState, useEffect } from 'react'
import Pagination from '@/components/Team/Pagination'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { MessageStore } from '@/src/zustand/notification/Message'
import UserExamStore from '@/src/zustand/exam/UserExam'

const ExamTable = () => {
  const { setMessage } = MessageStore()
  const { getExams, count, userExamResults, loading } = UserExamStore()
  const { id } = useParams()
  const [currentPage, setCurrentPage] = useState(1)
  const [page_size] = useState(20)

  useEffect(() => {
    const find = async () => {
      if (id) {
        getExams(
          `/user-competitions/table/?paperId=${id}&page=${currentPage}&page_size=${page_size}&ordering=-metric`,
          setMessage
        )
      }
    }

    find()
  }, [id])

  // useEffect(() => {
  //   window.scrollTo({ top: 0, behavior: "smooth" });
  // }, [currentPage]);

  return (
    <>
      <div className="py-3">
        <div className="mb-3 text-[var(--text-secondary)]">
          Table of Participants
        </div>
        <div className="overflow-auto mb-2">
          {userExamResults.length > 0 ? (
            <table className="sm">
              <thead>
                <tr>
                  <th>S/N</th>
                  <th>Picture</th>
                  <th>User</th>
                  <th>AT</th>
                  <th className="hidden xs:table-cell">AC</th>
                  <th className="hidden xs:table-cell">SP</th>
                  <th>SC</th>
                </tr>
              </thead>
              <tbody>
                {userExamResults.map((item, index) => (
                  <tr
                    key={index}
                    className={`${
                      index % 2 === 1 ? 'bg-[var(--secondary)]' : ''
                    }`}
                  >
                    <td>
                      <div className="flex items-center">
                        {(currentPage - 1) * page_size + index + 1}
                      </div>
                    </td>
                    <td>
                      {item.picture ? (
                        <Image
                          alt={`email of ${item.picture}`}
                          src={String(item.picture)}
                          width={0}
                          sizes="100vw"
                          className="object-cover rounded-full"
                          height={0}
                          style={{
                            minWidth: '50px',
                            width: '50px',
                            height: '50px',
                          }}
                        />
                      ) : (
                        <span>N/A</span>
                      )}
                    </td>
                    <td>{item.username}</td>
                    <td>{item.attempts}</td>
                    <td className="hidden xs:table-cell">
                      {(item.accuracy * 100).toFixed(2)}
                    </td>
                    <td className="hidden xs:table-cell">
                      {item.rate.toFixed(2)}
                    </td>
                    <td>{item.metric.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="relative flex justify-center">
              <div className="not_found_text py-2 bg-[var(--secondary)] text-center">
                No Participant Found
              </div>
              <Image
                className="max-w-[300px]"
                alt={`no record`}
                src="/images/not-found.png"
                width={0}
                sizes="100vw"
                height={0}
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
          )}
        </div>
        <div className="table_nav">
          {loading && (
            <button className="custom_btn ">
              <i className="bi bi-opencollective loading"></i>

              <div>Processing...</div>
            </button>
          )}
        </div>
        <div className="flex items-center">
          <div>Results {count}</div>
          <Pagination
            currentPage={currentPage}
            totalItems={count}
            pageSize={page_size}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </>
  )
}

export default ExamTable
