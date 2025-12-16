'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { useParams, usePathname } from 'next/navigation'
import React from 'react'
import { MessageStore } from '@/src/zustand/notification/Message'
import CountryStore, {
  Country,
  CountryEmpty,
} from '@/src/zustand/place/CountryOrigin'
import LinkedPagination from '../LinkedPagination'
import CreateCountry from './CreateCountry'

const Countries: React.FC = () => {
  const url = '/places/countries'
  const {
    countries,
    isAllCountriesChecked,
    loadingCountries,
    count,
    searchedCountries,
    selectedCountries,
    isCountryForm,
    searchCountry,
    // toggleActiveCountry,
    toggleAllSelectedCountry,
    toggleCheckedCountry,
    // massDeleteCountries,
    reshuffleResults,
    showCountryForm,
    resetForm,
    getCountries,
  } = CountryStore()
  const { page } = useParams()
  const [page_size] = useState(20)
  const [sort] = useState('country')
  const prevPage = useRef(0)
  const { setMessage } = MessageStore()
  const pathname = usePathname()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    reshuffleResults()
  }, [pathname])

  useEffect(() => {
    if (page && Number(page) > 0) {
      const params = `?country=&page_size=${page_size}&page=${page}&sort=${sort}&field=country`
      getCountries(`${url}${params}`, setMessage)
      prevPage.current = Number(page)
    } else {
      const params = `?country=&page_size=${page_size}&page=${1}&sort=${sort}&field=country`
      getCountries(`${url}${params}`, setMessage)
      prevPage.current = 1
    }
  }, [page])

  const selectCountry = (country: Country) => {
    resetForm(country)
    showCountryForm(true)
  }

  // const deletePlace = async (id: string, index: number) => {
  //   toggleActiveCountry(index)
  //   const params = `?page_size=${page_size}&page=${page}&ordering=${sort}`
  //   await deleteItem(`${url}${id}/${params}`, setMessage, setLoading)
  // }

  const DeleteItems = async () => {
    if (selectedCountries.length === 0) {
      setMessage('Please select at least one email to delete', false)
      return
    }
    // await massDeleteCountries(
    //   `${url}mass-delete/`,
    //   selectedCountries,
    //   setMessage
    // )
  }

  const handleSearchCountry = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.trim().length > 0) {
      searchCountry(
        `${url}/search?author=${value}&content=${value}&title=${value}&subtitle=${value}&page_size=${page_size}`
      )
    } else {
      CountryStore.setState({ searchedCountries: [] })
    }
  }

  return (
    <>
      <div className="card_body sharp mb-5">
        <div className="text-lg text-[var(--text-secondary)]">
          Table of Countries
        </div>
        <div className="relative mb-2">
          <div className={`input_wrap ml-auto active `}>
            <input
              ref={inputRef}
              type="search"
              onChange={handleSearchCountry}
              className={`transparent-input flex-1 `}
              placeholder="Search countries"
            />
            {loadingCountries ? (
              <i className="bi bi-opencollective common-icon loading"></i>
            ) : (
              <i className="bi bi-search common-icon cursor-pointer"></i>
            )}
          </div>

          {searchedCountries.length > 0 && (
            <div
              className={`dropdownList ${
                searchedCountries.length > 0
                  ? 'overflow-auto'
                  : 'overflow-hidden h-0'
              }`}
            >
              {searchedCountries.map((item, index) => (
                <div key={index} className="input_drop_list">
                  <Link
                    href={`/school/students/student/${item.id}`}
                    className="flex-1"
                  >
                    {item.country}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* <div className="p-3 bg-[var(--primary)]">
        <div className="custom_sm_title">Table of Countries</div>
        <div className="overflow-auto mb-5">
          {countries.length > 0 ? (
            <table className="">
              <thead>
                <tr>
                  <th>S/N</th>
                  <th>Picture</th>
                  <th>Country</th>
                  <th>Currency</th>
                  <th>Code</th>
                </tr>
              </thead>
              <tbody>
                {countries.map((item, index) => (
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
                          onClick={() => toggleCheckedCountry(index)}
                        >
                          {item.isChecked && (
                            <i className="bi bi-check text-white text-lg"></i>
                          )}
                        </div>
                        {(Number(page) - 1) * page_size + index + 1}
                        <i
                          onClick={() => toggleActiveCountry(index)}
                          className="bi bi-three-dots-vertical text-lg cursor-pointer"
                        ></i>
                      </div>
                      {item.isActive && (
                        <div className="card_list">
                          <span
                            onClick={() => toggleActiveCountry(index)}
                            className="more_close "
                          >
                            X
                          </span>
                          <Link
                            className="card_list_item"
                            href={`/team/places/create-country?id=${item.id}&name=${item.country}`}
                          >
                            Edit Country
                          </Link>
                          <Link
                            className="card_list_item"
                            href={`/team/places/states/1/?id=${item.id}&country=${item.country}`}
                          >
                            States
                          </Link>

                          <Link
                            className="card_list_item"
                            href={`/team/places/banks/?id=${item.id}&country=${item.country}`}
                          >
                            Banks
                          </Link>
                          <Link
                            className="card_list_item"
                            href={`/team/places/payments?id=${item.id}&country=${item.country}`}
                          >
                            Payments
                          </Link>
                          <Link
                            className="card_list_item"
                            href={`/team/places/adds?id=${item.id}&country=${item.country}`}
                          >
                            Ads
                          </Link>
                          <Link
                            className="card_list_item"
                            href={`/team/places/academic-levels/1?id=${item.id}&country=${item.country}`}
                          >
                            Academic Levels
                          </Link>
                          <Link
                            className="card_list_item"
                            href={`/team/places/documents/1?id=${item.id}&country=${item.country}`}
                          >
                            Documents
                          </Link>
                          <div
                            className="card_list_item"
                            onClick={() => deletePlace(item.id, index)}
                          >
                            Delete Country
                          </div>
                        </div>
                      )}
                    </td>
                    <td>
                      {item.countryFlag ? (
                        <Image
                          alt={`email of ${item.countryFlag}`}
                          src={String(item.countryFlag)}
                          width={0}
                          sizes="100vw"
                          height={0}
                          style={{ width: '50px', height: 'auto' }}
                        />
                      ) : (
                        <span>N/A</span>
                      )}
                    </td>

                    <td>
                      {item.country} ({item.countrySymbol})
                    </td>
                    <td>
                      {item.currency} ({item.currencySymbol})
                    </td>
                    <td>{item.countryCode}</td>
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
          {loadingCountries ? (
            <button className="custom_btn ">
              <i className="bi bi-opencollective loading"></i>

              <div>Processing...</div>
            </button>
          ) : (
            <>
              {countries.length > 0 && (
                <>
                  <button
                    className="custom_btn line"
                    onClick={toggleAllSelectedCountry}
                  >
                    <div
                      className={`checkbox ${
                        isAllCountriesChecked ? 'active' : ''
                      }`}
                    >
                      {isAllCountriesChecked && (
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

              <div
                onClick={() => updateItem(`/places/clean`, {}, setMessage)}
                className="custom_btn ml-auto"
              >
                Update
              </div>
              <Link
                href="/team/places/create-country"
                className="custom_btn ml-auto"
              >
                Create Country
              </Link>
            </>
          )}
        </div>

        <LinkedPagination url="/team/places" count={count} page_size={20} />
      </div> */}

      {countries.length > 0 ? (
        <table>
          <thead className="bg-[var(--primary)]">
            <tr>
              <th>
                <div className="flex items-center">
                  <div
                    onClick={toggleAllSelectedCountry}
                    className={`checkbox ${
                      isAllCountriesChecked ? 'active' : ''
                    }`}
                  >
                    {isAllCountriesChecked && (
                      <i className="bi bi-check text-white text-lg"></i>
                    )}
                  </div>
                  S/N
                </div>
              </th>
              <th>Flag</th>
              <th>Country</th>
              <th>Symbol</th>
              <th>Currency</th>
              <th>Code</th>
            </tr>
          </thead>
          <tbody>
            {countries.map((item, index) => (
              <tr
                key={index}
                className={`${index % 2 === 1 ? 'bg-[var(--primary)]' : ''}`}
              >
                <td>
                  <div className="flex items-center">
                    <div
                      className={`checkbox ${item.isChecked ? 'active' : ''}`}
                      onClick={() => toggleCheckedCountry(index)}
                    >
                      {item.isChecked && (
                        <i className="bi bi-check text-white text-lg"></i>
                      )}
                    </div>
                    {(page ? Number(page) - 1 : 0) * page_size + index + 1}
                  </div>
                </td>
                <td>
                  <Link href={`/team/places/states/1`}>
                    {item.countryFlag ? (
                      <Image
                        alt={`email of ${item.countryFlag}`}
                        src={String(item.countryFlag)}
                        width={0}
                        sizes="100vw"
                        height={0}
                        style={{ width: '40px', height: 'auto' }}
                      />
                    ) : (
                      <span>N/A</span>
                    )}
                  </Link>
                </td>
                <td>
                  <div
                    onClick={() => selectCountry(item)}
                    className="cursor-pointer"
                  >
                    {item.country}
                  </div>
                </td>
                <td>{item.countrySymbol}</td>
                <td>{item.currency}</td>
                <td>{item.countryCode}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="relative flex justify-center">
          <div className="not_found_text">No Country Found</div>
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
          <div className="grid mr-auto grid-cols-4 gap-2 w-[160px]">
            <div onClick={toggleAllSelectedCountry} className="tableActions">
              <i
                className={`bi bi-check2-all ${
                  isAllCountriesChecked ? 'text-[var(--custom)]' : ''
                }`}
              ></i>
            </div>

            <div onClick={DeleteItems} className="tableActions">
              <i className="bi bi-trash"></i>
            </div>

            <div
              onClick={() => selectCountry(CountryEmpty)}
              className="tableActions"
            >
              <i className="bi bi-plus-circle"></i>
            </div>
            {/* <div onClick={updateExam} className="tableActions">
              <i className="bi bi-table"></i>
            </div> */}
          </div>
        </div>
      </div>

      {isCountryForm && <CreateCountry />}

      <div className="card_body sharp">
        <LinkedPagination url="/team/places" count={count} page_size={20} />
      </div>
    </>
  )
}

export default Countries
