'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Cookies from 'js-cookie'
import apiRequest, { ApiResponseInterface } from '@/lib/axios'
import axios from 'axios'
import { getDeviceInfo } from '@/lib/helpers'
import DownloadApp from '@/components/Public/DownloadApp'
import { validateInputs, ValidationResult } from '@/lib/validateInputs'
import CompanyStore from '@/src/zustand/app/Company'
import Spinner from '@/components/LoadingAnimations/Spinner'

const SignIn: React.FC = () => {
  const router = useRouter()
  const { companyForm } = CompanyStore()
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<ValidationResult | null>(null)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  )
  const [locating, setLocating] = useState(false)
  const [isChecked, setIsChecked] = useState(false)
  const [sFormData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  })
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const { password, email, confirmPassword } = sFormData
    const validation = validateInputs(password, confirmPassword, email)
    if (!validation.valid) {
      setError(validation)
      return
    }

    if (!locating) {
      setGeneralError('Please enable location to continue with signup.')
      setLoading(false)
      return
    }

    if (!isChecked) {
      setGeneralError('Please accept the terms and conditions to continue.')
      return
    }

    setLoading(true)

    const form = new FormData()
    form.append('email', sFormData.email.trim().toLocaleLowerCase())
    form.append('password', sFormData.password.trim())
    form.append('signupOS', getDeviceInfo().os)
    form.append('signupBrowser', getDeviceInfo().browser)
    form.append('signupDevice', getDeviceInfo().device)
    form.append('latitude', String(location?.lat))
    form.append('longitude', String(location?.lng))
    try {
      setLoading(true)
      const response = await apiRequest<ApiResponseInterface>('/users/', {
        method: 'POST',
        body: form,
      })

      if (response.status === 200) {
        Cookies.set('signup_success', 'true', { expires: 0.01 })
        router.replace('/signup-successful/')
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

  const getUserLocation = () => {
    setLocating(true)

    if (!navigator.geolocation) {
      setGeneralError('Geolocation is not supported by your browser.')
      setLocating(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setLocation({ lat: latitude, lng: longitude })
        setLocating(true)
      },
      (error) => {
        console.error('Geolocation error:', error)
        if (error.code === error.PERMISSION_DENIED) {
          setGeneralError('You need to allow location access to continue.')
        } else {
          setGeneralError('Failed to get location. Please try again.')
        }
        setLocating(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  useEffect(() => {
    getUserLocation()
  }, [])
  return (
    <>
      {getDeviceInfo().os === 'Android' || getDeviceInfo().os === 'iOS' ? (
        <DownloadApp />
      ) : (
        <div className="title-sm">Create an Account</div>
      )}
      <form onSubmit={handleSubmit} className="w-full">
        <div className="w-full mb-3">
          <div className="mb-1">Email</div>
          <div className="form-input">
            <i className="bi bi-envelope-at text-lg"></i>
            <input
              className="transparent-input"
              name="email"
              value={sFormData.email}
              onChange={(e) =>
                setFormData({ ...sFormData, email: e.target.value })
              }
              placeholder="Enter your email"
              type="email"
            />
          </div>
          {error?.emailMessage && (
            <div className="text-red-500 text-[12px]">{error.emailMessage}</div>
          )}
        </div>

        <div className="w-full mb-3">
          <div className="mb-1">Password</div>
          <div className="form-input">
            <i className="bi bi-shield-lock text-lg"></i>
            <input
              className="transparent-input"
              name="password"
              value={sFormData.password}
              onChange={(e) =>
                setFormData({ ...sFormData, password: e.target.value })
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
            <div className="text-red-500 text-[12px]">
              {error.passwordMessage}
            </div>
          )}
        </div>

        <div className="w-full mb-3">
          <div className="mb-1">Confirm Password</div>
          <div className="form-input">
            <i className="bi bi-shield-lock text-lg"></i>
            <input
              className="transparent-input"
              name="confirmPassword"
              value={sFormData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...sFormData, confirmPassword: e.target.value })
              }
              placeholder="Confirm your password"
              type={`${showPassword ? 'text' : 'password'}`}
            />
            <i
              onClick={togglePasswordVisibility}
              className={`bi ${
                showPassword ? 'bi-eye' : 'bi-eye-slash'
              }  cursor-pointer text-lg ml-auto `}
            ></i>
          </div>
          {error?.confirmPasswordMessage && (
            <div className="text-red-500 text-[12px] active">
              {error.confirmPasswordMessage}
            </div>
          )}
        </div>

        <div className="mb-2 mt-10">
          {isChecked ? (
            <i
              onClick={() => setIsChecked(false)}
              className="bi bi-check-square mr-2 text-[var(--custom-color)] cursor-pointer"
            ></i>
          ) : (
            <i
              onClick={() => setIsChecked(true)}
              className="bi bi-square mr-2 cursor-pointer"
            ></i>
          )}
          By signing in you have agreed to our
          <Link
            href="/terms-conditions"
            className="text-[var(--custom-color)]"
            style={{ display: 'inline-block', marginLeft: '3px' }}
          >
            terms and conditions
          </Link>
          <div className="f-response-msg auth"></div>
        </div>

        {generalError && <div className="sm-response">{generalError}</div>}

        {loading ? (
          <button
            type="button"
            className=" custom-btn"
            style={{ width: '100%' }}
          >
            <Spinner size={30} />

            <div>Processing...</div>
          </button>
        ) : (
          <>
            {companyForm.allowSignUp ? (
              <button
                type="submit"
                className="custom-btn "
                style={{ width: '100%' }}
              >
                Submit
              </button>
            ) : (
              <button
                type="submit"
                className="text-center rounded-[5px] py-[7px] px-4 flex justify-center text-white bg-slate-500 cursor-not-allowed"
                style={{ width: '100%' }}
              >
                {`Account cannot be created now`}
              </button>
            )}
          </>
        )}

        <div className="mt-3 text-center">
          Already have an account?
          <Link
            href="/sign-in"
            className="text-[var(--custom-color)]"
            style={{ display: 'inline-block', marginLeft: '3px' }}
          >
            sign in
          </Link>
        </div>
      </form>
    </>
  )
}

export default SignIn
