'use client'
import Link from 'next/link'
import Image from 'next/image'
import PaymentStore from '@/src/zustand/team/Payment'
import { useState, useEffect, useRef } from 'react'
import { MessageStore } from '@/src/zustand/msgStore'
import { usePathname } from 'next/navigation'
import Pagination from '@/components/Team/Pagination'

const Places: React.FC = () => {
  let itemId: string | null = null
  const url = '/places/payments'
  const {
    getPayments,
    massDelete,
    deleteItem,
    results,
    toggleAllSelected,
    toggleChecked,
    isAllChecked,
    selectedItems,
    loading,
    count,
    toggleActive,
    reshuffleResults,
  } = PaymentStore()
  const [currentPage, setCurrentPage] = useState(1)
  const [page_size] = useState(20)
  const [sort] = useState('-createdAt')
  const [country, setCountry] = useState<string | null>('')
  const [id, setId] = useState<string | null>('')
  const prevPage = useRef(currentPage)
  const { setMessage } = MessageStore()
  const pathname = usePathname()

  useEffect(() => {
    reshuffleResults()
  }, [pathname])

  useEffect(() => {
    const query = window.location.search
    itemId = new URLSearchParams(query).get('id')
    const el = String(new URLSearchParams(query).get('country'))
    setId(itemId)
    setCountry(el)
    if (itemId !== null || itemId !== '') {
      const school = `&country=${el}`
      const params = `?page_size=${page_size}&page=${currentPage}&ordering=${sort}${school}`
      getPayments(`${url}${params}`)
    } else {
      const params = `?page_size=${page_size}&page=${currentPage}&ordering=${sort}`
      getPayments(`${url}${params}`)
    }
    prevPage.current = currentPage
  }, [getPayments, results.length, currentPage])

  const deletePlace = async (id: string) => {
    await deleteItem(`${url}${id}/`, setMessage)
  }

  const DeleteItems = async () => {
    if (selectedItems.length === 0) {
      setMessage('Please select at least one email to delete', false)
      return
    }
    await massDelete(`${url}mass-delete/`, selectedItems, setMessage)
  }
  return (
    <>
      <div className="card_body">
        <div className="custom_sm_title">Table of Payments in {country}</div>
        <div className="overflow-auto mb-5">
          {results.length > 0 ? (
            <table className="">
              <thead>
                <tr>
                  <th>S/N</th>
                  <th>Logo</th>
                  <th>Payment</th>
                  <th>Amount</th>
                  <th>Charge</th>
                  <th>Country</th>
                </tr>
              </thead>
              <tbody>
                {results.map((item, index) => (
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
                            href={`/team/places/payments/create-payment?id=${item._id}&name=${item.name}`}
                          >
                            Edit Payment
                          </Link>
                          <div
                            className="card_list_item"
                            onClick={() => deletePlace(item._id)}
                          >
                            Delete Payment
                          </div>
                        </div>
                      )}
                    </td>
                    <td>
                      {item.logo ? (
                        <Image
                          alt={`email of ${item.logo}`}
                          src={String(item.logo)}
                          width={0}
                          sizes="100vw"
                          height={0}
                          style={{ width: '50px', height: 'auto' }}
                        />
                      ) : (
                        <span>N/A</span>
                      )}
                    </td>
                    <td>{item.name}</td>
                    <td>{item.amount}</td>
                    <td>{item.charge}</td>
                    <td>{item.country}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="relative flex justify-center">
              <div className="not_found_text">No Payment Found</div>

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
              {results.length > 0 && (
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
                  <button className="custom_btn line" onClick={DeleteItems}>
                    <i className="bi bi-trash text-lg mr-2"></i>
                    Delete
                  </button>
                </>
              )}

              <Link
                href={`/team/places/payments/create-payment/?pId=${id}&country=${country}`}
                className="custom_btn ml-auto"
              >
                Create Payment
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
