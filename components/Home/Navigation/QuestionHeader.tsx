import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { NavStore } from '@/src/zustand/notification/Navigation'
import PostDropList from '../Trace/PostResources/PostDropList'
import { BioUserSchoolInfoStore } from '@/src/zustand/user/BioUserSchoolInfo'
import { PostStore } from '@/src/zustand/post/Post'
import AccountStore from '@/src/zustand/Trace/Account'

export default function QuestionHeader() {
  const { setSearchedText, toggleVNav } = NavStore()
  const { setSearchedResult } = PostStore()
  const { setSearchedBioUserResult } = BioUserSchoolInfoStore()
  const { setSearchedAccountResult } = AccountStore()
  const pathName = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [paramText, setParamText] = useState(searchParams.get('q') || '')

  const handleSearch = () => {
    const params = new URLSearchParams(window.location.search)
    if (paramText.trim()) {
      params.set('q', paramText.trim())
    } else {
      params.delete('q')
    }
    router.replace(`?${params.toString()}`)
    if (pathName === '/home/trace') {
      setSearchedResult()
    } else if (pathName === '/home/trace/people') {
      setSearchedBioUserResult()
    } else if (pathName === '/home/trace/accounts') {
      setSearchedAccountResult()
    }
    // else if (pathName === '/home/trace/schools') {
    //   setSearchedSchoolResult()
    // }
  }

  return (
    <div className="bg-[var(--primary)] w-full relative">
      <div className="flex items-center mb-1 w-full overflow-clip">
        <span onClick={toggleVNav} className="headerCircle hfs">
          <i className="bi bi-text-left text-lg text-[var(--text-primary)]"></i>
        </span>
        <span onClick={() => router.back()} className="headerCircle sfm ">
          <i className="bi bi-arrow-left text-lg text-[var(--text-primary)]"></i>
        </span>

        <div
          className={`rounded-[20px] bg-[var(--secondary)] sm:ml-2 h-[40px] w-full flex items-center px-4`}
        >
          {/* <i className="bi bi-sliders cursor-pointer mr-3"></i> */}
          <input
            type="search"
            onChange={(e) => {
              setSearchedText(e.target.value)
              setParamText(e.target.value)
            }}
            className={`bg-[var(--secondary)] border-none outline-none flex-1`}
            placeholder={`Search for questions...`}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSearch()
              }
            }}
          />
        </div>

        <div onClick={handleSearch} className="headerCircle">
          <i className="bi bi-search common-icon "></i>
        </div>
      </div>

      <PostDropList />
    </div>
  )
}
