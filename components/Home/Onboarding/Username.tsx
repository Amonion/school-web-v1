'use client'
import { useState } from 'react'
import apiRequest from '@/lib/axios'
import _debounce from 'lodash/debounce'
import { MessageStore } from '@/src/zustand/notification/Message'
import { UserStore } from '@/src/zustand/user/User'
import { FetchResponse } from '@/lib/helpers'

const Username = () => {
  const { setMessage } = MessageStore()
  const { userForm, setForm } = UserStore()
  const [avatar, setAvatar] = useState<string | null>(null)
  const [isLoadin, setIsLoadin] = useState(false)

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      if (file) {
        setForm('picture', file)
      }
      const imageUrl = URL.createObjectURL(file)
      setAvatar(imageUrl)
    }
  }

  const validateUsername = (username: string) => {
    const regex = /^[\w!@#$%^&*()_+={}[\]:;"'<>,.?/|\\~`]+$/

    if (regex.test(username)) {
      return { valid: true, message: 'Valid username' }
    } else {
      return {
        valid: false,
        message:
          'Invalid username. It should contain only alphanumeric characters, underscore or special symbols without spaces or hyphens.',
      }
    }
  }

  const handleUsernameSearch = _debounce(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      const validation = validateUsername(value)
      if (!validation.valid) {
        setMessage(validation.message, false)
        setIsLoadin(false)
        return
      }
      setIsLoadin(true)

      const response = await apiRequest<FetchResponse>(
        `/users/username/${value}`
      )

      const results = response?.data
      if (results) {
        setIsLoadin(false)
        setMessage('Sorry! This username is already taken', false)
        userForm.username = ''
      } else {
        setIsLoadin(false)
        setMessage('Great! The username is available', true)
        setForm('username', value)
      }
    },
    1000
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(name as keyof typeof userForm, value)
  }

  return (
    <div className="welcome_slide">
      <div className="title">CREATE </div>
      <div className="text-sm">YOUR</div>
      <div className="sm:text-4xl text-2xl text-[var(--custom-color)] font-bold mb-8">
        SOCIAL IDENTITY
      </div>

      <div className="w-full text-start">
        <div className="flex flex-col relative mb-3">
          <label className="label mb-1" htmlFor="">
            Username (cannot be edited after created)
          </label>
          <div className="relative">
            <input
              className="form-input"
              name="username"
              onChange={handleUsernameSearch}
              type="text"
              placeholder="Enter your username"
            />
            {isLoadin && (
              <i className="bi bi-opencollective absolute top-1 right-1 loading text-[var(--custom-color)]"></i>
            )}
          </div>
        </div>

        <div className="flex flex-col ">
          <label className="label mb-1" htmlFor="">
            Display Name (can be edited anytime)
          </label>
          <input
            className="form-input "
            name="displayName"
            value={userForm.displayName}
            onChange={handleInputChange}
            type="text"
            placeholder="Enter your display name"
          />
        </div>

        <div className="flex flex-col my-5 items-center">
          <label
            htmlFor="avatar-upload"
            className="relative group cursor-pointer"
          >
            <div className="w-24 h-24 rounded-full border-2 border-[var(--border)] overflow-hidden">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-[var(--custom-color)]">
                  <span className="text-white">Upload</span>
                </div>
              )}
            </div>
          </label>
          <div className="text-center w-full mt-2">Profile Picture</div>
          <input
            type="file"
            id="avatar-upload"
            className="hidden"
            name="picture"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>
      </div>
    </div>
  )
}

export default Username
