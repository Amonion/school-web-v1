'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { truncateString } from '@/lib/helpers'
import { useParams, usePathname } from 'next/navigation'
import DocumentStore from '@/src/zustand/place/Document'
import { MessageStore } from '@/src/zustand/notification/Message'
import LinkedPagination from '@/components/Team/LinkedPagination'

const Documents: React.FC = () => {
  let itemId: string | null = null
  const url = '/documents'
  const {
    getDocuments,
    massDelete,
    deleteItem,
    documents,
    toggleAllSelected,
    toggleChecked,
    isAllChecked,
    selectedItems,
    loading,
    count,
    toggleActive,
    reshuffleResults,
  } = DocumentStore()
  const [page_size] = useState(5)
  const [sort] = useState('-createdAt')
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
      getDocuments(`${url}${params}`, setMessage)
    } else {
      const params = `?page_size=${page_size}&page=${page}&ordering=${sort}`
      getDocuments(`${url}${params}`, setMessage)
    }
  }, [getDocuments, documents.length, page])

  const deletePlace = async (id: string) => {
    await deleteItem(`${url}/${id}`, setMessage)
  }

  const DeleteItems = async () => {
    if (selectedItems.length === 0) {
      setMessage('Please select at least one document to delete', false)
      return
    }
    await massDelete(`${url}mass-delete/`, url, selectedItems, setMessage)
  }
  return (
    <>
      <div className="card_body">
        <div className="custom_sm_title">Table of Documents</div>
        <div className="overflow-auto mb-5">
          {documents.length > 0 ? (
            <table className="">
              <thead>
                <tr>
                  <th>S/N</th>
                  <th>Picture</th>
                  <th>Name</th>
                  <th>Country</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((item, index) => (
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
                            href={`/team/places/documents/create-document?id=${item._id}&name=${item.name}`}
                          >
                            Edit Doc
                          </Link>
                          <div
                            className="card_list_item"
                            onClick={() => deletePlace(item._id)}
                          >
                            Delete Doc
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
                    <td>{item.name}</td>
                    <td>{item.country}</td>
                    <td>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: truncateString(item.description, 150),
                        }}
                      ></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="relative flex justify-center">
              <div className="not_found_text">No Document Found</div>

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
              {documents.length > 0 && (
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
                href={`/team/places/documents/create-document?pId=${id}&country=${country}`}
                className="custom_btn ml-auto"
              >
                Create Document
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

export default Documents
