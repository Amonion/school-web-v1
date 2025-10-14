'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Pagination from '@/components/Team/Pagination'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { MessageStore } from '@/src/zustand/notification/Message'
import { PolicyStore } from '@/src/zustand/app/Policy'

const Places: React.FC = () => {
  const url = '/company/policy'
  const {
    getPolicies,
    massDeletePolices,
    deletePolicy,
    policies,
    toggleAllSelected,
    toggleChecked,
    isAllChecked,
    selectedPolicies,
    loading,
    count,
    toggleActive,
    reshuffleResults,
  } = PolicyStore()
  const { user } = AuthStore.getState()
  const [currentPage, setCurrentPage] = useState(1)
  const [page_size] = useState(20)
  const [sort] = useState('-createdAt')
  const prevPage = useRef(currentPage)
  const { setMessage } = MessageStore()
  const pathname = usePathname()

  useEffect(() => {
    reshuffleResults()
  }, [pathname])

  useEffect(() => {
    reshuffleResults()

    if (policies.length === 0 || currentPage !== prevPage.current) {
      const params = `?page_size=${page_size}&page=${currentPage}&ordering=${sort}`
      getPolicies(`${url}${params}`, setMessage)
    }
    prevPage.current = currentPage
  }, [policies.length, currentPage])

  const handleDeletePolicy = async (id: string, index: number) => {
    toggleActive(index)
    const params = `?page_size=${page_size}&page=${currentPage}&ordering=${sort}`
    await deletePolicy(`${url}${id}/${params}`, setMessage)
  }

  const DeleteItems = async () => {
    if (selectedPolicies.length === 0) {
      setMessage('Please select at least one email to delete', false)
      return
    }
    await massDeletePolices(`${url}mass-delete/`, selectedPolicies, setMessage)
  }

  return (
    <>
      <div className="card_body sharp">
        <div className="custom_sm_title">Table of Policies</div>
        <div className="overflow-auto mb-5">
          {policies.length > 0 ? (
            <table className="">
              <thead>
                <tr>
                  <th>S/N</th>
                  <th>Name</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Content</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((item, index) => (
                  <tr
                    key={index}
                    className={`${
                      index % 2 === 1 ? 'bg-[var(--white-gray)]' : ''
                    }`}
                  >
                    <td>
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
                        {(currentPage - 1) * page_size + index + 1}
                        <i
                          onClick={() => toggleActive(index)}
                          className="bi bi-three-dots-vertical text-lg cursor-pointer"
                        ></i>
                      </div>
                      {item.isActive && (
                        <div className="card_list">
                          <span
                            onClick={() => toggleActive(index)}
                            className="more_close "
                          >
                            X
                          </span>
                          <Link
                            className="card_list_item"
                            href={`/team/policy/create-policy?id=${item._id}`}
                          >
                            Edit Policy
                          </Link>

                          <div
                            className="card_list_item"
                            onClick={() => handleDeletePolicy(item._id, index)}
                          >
                            Delete Policy
                          </div>
                        </div>
                      )}
                    </td>

                    <td>{item.name}</td>
                    <td>{item.title}</td>
                    <td>{item.category}</td>
                    <td>
                      <div
                        className="line-clamp-2 overflow-ellipsis"
                        dangerouslySetInnerHTML={{
                          __html: item.content,
                        }}
                      ></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="relative flex justify-center">
              <div className="not_found_text">No Policies Found</div>
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
        <div className="table_action">
          {loading ? (
            <button className="custom_btn ">
              <i className="bi bi-opencollective loading"></i>

              <div>Processing...</div>
            </button>
          ) : (
            <>
              {policies.length > 0 && (
                <>
                  <button
                    className="custom_btn line"
                    onClick={toggleAllSelected}
                  >
                    <div className={`checkbox ${isAllChecked ? 'active' : ''}`}>
                      {isAllChecked && (
                        <i className="bi bi-check text-white text-lg"></i>
                      )}
                    </div>
                    Select All
                  </button>

                  {user?.staffRanking !== null &&
                    user?.staffRanking !== undefined &&
                    user.staffRanking > 15 && (
                      <button className="custom_btn line" onClick={DeleteItems}>
                        <i className="bi bi-trash text-lg mr-2"></i>
                        Delete
                      </button>
                    )}
                </>
              )}

              <Link
                href="/team/policy/create-policy"
                className="custom_btn ml-auto"
              >
                Create Policy
              </Link>
            </>
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

export default Places
