'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MessageStore } from '@/src/zustand/notification/Message'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { UserStore } from '@/src/zustand/user/User'
import { AppStore } from '@/src/zustand/app/AppStore'
import { FetchUser } from '@/src/zustand/user/BioUser'
import apiRequest from '@/lib/axios'

const Final = () => {
  const { setMessage } = MessageStore()
  const { userForm } = UserStore()
  const { getApp, appForm, loading } = AppStore()
  const { user } = AuthStore()
  const [inProcess, setInProcess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    getApp(`/company`, setMessage)
    console.log('User id is: ', user?._id)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = new FormData()
    form.append('username', userForm.username.trim())
    form.append('picture', userForm.picture)
    form.append('displayName', userForm.displayName.trim())
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
        const { user } = response.data
        AuthStore.getState().setUser(user)
        setInProcess(false)
        if (AuthStore.getState().user) {
          router.replace('/home/')
        }
      }
    } catch (error) {
      setInProcess(false)
      console.log(error)
    }
  }

  return (
    <div className="welcome_slide">
      <div className="title">READY </div>
      <div className="text-sm">TO</div>
      <div className="sm:text-4xl text-2xl text-[var(--custom-color)] font-bold mb-8">
        SOCIALIZE?
      </div>
      {loading ? (
        <div className="flex w-full justify-center my-3">
          <i className="bi bi-opencollective loading text-[var(--custom-color)]"></i>
        </div>
      ) : (
        <div>
          {appForm && appForm.finalInstruction && (
            <div
              dangerouslySetInnerHTML={{
                __html: appForm.finalInstruction,
              }}
            ></div>
          )}
          <div className="flex justify-center w-full my-6">
            {!inProcess ? (
              <div onClick={handleSubmit} className="custom_btn neutral">
                Create Account
              </div>
            ) : (
              <div className="custom_btn neutral">
                <i className="bi bi-opencollective loading "></i>
                Processing...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Final
