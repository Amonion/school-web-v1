'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation'
import AcademicStore from '@/src/zustand/school/Academic'
import { MessageStore } from '@/src/zustand/notification/Message'
import LinkedPagination from '@/components/Team/LinkedPagination'

const Places: React.FC = () => {
  let itemId: string | null = null
  const url = '/academic-levels'
  const {
    getAcademics,
    massDelete,
    deleteItem,
    academicResults,
    toggleAllSelected,
    toggleChecked,
    isAllChecked,
    selectedItems,
    loading,
    count,
    toggleActive,
    reshuffleResults,
  } = AcademicStore()
  const [page_size] = useState(20)
  const [sort] = useState('level')
  const { setMessage } = MessageStore()
  const pathname = usePathname()
  const [country, setCountry] = useState<string | null>('')
  const [id, setId] = useState<string | null>('')
  const [query, setQuery] = useState('')
  const { page } = useParams()

  useEffect(() => {
    reshuffleResults()
  }, [pathname])

  useEffect(() => {
    const query = window.location.search
    itemId = new URLSearchParams(query).get('id')
    const el = String(new URLSearchParams(query).get('country'))
    setId(itemId)
    setCountry(el)
    setQuery(`id=${itemId}&country=${el}`)
    if (itemId !== null || itemId !== '') {
      const school = `&country=${el}`
      const params = `?page_size=${page_size}&page=${page}&ordering=${sort}${school}`
      getAcademics(`${url}${params}`, setMessage)
    } else {
      const params = `?page_size=${page_size}&page=${page}&ordering=${sort}`
      getAcademics(`${url}${params}`, setMessage)
    }
  }, [getAcademics, academicResults.length, page])

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
        <div className="custom_sm_title">Table of Academic Levels</div>
        <div className="overflow-auto mb-5">
          {academicResults.length > 0 ? (
            <table className="">
              <thead>
                <tr>
                  <th>S/N</th>
                  <th>Level Name</th>
                  <th>Certificate</th>
                  <th>Max Level</th>
                  <th>Level</th>
                </tr>
              </thead>
              <tbody>
                {academicResults.map((item, index) => (
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
                        {(Number(page) - 1) * page_size + index + 1}
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
                            href={`/team/places/academic-levels/create-level?id=${item._id}&name=${item.levelName}&pId=${id}&country=${country}`}
                          >
                            Edit Level
                          </Link>
                          <div
                            className="card_list_item"
                            onClick={() => deletePlace(item._id)}
                          >
                            Delete Level
                          </div>
                        </div>
                      )}
                    </td>

                    <td>{item.levelName}</td>
                    <td>{item.certificateName}</td>
                    <td>{item.maxLevel}</td>
                    <td>{item.level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="relative flex justify-center">
              <div className="not_found_text">No Academic Level Found</div>

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
              {academicResults.length > 0 && (
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
                href={`/team/places/academic-levels/create-level?pId=${id}&country=${country}`}
                className="custom_btn ml-auto"
              >
                Create Level
              </Link>
            </>
          )}
        </div>

        <LinkedPagination
          url={`/team/places/states`}
          count={count}
          page_size={20}
          query={query}
        />
      </div>
    </>
  )
}

export default Places
