'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import apiRequest, { ApiResponseInterface } from '@/lib/axios'
import axios from 'axios'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import DownloadApp from './DownloadApp'
import { getDeviceInfo } from '@/lib/helpers'
import { validateSignUp, ValidationResult } from '@/lib/validateInputs'
import { PostStore } from '@/src/zustand/post/Post'
import Spinner from '../LoadingAnimations/Spinner'
const LoginComponent: React.FC = () => {
  const router = useRouter()
  const [route, setRoute] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<ValidationResult | null>(null)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  useEffect(() => {
    if (route === 'onboarding') {
      router.push(`/${route}`)
      window.location.href = `/${route}`
    } else if (route === 'home') {
      router.push(`/${route}`)
      window.location.href = `/${route}`
    }
  }, [route])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const { password, email } = formData
    const validation = validateSignUp(password, email)

    if (!validation.valid) {
      setError(validation)
      return
    }

    setLoading(true)
    const form = new FormData()
    form.append('email', formData.email.trim().toLocaleLowerCase())
    form.append('password', formData.password.trim())

    try {
      setLoading(true)
      const response = await apiRequest<ApiResponseInterface>('/users/login/', {
        method: 'POST',
        body: form,
      })

      if (response.status === 200) {
        const {
          user,
          bioUserSettings,
          bioUser,
          bioUserState,
          bioUserSchoolInfo,
          activeOffice,
          userOffices,
          token,
          posts,
        } = response.data
        AuthStore.getState().login(
          user,
          bioUserSettings,
          bioUser,
          bioUserState,
          bioUserSchoolInfo,
          token
        )
        AuthStore.getState().setOfficeState(activeOffice, userOffices)
        PostStore.setState({ postResults: posts })
        setTimeout(() => {
          if (user.isFirstTime) {
            setRoute('onboarding')
            router.replace('/onboarding')
          } else {
            router.replace('/home')
            setRoute('home')
          }
        }, 100)
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setGeneralError(error.response?.data?.message || 'Login failed')
      } else {
        setGeneralError('Unexpected error occurred')
      }
      setLoading(false)
    }
  }

  return (
    <>
      {getDeviceInfo().os === 'Android' || getDeviceInfo().os === 'iOS' ? (
        <DownloadApp />
      ) : (
        <div className="title-sm">Sign in to your Account</div>
      )}
      <form onSubmit={handleSubmit} className="w-full">
        <div className="w-full mb-3">
          <div className="mb-1">Email</div>
          <div className="form-input">
            <i className="bi bi-envelope-at text-lg"></i>
            <input
              className="transparent-input"
              name="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Enter your email"
              type="email"
            />
          </div>
          {error?.emailMessage && (
            <div className="text-red-500 auth active">{error.emailMessage}</div>
          )}
        </div>

        <div className="w-full mb-3">
          <div className="mb-1">Password</div>
          <div className="form-input">
            <i className="bi bi-shield-lock text-lg"></i>
            <input
              className="transparent-input"
              name="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Enter your password"
              type={`${showPassword ? 'text' : 'password'}`}
            />
            <i
              onClick={togglePasswordVisibility}
              className={`bi ${
                showPassword ? 'bi-eye' : 'bi-eye-slash'
              }  cursor-pointer text-lg ml-auto `}
            ></i>
          </div>
          {error?.passwordMessage && (
            <div className="text-red-500 auth active">
              {error.passwordMessage}
            </div>
          )}
        </div>

        <div className="mb-10 text-center mt-2">
          <div className="f-response-msg auth">
            Forgotten password?
            <Link
              href="/forgotten-password"
              className="text-[var(--custom-color)]"
              style={{ display: 'inline-block', marginLeft: '3px' }}
            >
              click here
            </Link>
          </div>
        </div>

        {generalError && <div className="sm-response">{generalError}</div>}

        {loading ? (
          <button
            type="button"
            className="custom-btn "
            style={{ width: '100%' }}
          >
            <Spinner size={30} />

            <div>Processing...</div>
          </button>
        ) : (
          <button
            type="submit"
            className="custom-btn"
            style={{ width: '100%' }}
          >
            Submit
          </button>
        )}

        <div className="mt-3 text-center">
          Don&apos;t have an account?
          <Link
            href="/sign-up"
            className="text-[var(--custom-color)]"
            style={{ display: 'inline-block', marginLeft: '3px' }}
          >
            create one
          </Link>
        </div>
      </form>
    </>
  )
}

export default LoginComponent
