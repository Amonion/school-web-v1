'use client'
import Link from 'next/link'
import Image from 'next/image'
import AdStore from '@/src/zustand/team/Ad'
import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { MessageStore } from '@/src/zustand/msgStore'
import { useAuthStore } from '@/src/zustand/authStore'
import LinkedPagination from '@/components/Common/LinkedPagination'

const Places: React.FC = () => {
  let itemId: string | null = null
  const url = '/places/ads'
  const {
    getAds,
    massDelete,
    deleteItem,
    itemResults,
    toggleAllSelected,
    toggleChecked,
    setLoading,
    isAllChecked,
    selectedItems,
    loadingAds,
    count,
    toggleActive,
    reshuffleResults,
  } = AdStore()
  const { user } = useAuthStore.getState()
  const [currentPage] = useState(1)
  const [page_size] = useState(20)
  const [sort] = useState('-createdAt')
  const [country, setCountry] = useState<string | null>('')
  const [id, setId] = useState<string | null>('')
  const prevPage = useRef(currentPage)
  const { setMessage } = MessageStore()
  const pathname = usePathname()
  const router = useRouter()

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
      getAds(`${url}${params}`)
    } else {
      router.back()
      const params = `?page_size=${page_size}&page=${currentPage}&ordering=${sort}`
      getAds(`${url}${params}`)
    }
    prevPage.current = currentPage
  }, [itemResults.length, currentPage])

  const deletePlace = async (id: string, index: number) => {
    toggleActive(index)
    const params = `?page_size=${page_size}&page=${currentPage}&ordering=${sort}`
    await deleteItem(`${url}${id}/${params}`, setMessage, setLoading)
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
        <div className="custom_sm_title">Table of Ads</div>
        <div className="overflow-auto mb-5">
          {itemResults.length > 0 ? (
            <table className="">
              <thead>
                <tr>
                  <th>S/N</th>
                  <th>Picture</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Country</th>
                </tr>
              </thead>
              <tbody>
                {itemResults.map((item, index) => (
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
                            href={`/team/places/adds/create-ad?id=${item._id}&pId=${id}&country=${country}`}
                          >
                            Edit Ad
                          </Link>
                          <div
                            className="card_list_item"
                            onClick={() => deletePlace(item._id, index)}
                          >
                            Delete Ad
                          </div>
                        </div>
                      )}
                    </td>
                    <td>
                      {item.picture ? (
                        <Image
                          alt={`email of ${item.picture}`}
                          src={String(item.picture)}
                          width={0}
                          sizes="100vw"
                          height={0}
                          style={{ width: '50px', height: 'auto' }}
                        />
                      ) : (
                        <span>N/A</span>
                      )}
                    </td>
                    <td>{item.category}</td>
                    <td>{item.amount}</td>
                    <td>{item.country}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="relative flex justify-center">
              <div className="not_found_text">No Ads Found</div>
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
          {loadingAds ? (
            <button className="custom_btn ">
              <i className="bi bi-opencollective loading"></i>

              <div>Processing...</div>
            </button>
          ) : (
            <>
              {itemResults.length > 0 && (
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

                  {user?.level !== null &&
                    user?.level !== undefined &&
                    user.level > 15 && (
                      <button className="custom_btn line" onClick={DeleteItems}>
                        <i className="bi bi-trash text-lg mr-2"></i>
                        Delete
                      </button>
                    )}
                </>
              )}

              <Link
                href={`/team/places/adds/create-ad/?pId=${id}&country=${country}`}
                className="custom_btn ml-auto"
              >
                Create Ad
              </Link>
            </>
          )}
        </div>

        <LinkedPagination url="/team/places" count={count} page_size={20} />
      </div>
    </>
  )
}

export default Places
