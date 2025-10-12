'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Pagination from '@/components/Team/Pagination'
import AreaStore from '@/src/zustand/place/AreaOrigin'
import { MessageStore } from '@/src/zustand/notification/Message'
import { AuthStore } from '@/src/zustand/user/AuthStore'

const States: React.FC = () => {
  const url = '/places/area'
  const {
    getArea,
    area,
    isAllAreaChecked,
    toggleActiveArea,
    toggleAllSelectedArea,
    toggleCheckedArea,
    selectedArea,
    massDeleteCountries,
    loadingArea,
    reshuffleResults,
    deleteItem,
    count,
  } = AreaStore()

  const { user } = AuthStore.getState()
  const [currentPage, setCurrentPage] = useState(1)
  const [page_size] = useState(20)
  const [sort] = useState('area')
  const prevPage = useRef(currentPage)
  const { setMessage } = MessageStore()
  const pathname = usePathname()

  useEffect(() => {
    reshuffleResults()
  }, [pathname])

  useEffect(() => {
    reshuffleResults()
    const query = window.location.search
    const el = String(new URLSearchParams(query).get('state'))

    const params = `?state=${el}&page_size=${page_size}&page=${currentPage}&sort=${sort}&field=area`
    getArea(`${url}${params}`)
    prevPage.current = currentPage
  }, [getArea, area.length, currentPage])

  const deletePlace = async (id: string, index: number) => {
    toggleActiveArea(index)
    const params = `?page_size=${page_size}&page=${currentPage}&ordering=${sort}`
    await deleteItem(`/places/${id}/${params}`, setMessage)
  }

  const DeleteItems = async () => {
    if (selectedArea.length === 0) {
      setMessage('Please select at least one email to delete', false)
      return
    }
    await massDeleteCountries(`${url}mass-delete/`, selectedArea, setMessage)
  }
  return (
    <>
      <div className="card_body">
        <div className="custom_sm_title">Table of Areas</div>
        <div className="overflow-auto mb-5">
          {area.length > 0 ? (
            <table className="">
              <thead>
                <tr>
                  <th>S/N</th>
                  <th>Picture</th>
                  <th>Area</th>
                  <th>Zip Cod</th>
                  <th>State</th>
                </tr>
              </thead>
              <tbody>
                {area.map((item, index) => (
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
                          onClick={() => toggleCheckedArea(index)}
                        >
                          {item.isChecked && (
                            <i className="bi bi-check text-white text-lg"></i>
                          )}
                        </div>
                        {(currentPage - 1) * page_size + index + 1}
                        <i
                          onClick={() => toggleActiveArea(index)}
                          className="bi bi-three-dots-vertical text-lg cursor-pointer"
                        ></i>
                      </div>
                      {item.isActive && (
                        <div className="card_list">
                          <span
                            onClick={() => toggleActiveArea(index)}
                            className="more_close "
                          >
                            X
                          </span>
                          <Link
                            className="card_list_item"
                            href={`/team/places/area/create-area?id=${item.id}&name=${item.country}`}
                          >
                            Edit Area
                          </Link>

                          <div
                            className="card_list_item"
                            onClick={() => deletePlace(item.id, index)}
                          >
                            Delete Place
                          </div>
                        </div>
                      )}
                    </td>
                    <td>
                      {item.stateLogo ? (
                        <Image
                          alt={`email of ${item.stateLogo}`}
                          src={String(item.stateLogo)}
                          width={0}
                          sizes="100vw"
                          height={0}
                          style={{ width: '50px', height: 'auto' }}
                        />
                      ) : (
                        <span>N/A</span>
                      )}
                    </td>

                    <td>{item.area}</td>
                    <td>{item.zipCode}</td>
                    <td>{item.state}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="relative flex justify-center">
              <div className="not_found_text">No Place Found</div>
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
          {loadingArea ? (
            <button className="custom_btn ">
              <i className="bi bi-opencollective loading"></i>

              <div>Processing...</div>
            </button>
          ) : (
            <>
              {area.length > 0 && (
                <>
                  <button
                    className="custom_btn line"
                    onClick={toggleAllSelectedArea}
                  >
                    <div
                      className={`checkbox ${isAllAreaChecked ? 'active' : ''}`}
                    >
                      {isAllAreaChecked && (
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

export default States
