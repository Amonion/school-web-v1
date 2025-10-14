'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import CompanyStore from '@/src/zustand/app/Company'

const Footer: React.FC = () => {
  const { companyForm } = CompanyStore()
  const pathName = usePathname()

  return (
    <div className="flex mt-auto w-full bg-[var(--primary)] justify-center py-3">
      <div className="w-full max-w-[1000px] px-2">
        <div className="flex flex-col sm:flex-row">
          {companyForm && (
            <div className="text-[var(--custom-color)] sm:text-start text-center py-1 text-2xl">
              {companyForm.name}
            </div>
          )}
          <div className="flex sm:ml-auto justify-center sm:justify-start">
            <Link
              href="/terms-conditions"
              className={`${
                pathName.includes('terms') ? 'text-[var(--custom-color)]' : ''
              } mr-3 py-1 hover:text-[var(--custom-color)]`}
            >
              Terms & Conditions
            </Link>
            <Link
              href="/privacy-policy"
              className={`${
                pathName.includes('privacy') ? 'text-[var(--custom-color)]' : ''
              } py-1 hover:text-[var(--custom-color)]`}
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Footer
