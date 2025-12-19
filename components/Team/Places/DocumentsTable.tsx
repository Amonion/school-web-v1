'use client'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation'
import React from 'react'
import { MessageStore } from '@/src/zustand/notification/Message'
import LinkedPagination from '../LinkedPagination'
import DocumentStore, {
  DocumentEmpty,
  IDocument,
} from '@/src/zustand/place/Document'
import CreateDocument from './CreateDocument'

const DocumentsTable: React.FC = () => {
  const url = '/documents'
  const {
    isAllChecked,
    selectedItems,
    count,
    documents,
    isForm,
    showForm,
    resetForm,
    getDocuments,
    massDelete,
    toggleAllSelected,
    toggleChecked,
    reshuffleResults,
  } = DocumentStore()
  const { page, country } = useParams()
  const [page_size] = useState(20)
  const [sort] = useState('name')
  const { setMessage } = MessageStore()
  const pathname = usePathname()
  const params = `?country=${country}&page_size=${page_size}&page=${
    page ? page : 1
  }&ordering=${sort}`

  useEffect(() => {
    reshuffleResults()
  }, [pathname])

  useEffect(() => {
    getDocuments(`${url}${params}`, setMessage)
  }, [page])

  const selectState = (doc: IDocument) => {
    resetForm(doc)
    showForm(true)
  }

  const DeleteItems = async () => {
    if (selectedItems.length === 0) {
      setMessage('Please select at least one document to delete', false)
      return
    }
    const ids = selectedItems.map((item) => item._id)
    await massDelete(`${url}mass-delete/`, { ids }, setMessage)
  }

  // const cleanPlaces = ()=>{
  //   updateItem(`/places/clean`, {}, setMessage)
  // }
  return (
    <>
      {documents.length > 0 ? (
        <table>
          <thead className="bg-[var(--primary)]">
            <tr>
              <th>
                <div className="flex items-center">
                  <div
                    onClick={toggleAllSelected}
                    className={`checkbox ${isAllChecked ? 'active' : ''}`}
                  >
                    {isAllChecked && (
                      <i className="bi bi-check text-white text-lg"></i>
                    )}
                  </div>
                  S/N
                </div>
              </th>
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
                className={`${index % 2 === 1 ? 'bg-[var(--primary)]' : ''}`}
              >
                <td>
                  <div className="flex items-center">
                    <div
                      className={`checkbox ${item.isChecked ? 'active' : ''}`}
                      onClick={() => toggleChecked(index)}
                    >
                      {item.isChecked && (
                        <i className="bi bi-check text-white text-lg"></i>
                      )}
                    </div>
                    {(page ? Number(page) - 1 : 0) * page_size + index + 1}
                  </div>
                </td>
                <td>
                  {item.picture ? (
                    <Image
                      alt={`email of ${item.picture}`}
                      src={String(item.picture)}
                      width={0}
                      sizes="100vw"
                      height={0}
                      style={{
                        width: '60px',
                        height: '30px',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <span>N/A</span>
                  )}
                </td>
                <td>
                  <div
                    onClick={() => selectState(item)}
                    className="cursor-pointer"
                  >
                    {item.name}
                  </div>
                </td>
                <td>{item.country}</td>
                <td>{item.description}</td>
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

      <div className="card_body sharp my-3">
        <div className="flex flex-wrap items-center">
          <div className="flex mr-auto gap-2 items-center">
            <div onClick={toggleAllSelected} className="tableActions">
              <i
                className={`bi bi-check2-all ${
                  isAllChecked ? 'text-[var(--custom)]' : ''
                }`}
              ></i>
            </div>

            <div onClick={DeleteItems} className="tableActions">
              <i className="bi bi-trash"></i>
            </div>

            <div
              onClick={() => selectState(DocumentEmpty)}
              className="tableActions"
            >
              <i className="bi bi-plus-circle"></i>
            </div>
          </div>
        </div>
      </div>

      {isForm && <CreateDocument />}

      <div className="card_body sharp">
        <LinkedPagination
          url={`/team/places/documents/${country}`}
          count={count}
          page_size={20}
        />
      </div>
    </>
  )
}

export default DocumentsTable
