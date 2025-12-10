'use client'
import Spinner from './LoadingAnimations/Spinner'

type ButtonProps = {
  label: string
  loading: boolean
  onClick?: () => void
}

const CustomBtn = ({ label, loading, onClick }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      type="button"
      disabled={loading}
      className={`custom_btn ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={{ width: '100%' }}
    >
      {loading ? <Spinner size={30} /> : <div>{label}</div>}
    </button>
  )
}

export default CustomBtn
