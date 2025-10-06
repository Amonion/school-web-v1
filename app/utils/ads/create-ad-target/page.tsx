'use client'
import Link from 'next/link'
import { appendForm } from '@/lib/helpers'
import { validateInputs } from '@/lib/validation'
import { useState, useEffect } from 'react'
import AdStore from '@/src/zustand/team/Ad'
import { MessageStore } from '@/src/zustand/msgStore'
import { useAuthStore } from '@/src/zustand/authStore'
import CountryStore from '@/src/zustand/team/Country'
import StateStore from '@/src/zustand/team/State'
import AreaStore from '@/src/zustand/team/Area'
import { useRouter } from 'next/navigation'
import AdHeader from '@/components/Utility/Ad/AdHeader'

const distributions = ['Local', 'National', 'International']

const CreateUserAd: React.FC = () => {
  const url = '/ads'
  const { itemFormData, setItemForm, loadingAds, updateItem, getAd } = AdStore()
  const [isDistributionList, setDistributionList] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showTargetPlaces, setShowTargetPlaces] = useState(false)
  const [focus, setFocus] = useState('')
  const { setMessage } = MessageStore()
  const [isCountryList, setCountryList] = useState(false)
  const [isStateList, setStateList] = useState(false)
  const [changed, setChanged] = useState(false)
  const [tag, setTag] = useState('')
  const { user } = useAuthStore.getState()
  const router = useRouter()

  const {
    toggleCheckedCountry,
    getCountries,
    countries,
    searchedItems,
    searchItem,
    selectedCountries,
  } = CountryStore()
  const {
    getStates,
    states,
    toggleCheckedState,
    searchedStates,
    searchStates,
    selectedStates,
  } = StateStore()
  const { getArea, area, selectedArea, toggleCheckedArea } = AreaStore()

  useEffect(() => {
    searchItem(`/places/countries/?country=&page_size=350&field=country`)
  }, [])

  useEffect(() => {
    if (!itemFormData._id && user) {
      getAd(`/ads/drafted/?username=${user?.username}`)
    }
  }, [user, itemFormData._id])

  useEffect(() => {
    if (itemFormData.distribution === 'Local') {
      if (!itemFormData.state) {
        setIsCompleted(false)
      } else {
        setIsCompleted(true)
      }
    }
  }, [itemFormData.distribution, itemFormData.category, itemFormData.tags])

  useEffect(() => {
    if (
      itemFormData.distribution &&
      itemFormData.category &&
      itemFormData.tags.length > 0 &&
      !loadingAds
    ) {
      setIsCompleted(true)
    } else {
      setIsCompleted(false)
    }
  }, [itemFormData.distribution, itemFormData.category, itemFormData.tags])

  useEffect(() => {
    if (itemFormData.distribution === 'Local') {
      setFocus('Areas')
      searchStates(
        `/places/state/?country=${itemFormData.country}&page_size=350&field=state&sort=state`
      )

      if (!itemFormData.state) {
        setIsCompleted(false)
      } else {
        setIsCompleted(true)
      }
    } else if (itemFormData.distribution === 'National') {
      setFocus('States')
      getStates(
        `/places/state/?country=${itemFormData.country}&page_size=350&field=state&sort=state`
      )
      CountryStore.setState({ selectedCountries: [] })
    } else if (itemFormData.distribution === 'International') {
      setFocus('Countries')
      getCountries(`/places/countries/?country=&page_size=350&field=country`)
    }
  }, [itemFormData.distribution])

  useEffect(() => {
    if (searchedItems.length > 0 && itemFormData.country) {
      const country = searchedItems.find(
        (el) =>
          el.country?.trim().toLowerCase() ===
          itemFormData.country?.trim().toLowerCase()
      )

      setItemForm('countrySymbol', country?.countrySymbol.trim())
      setItemForm('currency', country?.currency.trim())
      setItemForm('currencySymbol', country?.currencySymbol.trim())
    }
  }, [itemFormData.country, searchedItems.length])

  useEffect(() => {
    AreaStore.setState({ area: [] })
    searchStates(
      `/places/state/?country=${itemFormData.country}&page_size=350&field=state&sort=state`
    )
    getStates(
      `/places/state/?country=${itemFormData.country}&page_size=350&field=state&sort=state`
    )
  }, [itemFormData.country])

  useEffect(() => {
    if (itemFormData.distribution === 'Local') {
      getArea(
        `/places/area/?state=${itemFormData.state}&page_size=350&field=area&sort=area`
      )
    }
    if (itemFormData.distribution === 'Local') {
      if (!itemFormData.state) {
        setIsCompleted(false)
      } else {
        setIsCompleted(true)
      }
    }
  }, [itemFormData.state])

  useEffect(() => {
    if (!user) return
    if (itemFormData.country) return
    setItemForm('country', user.country)
  }, [user])

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    if (/,$/.test(value)) {
      const newTag = value.trim().replace(/,$/, '')
      if (newTag) {
        AdStore.setState((prev) => {
          const newForm = {
            ...prev.itemFormData,
            tags: [...(prev.itemFormData.tags || []), newTag],
          }
          return {
            ...prev,
            itemFormData: newForm,
          }
        })
      }
      setChanged(true)
      setTag('')
    } else {
      setTag(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    const inputsToValidate = [
      {
        name: 'country',
        value: itemFormData.country,
        rules: { blank: true, minLength: 3, maxLength: 1000 },
        field: 'Country field',
      },
      {
        name: 'countries',
        value: JSON.stringify(itemFormData.countries),
        rules: { blank: false },
        field: 'Countries',
      },
      {
        name: 'states',
        value: JSON.stringify(itemFormData.states),
        rules: { blank: false },
        field: 'States',
      },
      {
        name: 'areas',
        value: JSON.stringify(itemFormData.areas),
        rules: { blank: false },
        field: 'Areas',
      },
      {
        name: 'tags',
        value: JSON.stringify(itemFormData.tags),
        rules: { blank: true },
        field: 'Tags',
      },
      {
        name: 'state',
        value: itemFormData.state,
        rules: { blank: false },
        field: 'State',
      },
      {
        name: 'target',
        value: true,
        rules: { blank: false },
        field: 'State',
      },
      {
        name: 'category',
        value: itemFormData.category,
        rules: { blank: true, maxLength: 1000 },
        field: 'Category',
      },
      {
        name: 'currency',
        value: itemFormData.currency,
        rules: { blank: true, maxLength: 1000 },
        field: 'Currency',
      },
      {
        name: 'currencySymbol',
        value: itemFormData.currencySymbol,
        rules: { blank: true, maxLength: 1000 },
        field: 'Currency symbol',
      },
      {
        name: 'distribution',
        value: itemFormData.distribution,
        rules: { blank: true, maxLength: 1000 },
        field: 'Distribution',
      },
    ]
    const { messages } = validateInputs(inputsToValidate)
    const getFirstNonEmptyMessage = (
      messages: Record<string, string>
    ): string | null => {
      for (const key in messages) {
        if (messages[key].trim() !== '') {
          return messages[key]
        }
      }
      return null
    }

    const firstNonEmptyMessage = getFirstNonEmptyMessage(messages)
    if (firstNonEmptyMessage) {
      setMessage(firstNonEmptyMessage, false)
      return
    }

    e.preventDefault()
    const data = appendForm(inputsToValidate)
    updateItem(`${url}/${itemFormData._id}`, data, setMessage, () =>
      router.push(`/utils/ads/ad-payment`)
    )
  }

  return (
    <>
      {showTargetPlaces && (
        <div
          onClick={() => setShowTargetPlaces(false)}
          className="fixed z-40 left-0 top-0 w-full h-full flex items-center justify-center overflow-auto bg-black/50"
        >
          <div
            onClick={(e) => {
              e.stopPropagation()
            }}
            className="flex card_body w-full max-w-[1000px] flex-col items-center"
          >
            <div className="text-center w-full mb-3">
              Distribution: {itemFormData.distribution}
            </div>
            {/***************** PLACE HEARDER ****************/}
            <div
              className={`grid ${
                itemFormData.distribution === 'Local' ? 'grid-cols-2' : ''
              } gap-4 w-full max-w-[600px] mb-4`}
            >
              <div className="relative">
                <div
                  onClick={() => setCountryList(!isCountryList)}
                  className="bg-[var(--secondary)] flex items-center justify-between cursor-pointer rounded-[5px] py-2 px-3 text-center mb-5"
                >
                  <div className="flex items-center">
                    <span className="mr-2">Country:</span>
                    <span className="text-[var(--custom)]">
                      {itemFormData.country}
                    </span>
                  </div>
                  <i className="ml-3 bi bi-caret-down-fill"></i>
                </div>
                {isCountryList && (
                  <div className="rounded-[10px] overflow-x-hidden bg-[var(--secondary)] max-h-[400px] overflow-y-auto z-30 border border-[var(--border)] absolute top-[50px] left-0 w-full min-w-[200px]">
                    {searchedItems.map((item, index) => (
                      <div
                        onClick={() => {
                          setCountryList(false)
                          setItemForm('country', item.country)
                        }}
                        key={index}
                        className="input_drop_list"
                      >
                        {item.country}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {itemFormData.distribution === 'Local' && (
                <div className="relative">
                  <div
                    onClick={() => setStateList(!isStateList)}
                    className="bg-[var(--secondary)] flex items-center cursor-pointer rounded-[5px] py-2 px-3 text-center mb-5"
                  >
                    <div className="flex items-center">
                      <span className="mr-2">State:</span>
                      <span className="text-[var(--custom)]">
                        {itemFormData.state}
                      </span>
                    </div>
                    <i className="ml-auto bi bi-caret-down-fill"></i>
                  </div>
                  {isStateList && (
                    <div className="rounded-[10px] overflow-x-hidden bg-[var(--secondary)] max-h-[400px] overflow-y-auto z-30 border border-[var(--border)] absolute top-[50px] left-0 w-full min-w-[200px]">
                      {searchedStates.map((item, index) => (
                        <div
                          onClick={() => {
                            setStateList(false)
                            setItemForm('state', item.state)
                          }}
                          key={index}
                          className="input_drop_list"
                        >
                          {item.state}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            {/***************** PLACE HEARDER ****************/}

            {itemFormData.distribution === 'International' && (
              <div className="w-full text-center mb-1">
                Select target countries
              </div>
            )}
            {itemFormData.distribution === 'National' && (
              <div className="w-full text-center mb-1">
                Select target states
              </div>
            )}
            {itemFormData.distribution === 'Local' && (
              <div className="w-full text-center mb-1">
                {area.length === 0
                  ? 'Select state to target areas'
                  : 'Select target areas'}
              </div>
            )}
            {itemFormData.distribution === 'Local' && (
              <div className="flex-1">
                {focus === 'Areas' && area.length > 0 ? (
                  <div className="grid grid-cols-4 mb-4 bg-[var(--secondary)] rounded-[10px] p-3 max-h-[500px] overflow-auto w-full">
                    {area.map((item, index) => (
                      <div
                        key={index}
                        className={`radio m-1 ${
                          item.isActive ? 'text-[var(--custom)]' : ''
                        }`}
                        // onClick={() => selectLevel(index, item, true)}
                      >
                        <div
                          className={`checkbox mt-1 ${
                            item.isChecked ? 'active' : ''
                          }`}
                          onClick={() => toggleCheckedArea(index)}
                        >
                          {item.isChecked && (
                            <i className="bi bi-check text-white text-lg"></i>
                          )}
                        </div>
                        {item.area}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-4 mb-4 bg-[var(--secondary)] rounded-[10px] p-3 max-h-[500px] overflow-auto w-full">
                    {searchedStates.map((item, index) => (
                      <div
                        key={index}
                        className={`radio m-1 ${
                          item.isActive ? 'text-[var(--custom)]' : ''
                        }`}
                        onClick={() => {
                          setItemForm('state', item.state)
                        }}
                      >
                        {item.state}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {focus === 'States' && (
              <div className="grid grid-cols-4 mb-4 bg-[var(--secondary)] rounded-[10px] p-3 max-h-[500px] overflow-auto w-full">
                {states.map((item, index) => (
                  <div
                    key={index}
                    className={`radio m-1 ${
                      item.isActive ? 'text-[var(--custom)]' : ''
                    }`}
                  >
                    <div
                      className={`checkbox mt-1 ${
                        item.isChecked ? 'active' : ''
                      }`}
                      onClick={() => toggleCheckedState(index)}
                    >
                      {item.isChecked && (
                        <i className="bi bi-check text-white text-lg"></i>
                      )}
                    </div>
                    {item.state}
                  </div>
                ))}
              </div>
            )}

            {focus === 'Countries' && (
              <div className="grid grid-cols-4 mb-4 bg-[var(--secondary)] rounded-[10px] p-3 max-h-[500px] overflow-auto w-full">
                {countries.map((item, index) => (
                  <div
                    key={index}
                    className={`radio m-1 ${
                      item.isActive ? 'text-[var(--custom)]' : ''
                    }`}
                    // onClick={() => selectLevel(index, item, true)}
                  >
                    <div
                      className={`checkbox mt-1 ${
                        item.isChecked ? 'active' : ''
                      }`}
                      onClick={() => toggleCheckedCountry(index)}
                    >
                      {item.isChecked && (
                        <i className="bi bi-check text-white text-lg"></i>
                      )}
                    </div>
                    {item.country}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-center">
              <div
                onClick={() => setShowTargetPlaces(false)}
                className="custom_btn"
              >
                Close
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-5">
        <AdHeader page={2} title="Create Ad Target" />

        <div className="grid sm:grid-cols-2 gap-3 flex-1">
          <div className="flex card_body w-full sm:w-auto flex-col">
            <div className="paymentTableRow">
              <div className="min-w-[100px] paymentTableRowLeft">Category</div>
              <div className="flex-1 p-2">{itemFormData.category}</div>
            </div>
            <div className="paymentTableRow">
              <div className="min-w-[100px] paymentTableRowLeft">Ad Tags</div>
              <div className="flex-1 p-2 flex flex-wrap">
                {itemFormData.tags.map((item, index) => (
                  <span
                    key={index}
                    className="rounded-[25px] mb-1 cursor-pointer py-[1px] px-2 mr-1 text-sm border border-[var(--border)]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="paymentTableRow">
              <div className="min-w-[100px] paymentTableRowLeft">
                Distribution
              </div>
              <div className="flex-1 p-2">{itemFormData.distribution}</div>
            </div>
            {itemFormData.distribution &&
              itemFormData.distribution !== 'International' && (
                <>
                  {itemFormData.distribution !== 'National' ? (
                    <>
                      <div className="paymentTableRow">
                        <div className="min-w-[100px] paymentTableRowLeft">
                          Areas
                        </div>
                        <div className="flex-1 p-2 flex flex-wrap">
                          {selectedArea.map((item, index) => (
                            <span
                              key={index}
                              className="rounded-[25px] mb-1 cursor-pointer py-[1px] px-2 mr-1 text-sm border border-[var(--border)]"
                            >
                              {item.area}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="paymentTableRow">
                        <div className="min-w-[100px] paymentTableRowLeft">
                          State
                        </div>
                        <div className="flex-1 p-2 flex flex-wrap">
                          {itemFormData.distribution === 'Local' &&
                          !itemFormData.state ? (
                            <span className="text-sm text-[var(--custom)]">
                              Please click customize target area to select state
                            </span>
                          ) : (
                            <span>{itemFormData.state}</span>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="paymentTableRow">
                      <div className="min-w-[100px] paymentTableRowLeft">
                        States
                      </div>
                      <div className="flex-1 p-2 flex flex-wrap">
                        {selectedStates.map((item, index) => (
                          <span
                            key={index}
                            className="rounded-[25px] mb-1 cursor-pointer py-[1px] px-2 mr-1 text-sm border border-[var(--border)]"
                          >
                            {item.state}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            <div className="paymentTableRow">
              <div className="min-w-[100px] paymentTableRowLeft">Country</div>
              <div className="flex-1 p-2 flex flex-wrap">
                {itemFormData.country}
              </div>
            </div>
            {selectedCountries.length > 0 && (
              <div className="flex justify-start border-b border-b-[var(--border)]">
                <div className="min-w-[100px] paymentTableRowLeft">
                  Countries
                </div>
                <div className="flex-1 p-2 flex flex-wrap">
                  {selectedCountries.map((item, index) => (
                    <span
                      key={index}
                      className="rounded-[25px] mb-1 cursor-pointer py-[1px] px-2 mr-1 text-sm border border-[var(--border)]"
                    >
                      {item.country}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="card_body w-full sm:w-auto">
            <div className="grid grid-lay">
              <div className="flex flex-col relative">
                <label className="label" htmlFor="">
                  Ad Category
                </label>
                <div className="relative">
                  <input
                    className="form-input"
                    name="category"
                    value={itemFormData.category}
                    onChange={(e) => {
                      setItemForm('category', e.target.value)
                      setChanged(true)
                    }}
                    type="text"
                    placeholder="Eg Food, Phone, Motivational, Politics, etc"
                  />
                </div>
              </div>

              <div className="flex flex-col relative">
                <label className="label" htmlFor="">
                  Ad Tags
                </label>
                <div className="relative">
                  <input
                    className="form-input"
                    name="tag"
                    value={tag}
                    onChange={handleTagChange}
                    type="text"
                    placeholder="Eg Food, Phone, Motivational, Politics, etc"
                  />
                </div>
                {itemFormData.tags.length > 0 && (
                  <div className="flex flex-wrap mb-1">
                    {itemFormData.tags.map((item, index) => (
                      <span
                        onClick={() => {
                          AdStore.setState((prev) => {
                            const updatedTags = (
                              prev.itemFormData?.tags || []
                            ).filter((_, i) => i !== index)
                            return {
                              ...prev,
                              itemFormData: {
                                ...prev.itemFormData,
                                tags: updatedTags,
                              },
                            }
                          })
                          setChanged(true)
                        }}
                        key={index}
                        className="rounded-[25px] mb-1 cursor-pointer py-[1px] px-2 mr-1 text-sm border border-[var(--border)]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                )}
                {itemFormData.tags.length > 0 && (
                  <div className="text-[12px] text-[var(--custom)]">
                    Click on any tags above to remove it.
                  </div>
                )}
              </div>

              <div className="flex flex-col relative">
                <label className="label flex items-center w-full" htmlFor="">
                  Ad Distribution{' '}
                  <span className="ml-auto">{itemFormData.country}</span>
                </label>
                <div
                  onClick={() => setDistributionList(!isDistributionList)}
                  className="form-input cursor-pointer"
                >
                  {itemFormData.distribution
                    ? itemFormData.distribution
                    : 'Select Ad Distribution'}{' '}
                  <i className="ml-auto bi bi-caret-down-fill"></i>
                </div>
                {isDistributionList && (
                  <div className="input_drop">
                    {distributions.map((item, index) => (
                      <div
                        onClick={() => {
                          setDistributionList(false)
                          setItemForm('distribution', item)
                          setChanged(true)
                        }}
                        key={index}
                        className="input_drop_list"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {itemFormData.distribution && (
                <div
                  onClick={() => setShowTargetPlaces(true)}
                  className="flex items-end flex-col relative"
                >
                  <div className="custom_btn center">
                    {`Customise Target ${focus}`}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card_body mt-auto flex justify-end">
        <Link
          href={'/utils/ads/create-ads'}
          className="custom_btn ml-auto mr-3"
        >
          Go Back
        </Link>
        {loadingAds ? (
          <div className={`custom_btn neutral disabled`}>Processing</div>
        ) : isCompleted && changed ? (
          <div onClick={handleSubmit} className={`custom_btn neutral`}>
            Save & Proceed
          </div>
        ) : isCompleted && !changed ? (
          <Link href={'/utils/ads/ad-payment'} className={`custom_btn neutral`}>
            Next
          </Link>
        ) : (
          <div className={`custom_btn neutral disabled`}>Save & Proceed</div>
        )}
      </div>
    </>
  )
}

export default CreateUserAd
