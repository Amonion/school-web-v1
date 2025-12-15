'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { useParams, usePathname } from 'next/navigation'
import {
  formatCount,
  formatDateToDDMMYY,
  formatTimeTo12Hour,
} from '@/lib/helpers'
import { AlartStore, MessageStore } from '@/src/zustand/notification/Message'
import LinkedPagination from '@/components/Team/LinkedPagination'
import {
  Edit,
  Globe,
  Locate,
  Map,
  Pencil,
  Rocket,
  Trash,
  User,
} from 'lucide-react'
import WeekendStore, { Weekend } from '@/src/zustand/exam/Weekend'

const WeekendsTable: React.FC = () => {
  const {
    getWeekends,
    massDelete,
    deleteItem,
    updateWeekend,
    toggleAllSelected,
    toggleChecked,
    setLoading,
    toggleActive,
    reshuffleResults,
    searchWeekends,
    searchedWeekends,
    isAllChecked,
    selectedItems,
    loading,
    count,
    weekends,
  } = WeekendStore()
  const [page_size] = useState(20)
  const [sort] = useState('-createdAt')
  const { setMessage } = MessageStore()
  const pathname = usePathname()
  const { page } = useParams()
  const { setAlert } = AlartStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const url = '/weekends'

  useEffect(() => {
    reshuffleResults()
  }, [pathname])

  useEffect(() => {
    const params = `?page_size=${page_size}&page=${
      page ? page : 1
    }&ordering=${sort}`
    getWeekends(`${url}${params}`, setMessage)
  }, [page])

  const deleteWekend = async (id: string, index: number) => {
    toggleActive(index)
    const params = `?page_size=${page_size}&page=${
      page ? page : 1
    }&ordering=${sort}`
    await deleteItem(`${url}/${id}/${params}`, setMessage, setLoading)
  }

  const startDelete = (id: string, index: number) => {
    setAlert(
      'Warning',
      'Are you sure you want to delete this weekends?',
      true,
      () => deleteWekend(id, index)
    )
  }

  const handleSearchWeekends = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.trim().length > 0) {
      searchWeekends(
        `${url}/search?author=${value}&content=${value}&title=${value}&subtitle=${value}&page_size=${page_size}`
      )
    } else {
      WeekendStore.setState({ searchedWeekends: [] })
    }
  }

  const DeleteItems = async () => {
    if (selectedItems.length === 0) {
      setMessage('Please select at least one email to delete', false)
      return
    }
    const ids = selectedItems.map((item) => item._id)
    await massDelete(`${url}/mass-delete`, { ids: ids }, setMessage)
  }

  const setWeekendApproval = async (
    item: Weekend,
    isPublished: boolean,
    id: string
  ) => {
    if (!item.startAt || !item.endAt) {
      setMessage(
        'To publish, you must set up starting time and ending time.',
        false
      )
      return
    }
    const params = `?page_size=${page_size}&page=${
      page ? page : 1
    }&ordering=${sort}`
    const form = {
      isPublished: !isPublished,
      publishedAt: new Date().toISOString(),
    }
    updateWeekend(`${url}/${id}${params}`, form, setMessage)
  }

  const updateItem = async (form: Record<string, unknown>, id: string) => {
    const params = `?page_size=${page_size}&page=${
      page ? page : 1
    }&ordering=${sort}`
    updateWeekend(`${url}/${id}${params}`, form, setMessage)
  }

  return (
    <>
      <div className="card_body sharp mb-5">
        <div className="text-lg text-[var(--text-secondary)]">
          Table of Weekends
        </div>
        <div className="relative mb-2">
          <div className={`input_wrap ml-auto active `}>
            <input
              ref={inputRef}
              type="search"
              onChange={handleSearchWeekends}
              className={`transparent-input flex-1 `}
              placeholder="Search weekends"
            />
            {loading ? (
              <i className="bi bi-opencollective common-icon loading"></i>
            ) : (
              <i className="bi bi-search common-icon cursor-pointer"></i>
            )}
          </div>

          {searchedWeekends.length > 0 && (
            <div
              className={`dropdownList ${
                searchedWeekends.length > 0
                  ? 'overflow-auto'
                  : 'overflow-hidden h-0'
              }`}
            >
              {searchedWeekends.map((item, index) => (
                <div key={index} className="input_drop_list">
                  <Link
                    href={`/school/students/student/${item._id}`}
                    className="flex-1"
                  >
                    {item.title}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {weekends.map((item, index) => (
        <div key={index} className="card_body sharp mb-1">
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
                {(page ? Number(page) - 1 : 1 - 1) * page_size + index + 1}
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
                <div className="text-lg mb-1 text-[var(--text-secondary)]">
                  {item.title}
                </div>
                <div className="line-clamp-2 overflow-ellipsis">
                  {item.instruction}
                </div>
              </div>
              <div className="absolute gap-2 top-[-10px] right-0 flex items-center">
                <div
                  onClick={() =>
                    updateItem({ isFeatured: !item.isFeatured }, item._id)
                  }
                  className={`${
                    item.isFeatured
                      ? 'border-[var(--custom)] text-white bg-[var(--custom)]'
                      : 'border-[var(--border)]'
                  } cursor-pointer text-[12px] border px-3 py-1 rounded-full`}
                >
                  featured
                </div>
                <div
                  onClick={() => updateItem({ isMain: !item.isMain }, item._id)}
                  className={`${
                    item.isMain
                      ? 'border-[var(--custom)] text-white bg-[var(--custom)]'
                      : 'border-[var(--border)]'
                  } cursor-pointer text-[12px] border px-3 py-1 rounded-full`}
                >
                  main
                </div>
                <Link href={`/team/competitions/weekends/edit/${item._id}`}>
                  <Edit className="cursor-pointer" size={18} />
                </Link>

                <Trash
                  className="cursor-pointer"
                  onClick={() => startDelete(item._id, index)}
                  size={18}
                />
              </div>
            </div>
            <div className="flex text-sm mb-2">
              <div className="flex items-center mr-3">
                <User size={14} className="mr-1" /> {item.bioUserUsername}
              </div>
              <div className="flex items-center mr-3">
                <Globe size={14} className="mr-1" /> {item.priority}
              </div>
              {item.country && (
                <div className="flex items-center mr-3">
                  <Map size={14} className="mr-1" /> {item.country}
                </div>
              )}
              {item.state && (
                <div className="flex items-center">
                  <Locate size={14} className="mr-1" /> {item.state}
                </div>
              )}
            </div>
            <div className="flex items-center">
              <div className="flex items-center text-sm mr-5">
                <Pencil className="w-3 h-3 mr-2" />
                {formatDateToDDMMYY(item.createdAt)} |{' '}
                {formatTimeTo12Hour(item.createdAt)}
              </div>
              {item.isPublished && (
                <div className="flex items-center text-sm">
                  <Rocket className="w-3 h-3 mr-2" />
                  {formatDateToDDMMYY(item.publishedAt)} |{' '}
                  {formatTimeTo12Hour(item.publishedAt)}
                </div>
              )}
              <div className="ml-auto flex items-center text-[12px]">
                <div className="flex items-center">
                  <i className={`bi bi-heart mr-1 mb-[-2px]`}></i>{' '}
                  {formatCount(item.likes)}
                </div>
                <div className="flex items-center ml-4">
                  <i className={`bi bi-bookmark mr-1 mb-[-2px]`}></i>{' '}
                  {formatCount(item.bookmarks)}
                </div>
                <div className="flex items-center ml-4">
                  <i className={`bi bi-eye mr-1 mb-[-2px]`}></i>{' '}
                  {formatCount(item.views)}
                </div>
                <div className="flex items-center ml-4">
                  <i className={`bi bi-chat mr-1 mb-[-2px]`}></i>{' '}
                  {formatCount(item.comments)}
                </div>
                <div className="flex items-center ml-4">
                  <i className={`bi bi-share mr-1 mb-[-2px]`}></i>{' '}
                  {formatCount(item.shares)}
                </div>
              </div>
              <div
                onClick={() =>
                  setWeekendApproval(item, item.isPublished, item._id)
                }
                className={`${
                  !item.isPublished
                    ? 'bg-[var(--custom)]'
                    : 'bg-[var(--success)]'
                } rounded-full text-white flex justify-center items-center ml-3 text-sm w-6 h-6 cursor-pointer`}
              >
                {item.isPublished ? (
                  <Rocket className="w-3 h-3" />
                ) : (
                  <Pencil className="w-3 h-3" />
                )}
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
            <Link
              href={`/team/competitions/weekends/create`}
              className="tableActions"
            >
              <i className="bi bi-plus-circle"></i>
            </Link>
            {/* <div onClick={updateExam} className="tableActions">
              <i className="bi bi-table"></i>
            </div> */}
          </div>
        </div>
      </div>

      <div className="card_body sharp">
        <LinkedPagination
          url="/team/competitions/weekends"
          count={count}
          page_size={20}
        />
      </div>
    </>
  )
}

export default WeekendsTable
