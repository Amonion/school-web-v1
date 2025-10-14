'use client'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MessageStore } from '@/src/zustand/notification/Message'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { UserStore } from '@/src/zustand/user/User'
import { FetchUser } from '@/src/zustand/user/BioUser'
import apiRequest from '@/lib/axios'
import CountryStore, { Country } from '@/src/zustand/place/CountryOrigin'
import StateStore from '@/src/zustand/place/StateOrigin'
import { PostStore } from '@/src/zustand/post/Post'
import NewsStore from '@/src/zustand/news/News'
import CompanyStore from '@/src/zustand/app/Company'
import Spinner from '@/components/LoadingAnimations/Spinner'

const Final = () => {
  const { setMessage } = MessageStore()
  const { userForm } = UserStore()
  const { companyForm, loading } = CompanyStore()
  const { countries, getCountries } = CountryStore()
  const { states, getStates } = StateStore()
  const { user } = AuthStore()
  const [country, setCountry] = useState('')
  const [state, setState] = useState('')
  const [status, setStatus] = useState('Creating your account')
  const [isCountryList, setCountryList] = useState(false)
  const [isStateList, setStateList] = useState(false)
  const [inProcess, setInProcess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (countries.length === 0) {
      getCountries(
        `/places/countries/?country=&page_size=350&field=country&sort=country`,
        setMessage
      )
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!country) {
      setMessage('Please select country to continue', false)
      return
    }
    if (!state) {
      setMessage('Please select state to continue', false)
      return
    }
    const form = new FormData()
    form.append('username', userForm.username.trim())
    form.append('picture', userForm.picture)
    form.append('displayName', userForm.displayName.trim())
    form.append('country', country.trim())
    form.append('state', state.trim())
    if (user) {
      form.append('userId', user?._id)
    }
    setInProcess(true)

    try {
      const response = await apiRequest<FetchUser>('/users/create-account', {
        method: 'POST',
        body: form,
        setMessage,
      })
      if (response && response.data) {
        const { user, posts, featuredNews } = response.data
        AuthStore.getState().setUser(user)
        PostStore.setState({ postResults: posts })
        NewsStore.setState({ featuredNews: featuredNews })
        setStatus('Routing you to home page')
        if (AuthStore.getState().user) {
          router.replace('/home/')
        }
      }
    } catch (error) {
      setInProcess(false)
      console.log(error)
    }
  }

  const selectCountry = (country: Country) => {
    setCountry(country.country)
    setCountryList(false)
    getStates(
      `/places/state/?country=${country.country}&page_size=350&field=state&sort=state`,
      setMessage
    )
  }

  const selectState = (state: string) => {
    setState(state)
    setStateList(false)
  }

  return (
    <div className="welcome_slide pb-[50px] z-30 w-full">
      <div className="title">READY </div>
      <div className="text-sm">TO</div>
      <div className="sm:text-4xl text-xl text-[var(--custom-color)] font-bold mb-4 sm:mb-8">
        SOCIALIZE?
      </div>

      <div className="text-center text-lg mb-3 text-[var(--text-secondary)]">
        Set your preferred place of socialization
      </div>
      <div className="grid sm:grid-cols-2 gap-1 sm:gap-4 w-full">
        <div className="flex flex-col relative mb-4">
          <label className="label flex items-center w-full" htmlFor="">
            Social Country
          </label>
          <div
            onClick={() => {
              setCountryList(!isCountryList)
              setStateList(false)
            }}
            className="form-input cursor-pointer"
          >
            {country ? country : user?.country}
            <i className="ml-auto bi bi-caret-down-fill"></i>
          </div>

          {isCountryList && (
            <div className="w-full z-30 absolute left-0 top-[70px] border border-[var(--border)] bg-[var(--primary)] max-h-[300px] overflow-auto rounded-[5px] search">
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
        <div className="flex flex-col relative mb-4">
          <label className="label flex items-center w-full" htmlFor="">
            Social State
          </label>
          <div
            onClick={() => {
              setStateList(!isStateList)
            }}
            className="form-input cursor-pointer"
          >
            {state ? state : 'Select State'}
            <i className="ml-auto bi bi-caret-down-fill"></i>
          </div>

          {isStateList && (
            <div className="w-full z-40 absolute left-0 top-[70px] border border-[var(--border)] bg-[var(--primary)] max-h-[300px] overflow-auto rounded-[5px] search">
              {states.map((item, index) => (
                <div
                  onClick={() => selectState(item.state)}
                  key={index}
                  className="input_drop_list"
                >
                  {item.state}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex w-full justify-center my-3">
          <i className="bi bi-opencollective loading text-[var(--custom-color)]"></i>
        </div>
      ) : (
        <div>
          {companyForm && companyForm.finalInstruction && (
            <div
              dangerouslySetInnerHTML={{
                __html: companyForm.finalInstruction,
              }}
            ></div>
          )}
        </div>
      )}

      <div className="flex justify-center w-full my-6">
        {!inProcess ? (
          <div onClick={handleSubmit} className="custom_btn neutral">
            Create Account
          </div>
        ) : (
          <div className="custom_btn neutral">
            <Spinner size={30} />
            {status}
          </div>
        )}
      </div>
    </div>
  )
}

export default Final
