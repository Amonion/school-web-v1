'use client'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import LinkedPagination from '../LinkedPagination'
import CustomBtn from '../../CustomBtn'
import ExpensesStore, {
  Expenses,
  ExpensesForm,
} from '@/src/zustand/app/Expenses'
import {
  formatDateToDDMMYY,
  formatMoney,
  formatTimeTo12Hour,
} from '@/lib/helpers'
import CreateExpenseForm from './ExpenseForm'

const ExpensesTable: React.FC = () => {
  const url = '/company/expenses/'
  const {
    count,
    results,
    loading,
    isAllChecked,
    searchedExpenses,
    isExpenseForm,
    showForm,
    searchExpenses,
    getExpenses,
    toggleAllSelected,
    toggleChecked,
    resetForm,
  } = ExpensesStore()
  const { page } = useParams()
  const [page_size] = useState(20)
  const [sort] = useState('-createdAt')
  const inputRef = useRef<HTMLInputElement>(null)
  const params = `?page_size=${page_size}&page=${
    page ? page : 1
  }&ordering=${sort}`

  useEffect(() => {
    getExpenses(`${url}${params}`)
  }, [page])

  const showExpenses = async (exp: Expenses) => {
    resetForm(exp)
    showForm(true)
  }

  const handleSearchExpenses = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value
    if (value.trim().length > 0) {
      searchExpenses(
        `${url}search?username=${value}&displayName=${value}&page_size=${page_size}`
      )
    } else {
      ExpensesStore.setState({ searchedExpenses: [] })
    }
  }

  return (
    <>
      <div className="overflow-auto mb-5">
        <div className="card_body sharp mb-5">
          <div className="text-lg text-[var(--text-secondary)]">
            Table of Expenses
          </div>
          <div className="relative mb-2">
            <div className={`input_wrap ml-auto active `}>
              <input
                ref={inputRef}
                type="search"
                onChange={handleSearchExpenses}
                className={`transparent-input flex-1 `}
                placeholder="Search expenses"
              />
              {loading ? (
                <i className="bi bi-opencollective common-icon loading"></i>
              ) : (
                <i className="bi bi-search common-icon cursor-pointer"></i>
              )}
            </div>

            {searchedExpenses.length > 0 && (
              <div
                className={`dropdownList ${
                  searchedExpenses.length > 0
                    ? 'overflow-auto'
                    : 'overflow-hidden h-0'
                }`}
              >
                {searchedExpenses.map((item, index) => (
                  <div key={index} className="input_drop_list">
                    {item.name}, N{formatMoney(item.amount)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {results.length > 0 ? (
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
                <th>Name</th>
                <th>Amount</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {results.map((item, index) => (
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
                    <div
                      onClick={() => showExpenses(item)}
                      className="cursor-pointer"
                    >
                      {item.name}
                    </div>
                  </td>
                  <td>₦{formatMoney(item.amount)}</td>
                  <td>
                    {formatTimeTo12Hour(item.createdAt)}
                    <br />
                    {formatDateToDDMMYY(item.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="relative flex justify-center">
            <div className="not_found_text">No Expenses Found</div>
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

      <div className=" card_body sharp my-5">
        {loading ? (
          <button className="flex">
            <CustomBtn label="" loading={loading} />
          </button>
        ) : (
          <div className="flex gap-5 items-center w-full">
            {/* <i
              onClick={makeUsersStaffs}
              className="bi bi-trash text-lg cursor-pointer text-[var(--custom)]"
            ></i> */}

            <div
              onClick={() => {
                resetForm(ExpensesForm)
                showForm(true)
              }}
            >
              <CustomBtn label="Add Expenses" loading={false} />
            </div>
          </div>
        )}
      </div>

      <div className="card_body sharp">
        <LinkedPagination
          url="/team/company/expenses"
          count={count}
          page_size={20}
        />
      </div>
      {isExpenseForm && <CreateExpenseForm />}
    </>
  )
}

export default ExpensesTable
