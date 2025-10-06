'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation'
import StateStore from '@/src/zustand/place/StateOrigin'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { MessageStore } from '@/src/zustand/notification/Message'
import LinkedPagination from '@/components/Team/LinkedPagination'

const States: React.FC = () => {
  const url = '/places/state'
  const {
    getStates,
    states,
    isAllCountriesChecked,
    toggleActiveState,
    toggleAllSelectedState,
    toggleCheckedState,
    selectedStates,
    massDeleteStates,
    loadingStates,
    reshuffleStates,
    deleteItem,
    count,
  } = StateStore()

  const { user } = AuthStore.getState()
  const [page_size] = useState(20)
  const [sort] = useState('state')
  const [country, setCountry] = useState('')
  const [id, setId] = useState('')
  const { setMessage } = MessageStore()
  const pathname = usePathname()
  const { page } = useParams()
  const [query, setQuery] = useState('')

  useEffect(() => {
    reshuffleStates()
  }, [pathname])

  useEffect(() => {
    reshuffleStates()
    const query = window.location.search
    const el = String(new URLSearchParams(query).get('country'))
    const cId = String(new URLSearchParams(query).get('id'))
    setId(cId)
    setCountry(el)
    setQuery(`id=${cId}&country=${el}`)
    const params = `?country=${el}&page_size=${page_size}&page=${page}&sort=${sort}&field=state`
    getStates(`${url}${params}`, setMessage)
  }, [page])

  const deletePlace = async (id: string, index: number) => {
    toggleActiveState(index)
    const params = `?page_size=${page_size}&page=${page}&ordering=${sort}`
    await deleteItem(`${url}${id}/${params}`, setMessage)
  }

  const DeleteItems = async () => {
    if (selectedStates.length === 0) {
      setMessage('Please select at least one email to delete', false)
      return
    }
    await massDeleteStates(`${url}mass-delete/`, selectedStates, setMessage)
  }
  return (
    <>
      <div className="card_body">
        <div className="custom_sm_title">Table of States</div>
        <div className="overflow-auto mb-5">
          {states.length > 0 ? (
            <table className="">
              <thead>
                <tr>
                  <th>S/N</th>
                  <th>Picture</th>
                  <th>State</th>
                  <th>Capital</th>
                  <th>Country</th>
                </tr>
              </thead>
              <tbody>
                {states.map((item, index) => (
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
                          onClick={() => toggleCheckedState(index)}
                        >
                          {item.isChecked && (
                            <i className="bi bi-check text-white text-lg"></i>
                          )}
                        </div>
                        {(Number(page) - 1) * page_size + index + 1}
                        <i
                          onClick={() => toggleActiveState(index)}
                          className="bi bi-three-dots-vertical text-lg cursor-pointer"
                        ></i>
                      </div>
                      {item.isActive && (
                        <div className="card_list">
                          <span
                            onClick={() => toggleActiveState(index)}
                            className="more_close "
                          >
                            X
                          </span>
                          <Link
                            className="card_list_item"
                            href={`/team/places/states/create-state?id=${item.id}&name=${item.state}&country=${country}`}
                          >
                            Edit State
                          </Link>
                          <Link
                            className="card_list_item"
                            href={`/team/places/area/?id=${item.id}&state=${item.state}`}
                          >
                            Areas
                          </Link>
                          <Link
                            className="card_list_item"
                            href={`/team/places/area/create-area?stateId=${item.id}&state=${item.state}`}
                          >
                            Create Area
                          </Link>
                          <div
                            className="card_list_item"
                            onClick={() => deletePlace(item.id, index)}
                          >
                            Delete State
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

                    <td>{item.state}</td>
                    <td>{item.stateCapital}</td>
                    <td>{item.country}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="relative flex justify-center">
              <div className="not_found_text">No State Found</div>
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
          {loadingStates ? (
            <button className="custom_btn ">
              <i className="bi bi-opencollective loading"></i>

              <div>Processing...</div>
            </button>
          ) : (
            <>
              {states.length > 0 && (
                <>
                  <button
                    className="custom_btn line"
                    onClick={toggleAllSelectedState}
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
              <Link
                href={`/team/places/states/create-state?countryId=${id}&country=${country}`}
                className="custom_btn "
              >
                Create State
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

export default States
