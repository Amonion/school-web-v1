'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import apiRequest, { ApiResponseInterface } from '@/lib/axios'
import { getDeviceInfo } from '@/lib/helpers'
import DownloadApp from '@/components/Public/DownloadApp'
import { ValidationResult } from '@/lib/validateInputs'
const ForgottenPassword: React.FC = () => {
  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<ValidationResult | null>(null)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const { email } = formData
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setGeneralError('Invalid email address')
      return
    }

    setLoading(true)

    const form = new FormData()
    form.append('email', formData.email.toLocaleLowerCase())
    try {
      const response = await apiRequest<ApiResponseInterface>(
        '/users/forgotten-password',
        {
          method: 'POST',
          body: form,
        }
      )
      if (response?.data) {
        localStorage.setItem('success', 'True')
        router.replace('/auth/email-sent')
      }
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
  }

  return (
    <>
      {getDeviceInfo().os === 'Android' || getDeviceInfo().os === 'iOS' ? (
        <DownloadApp />
      ) : (
        <div className="title-sm">Recorver your Account</div>
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
            <div className="text-red-500 text-[12px]">{error.emailMessage}</div>
          )}
        </div>

        {generalError && <div className="sm-response">{generalError}</div>}

        {loading ? (
          <button
            type="button"
            className=" custom-btn"
            style={{ width: '100%' }}
          >
            <i className="bi bi-opencollective spin text-lg mr-3 animate-spin"></i>

            <div>Processing...</div>
          </button>
        ) : (
          <button
            type="submit"
            className="custom-btn "
            style={{ width: '100%' }}
          >
            Submit
          </button>
        )}

        <div className="mt-3">
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

export default ForgottenPassword
