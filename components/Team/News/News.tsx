'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation'
import {
  formatCount,
  formatDateToDDMMYY,
  formatTimeTo12Hour,
  truncateString,
} from '@/lib/helpers'
import { MessageStore } from '@/src/zustand/notification/Message'
import NewsStore from '@/src/zustand/news/News'
import LinkedPagination from '@/components/Team/LinkedPagination'

const News: React.FC = () => {
  const url = '/news'
  const {
    getItems,
    massDelete,
    deleteItem,
    updateNews,
    results,
    toggleAllSelected,
    toggleChecked,
    setLoading,
    isAllChecked,
    selectedItems,
    loading,
    count,
    toggleActive,
    reshuffleResults,
  } = NewsStore()
  const [page_size] = useState(20)
  const [sort] = useState('-createdAt')
  const { setMessage } = MessageStore()
  const pathname = usePathname()
  const { page } = useParams()

  useEffect(() => {
    reshuffleResults()
  }, [pathname])

  useEffect(() => {
    const params = `?page_size=${page_size}&page=${
      page ? page : 1
    }&ordering=${sort}`
    getItems(`${url}${params}`, setMessage)
  }, [page])

  const deletePlace = async (id: string, index: number) => {
    toggleActive(index)
    const params = `?page_size=${page_size}&page=${
      page ? page : 1
    }&ordering=${sort}`
    await deleteItem(`${url}${id}/${params}`, setMessage, setLoading)
  }

  const DeleteItems = async () => {
    if (selectedItems.length === 0) {
      setMessage('Please select at least one email to delete', false)
      return
    }
    await massDelete(`${url}mass-delete/`, selectedItems, setMessage)
  }

  const setNews = async (status: string, id: string) => {
    if (status === 'Expired') {
      return
    }
    const params = `?page_size=${page_size}&page=${
      page ? page : 1
    }&ordering=${sort}`
    const form = new FormData()
    form.append('status', status === 'Draft' ? 'Published' : 'Draft')
    if (status === 'Published') {
      const date = new Date()
      form.append('publishedAt', date.toISOString())
    }
    updateNews(`${url}${id}${params}`, form, setMessage)
  }

  return (
    <>
      <div className="card_body sharp mb-5">
        <div className="text-lg text-[var(--text-secondary)]">
          Table of News
        </div>
      </div>
      {results.map((item, index) => (
        <div key={index} className="card_body sharp mb-3">
          <div className="">
            <div className="flex relative items-start mb-5">
              <div className="flex items-center mr-3">
                <div
                  className={`checkbox ${item.isChecked ? 'active' : ''}`}
                  onClick={() => toggleChecked(index)}
                >
                  {item.isChecked && (
                    <i className="bi bi-check text-white text-lg"></i>
                  )}
                </div>
                {(page ? Number(page) : 1 - 1) * page_size + index + 1}
              </div>
              <div className="relative w-[80px] h-[50px] overflow-hidden rounded-[5px] mr-3">
                {item.picture ? (
                  <Image
                    alt={`email of ${item.picture}`}
                    src={String(item.picture)}
                    width={0}
                    sizes="100vw"
                    height={0}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <span>N/A</span>
                )}
              </div>
              <div className="t">
                <div className="text-lg mb-2">{item.title}</div>
                <div className="flex items-end">
                  <div className="text-sm mr-5">
                    {truncateString(item.subtitle, 30)}
                  </div>
                  <div
                    onClick={() => setNews(item.status, item._id)}
                    className={`${
                      item.status === 'Draft'
                        ? 'text-[var(--custom)]  border-[var(--custom)]'
                        : item.status === 'Published'
                        ? 'bg-[var(--success)] border-[var(--success)] text-white'
                        : ''
                    } rounded-[3px] border text-sm  py-[2px] px-3 cursor-pointer`}
                  >
                    {item.status}
                  </div>
                </div>
              </div>
              <div className="absolute top-[-10px] right-2">
                <i
                  onClick={() => toggleActive(index)}
                  className="bi bi-three-dots-vertical text-lg cursor-pointer"
                ></i>
                {item.isActive && (
                  <div className="card_list_right">
                    <span
                      onClick={() => toggleActive(index)}
                      className="more_close "
                    >
                      X
                    </span>
                    <Link
                      className="card_list_item"
                      href={`/team/news/edit-news/${item._id}`}
                    >
                      Edit News
                    </Link>

                    <div
                      className="card_list_item"
                      onClick={() => deletePlace(item._id, index)}
                    >
                      Delete News
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-end">
              <div className="flex text-sm mr-5">
                <i className="bi bi-calendar mr-2 sm:mr-1"></i>
                Written: {formatDateToDDMMYY(item.createdAt)} |{' '}
                {formatTimeTo12Hour(item.createdAt)}
              </div>
              <div className="flex text-sm">
                <i className="bi bi-calendar mr-2 sm:mr-1"></i>
                Published: {formatDateToDDMMYY(item.publishedAt)} |{' '}
                {formatTimeTo12Hour(item.publishedAt)}
              </div>
              <div className="ml-auto gap-3 grid grid-cols-5 text-[12px]">
                <div className="flex items-center ml-auto">
                  <i className={`bi bi-heart mr-1 mb-[-2px]`}></i>{' '}
                  {formatCount(item.likes)}
                </div>
                <div className="flex items-center ml-5">
                  <i className={`bi bi-bookmark mr-1 mb-[-2px]`}></i>{' '}
                  {formatCount(item.bookmarks)}
                </div>
                <div className="flex items-center ml-5">
                  <i className={`bi bi-eye mr-1 mb-[-2px]`}></i>{' '}
                  {formatCount(item.views)}
                </div>
                <div className="flex items-center ml-5">
                  <i className={`bi bi-chat mr-1 mb-[-2px]`}></i>{' '}
                  {formatCount(item.comments)}
                </div>
                <div className="flex items-center ml-5">
                  <i className={`bi bi-share mr-1 mb-[-2px]`}></i>{' '}
                  {formatCount(item.shares)}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      {loading && (
        <div className="flex w-full justify-center py-5">
          <i className="bi bi-opencollective loading"></i>
        </div>
      )}
      <div className="card_body sharp mb-3">
        <div className="flex flex-wrap items-center">
          <div className="grid mr-auto grid-cols-4 gap-2 w-[160px]">
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
            <Link href={`/team/news/create-news`} className="tableActions">
              <i className="bi bi-plus-circle"></i>
            </Link>
            {/* <div onClick={updateExam} className="tableActions">
              <i className="bi bi-table"></i>
            </div> */}
          </div>
        </div>
      </div>

      <div className="card_body sharp">
        <LinkedPagination url="/team/places" count={count} page_size={20} />
      </div>
    </>
  )
}

export default News
