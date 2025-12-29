import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { NavStore } from '@/src/zustand/notification/Navigation'
import { BioUserSchoolInfoStore } from '@/src/zustand/user/BioUserSchoolInfo'
import { AccountStore } from '@/src/zustand/Trace/Account'
import { PostStore } from '@/src/zustand/Trace/TracePosts'

export default function TraceHeader() {
  const { toggleVNav } = NavStore()
  const { postSearchtext, setSearchedPosts, setText } = PostStore()
  const { setSearchedBioUserResult } = BioUserSchoolInfoStore()
  const { setSearchedAccountResult } = AccountStore()
  const pathName = usePathname()
  const router = useRouter()

  const handleSearch = () => {
    const params = new URLSearchParams(window.location.search)
    if (pathName === '/home/trace') {
      if (postSearchtext.trim()) {
        params.set('q', postSearchtext.trim())
        setSearchedPosts()
      } else {
        params.delete('q')
      }
    } else if (pathName === '/home/trace/people') {
      setSearchedBioUserResult()
    } else if (pathName === '/home/trace/accounts') {
      setSearchedAccountResult()
    }
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const handleSetText = (e: string) => {
    if (pathName === '/home/trace') {
      setText(e)
    } else if (pathName === '/home/trace/people') {
      setSearchedBioUserResult()
    } else if (pathName === '/home/trace/accounts') {
      setSearchedAccountResult()
    }
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
          <i className="bi bi-sliders cursor-pointer mr-3"></i>
          <input
            type="search"
            onChange={(e) => {
              handleSetText(e.target.value)
            }}
            className={`bg-[var(--secondary)] border-none outline-none flex-1`}
            placeholder={
              pathName.includes('/home/questions')
                ? `Search for questions...`
                : 'Search your thoughts...'
            }
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
      {!pathName.includes('/home/questions') && (
        <div className="overflow-auto w-full flex-1">
          <div className="justify-center pl-2 flex">
            <Link
              href={'/home/trace'}
              className={`${
                pathName === '/home/trace'
                  ? 'bg-[var(--custom)] text-white'
                  : 'bg-[var(--secondary)]'
              } tracePill`}
            >
              Posts
            </Link>
            <Link
              href={'/home/trace/people'}
              className={`${
                pathName === '/home/trace/people'
                  ? 'bg-[var(--custom)] text-white'
                  : 'bg-[var(--secondary)]'
              } tracePill`}
            >
              People
            </Link>
            <Link
              href={'/home/trace/accounts'}
              className={`${
                pathName === '/home/trace/accounts'
                  ? 'bg-[var(--custom)] text-white'
                  : 'bg-[var(--secondary)]'
              } tracePill`}
            >
              Accounts
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
