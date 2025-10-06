'use client'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { validateInputs } from '@/lib/validation'
import { appendForm } from '@/lib/helpers'
import _debounce from 'lodash/debounce'
import BankStore, { Bank } from '@/src/zustand/finance/Bank'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { MessageStore } from '@/src/zustand/notification/Message'
import CountryStore, { Country } from '@/src/zustand/place/CountryOrigin'
import { BioUserBankStore } from '@/src/zustand/user/BioUserBank'

export default function Finance() {
  const { getBanks, banks } = BankStore()
  const { countries, getCountries } = CountryStore()
  const {
    bioUserBankForm,
    loading,
    setApplicationForm,
    setBioUserBankForm,
    updateBioUserBank,
    getBioUserBank,
  } = BioUserBankStore()

  const { bioUser } = AuthStore()
  const { setMessage } = MessageStore()
  const url = '/users/bio-user/banks/'
  const [isBankList, setBankList] = useState(false)
  const [isCountryList, setCountryList] = useState(false)

  useEffect(() => {
    if (countries.length === 0) {
      getCountries(
        `/places/countries/?country=&page_size=350&field=country&sort=country`,
        setMessage
      )
    }
  }, [])

  useEffect(() => {
    if (!bioUser) return
    getBioUserBank(`${url}${bioUser._id}`, setMessage)
  }, [bioUser])

  const clearInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimeout(() => {
      e.target.value = ''
      setBankList(false)
    }, 1000)
  }

  const selectCountry = (country: Country) => {
    setBioUserBankForm('bankCountry', country.country)
    setBioUserBankForm('bankName', '')
    setCountryList(false)
  }

  const handleSearchBank = _debounce(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      if (!value) {
        setBankList(false)
        return
      }
      setBankList(true)
      getBanks(
        `/banks/?name=${value}&country=${bioUserBankForm.bankCountry}`,
        setMessage
      )
    },
    1000
  )

  const selectBank = (item: Bank) => {
    setBioUserBankForm('bankName', item.name)
    setBioUserBankForm('bankLogo', String(item.picture))
    setBioUserBankForm('bankUsername', item.username)
    setBioUserBankForm('bankId', item._id)
    setBankList(false)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setBioUserBankForm(name as keyof typeof bioUserBankForm, value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    const inputsToValidate = [
      {
        name: 'bankAccountNumber',
        value: bioUserBankForm.bankAccountNumber,
        rules: { blank: true, minLength: 2 },
        field: 'Account number',
      },
      {
        name: 'bankCountry',
        value: bioUserBankForm.bankCountry,
        rules: { blank: true, minLength: 2 },
        field: 'Bank country',
      },
      {
        name: 'bankAccountName',
        value: bioUserBankForm.bankAccountName,
        rules: { blank: true, minLength: 2 },
        field: 'Account name',
      },
      {
        name: 'bankId',
        value: bioUserBankForm.bankId,
        rules: { blank: true, minLength: 3 },
        field: 'Bank ID',
      },
      {
        name: 'bankLogo',
        value: bioUserBankForm.bankLogo,
        rules: { blank: false },
        field: 'bankLogo ',
      },
      {
        name: 'bankName',
        value: bioUserBankForm.bankName,
        rules: { blank: true, minLength: 3 },
        field: 'Bank name',
      },
      {
        name: 'bankUsername',
        value: bioUserBankForm.bankUsername,
        rules: { blank: true, minLength: 3 },
        field: 'Bank username',
      },
      {
        name: 'isAccountSet',
        value: true,
        rules: { blank: true },
        field: 'Account Set',
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

    updateBioUserBank(`${url}${bioUser?._id}`, data, setMessage)
  }

  return (
    <>
      <div className="round_box mb-5">
        <div className="mb-5 text-sm">
          <span className="mr-2"> Add your account details or</span>
          <span
            onClick={() => setApplicationForm(true)}
            className="text-[var(--custom-color)] cursor-pointer"
          >
            open a new account
          </span>
        </div>

        <div className="flex flex-col relative mb-4">
          <label className="label flex items-center w-full" htmlFor="">
            Country of Bank{' '}
          </label>
          <div
            onClick={() => {
              setCountryList(!isCountryList)
            }}
            className="form-input cursor-pointer"
          >
            {bioUserBankForm.bankCountry
              ? bioUserBankForm.bankCountry
              : 'Select Country'}
            <i className="ml-auto bi bi-caret-down-fill"></i>
          </div>

          {isCountryList && (
            <div className="dropdownList top-[70px]">
              {countries.map((item, index) => (
                <div
                  onClick={() => selectCountry(item)}
                  key={index}
                  className="input_drop_list"
                >
                  {item.countryFlag && (
                    <Image
                      className="mr-3"
                      src={String(item.countryFlag)}
                      alt="Captured"
                      sizes="100vw"
                      width={0}
                      height={0}
                      style={{ width: '60px', maxWidth: '30px' }}
                    />
                  )}
                  {item.country}
                </div>
              ))}
            </div>
          )}
        </div>

        {bioUserBankForm.bankCountry && (
          <div className="relative mb-5">
            <div className={`input_wrap ml-auto active mb-5`}>
              <input
                type="search"
                onChange={handleSearchBank}
                onBlur={clearInput}
                className={`transparent-input flex-1 `}
                placeholder="Search for bank"
              />
              <i className="bi bi-search common-icon cursor-pointer"></i>
            </div>

            {bioUserBankForm.bankName && (
              <div className="mb-5">
                <label className="label flex items-center w-full" htmlFor="">
                  Bank Name{' '}
                </label>
                <div className="form-input">{bioUserBankForm.bankName}</div>
              </div>
            )}

            {isBankList && banks.length > 0 && (
              <div className="input_drop search">
                {banks.map((item, index) => (
                  <div
                    onClick={() => selectBank(item)}
                    key={index}
                    className="input_drop_list"
                  >
                    {item.picture && (
                      <Image
                        className="mr-5"
                        src={String(item.picture)}
                        alt="Captured"
                        sizes="100vw"
                        width={0}
                        height={0}
                        style={{ width: '100px', maxWidth: '50px' }}
                      />
                    )}
                    {item.name}, {item.username}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {bioUserBankForm.bankName && (
          <>
            <div className="grid-2 grid-lay">
              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Account Name
                </label>
                <input
                  className="form-input"
                  name="bankAccountName"
                  value={bioUserBankForm.bankAccountName}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="Enter account name"
                />
              </div>

              <div className="flex flex-col">
                <label className="label" htmlFor="">
                  Account Number
                </label>
                <input
                  className="form-input"
                  name="bankAccountNumber"
                  value={bioUserBankForm.bankAccountNumber}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="Enter account number"
                />
              </div>
            </div>

            {loading ? (
              <div className="btn">
                <i className="bi bi-opencollective loading  text-md"></i>
                <div>Processing...</div>
              </div>
            ) : (
              <>
                <div onClick={handleSubmit} className="btn">
                  Submit
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  )
}
