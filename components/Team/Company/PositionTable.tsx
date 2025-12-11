'use client'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation'
import PositionStore, { Position } from '@/src/zustand/app/Position'
import { MessageStore } from '@/src/zustand/notification/Message'
import LinkedPagination from '../LinkedPagination'
import CreatePosition from './CreatePosition'

const PositionTable: React.FC = () => {
  const url = '/company/positions/'
  const {
    isAllChecked,
    positionResults,
    selectedItems,
    loading,
    count,
    isPositionForm,
    showPositionForm,
    toggleChecked,
    getPositions,
    toggleAllSelected,
    massDelete,
    reshuffleResults,
  } = PositionStore()
  const [page_size] = useState(20)
  const [sort] = useState('-createdAt')
  const { setMessage } = MessageStore()
  const pathname = usePathname()
  const { page } = useParams()

  useEffect(() => {
    reshuffleResults()
  }, [pathname])

  useEffect(() => {
    reshuffleResults()
    getPositions(
      `${url}?page_size=${page_size}&page=${page ? page : 1}&ordering=${sort}`,
      setMessage
    )
  }, [positionResults.length, page])

  const DeleteItems = async () => {
    if (selectedItems.length === 0) {
      setMessage('Please select at least one position to delete', false)
      return
    }
    const positionIds = selectedItems.map((item) => item._id)

    await massDelete(
      `${url}mass-delete/?page_size=${page_size}&page=${page}&ordering=${sort}`,
      { positionIds },
      setMessage
    )
  }

  const selectPosition = (item: Position) => {
    PositionStore.setState({ positionFormData: item })
    showPositionForm(true)
  }
  return (
    <>
      {positionResults.length > 0 ? (
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
              <th>Positions</th>
              <th>Duty</th>
              <th>Salary</th>
              <th>Level</th>
            </tr>
          </thead>
          <tbody>
            {positionResults.map((item, index) => (
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
                <td
                  onClick={() => selectPosition(item)}
                  className="cursor-pointer"
                >
                  {item.position}
                </td>
                <td>{item.duties}</td>
                <td>${item.salary}</td>
                <td>
                  <div>{item.level}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="relative flex justify-center">
          <div className="not_found_text">No Position Found</div>
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

      <div className=" card_body sharp my-5">
        {loading ? (
          <button className="custom_btn ">
            <i className="bi bi-opencollective loading"></i>

            <div>Processing...</div>
          </button>
        ) : (
          <div className="flex items-center w-full">
            <i
              onClick={DeleteItems}
              className="bi bi-trash text-lg cursor-pointer mr-3 text-[var(--custom)]"
            ></i>
          </div>
        )}
      </div>

      <div className="card_body sharp">
        <LinkedPagination
          url="/team/company/staffs/positions"
          count={count}
          page_size={20}
        />
      </div>

      {isPositionForm && <CreatePosition />}
    </>
  )
}

export default PositionTable
