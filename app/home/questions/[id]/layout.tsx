'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { formatCount, formatDate } from '@/lib/helpers'
import { MessageStore } from '@/src/zustand/notification/Message'
import { useTheme } from '@/context/ThemeProvider'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import ExamStore from '@/src/zustand/exam/Exam'
import Spinner from '@/components/LoadingAnimations/Spinner'

const ExamProfile = ({ children }: { children: React.ReactNode }) => {
  const { id } = useParams()
  const { getExam, exams, examForm } = ExamStore()
  const { setMessage } = MessageStore()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { theme } = useTheme()
  const pathname = usePathname()
  const { bioUserState } = AuthStore()

  useEffect(() => {
    if (exams.length === 0) {
      getExam(`/competitions/exams/${id}`, setMessage)
    } else {
      ExamStore.setState((prev) => {
        const exam = prev.exams.find((item) => item._id === id)
        return {
          examForm: exam,
        }
      })
    }
  }, [id])

  const startPaper = () => {
    if (examForm.questions === 0) {
      setMessage('There is 0 questions in this paper, please try again.', false)
      return
    }
    if (
      bioUserState &&
      bioUserState.examAttempts >= 5 &&
      !bioUserState.isVerified
    ) {
      setMessage(
        'You have reached your limit of 5 attempts, please verify your account at verification menu to continue with unlimited attempts.',
        false
      )
      return
    } else {
      setLoading(true)
      router.push(`/home/questions/test/${id}`)
    }
  }

  return (
    <div className="pb-[55px] sm:pb-0">
      <div className="w-full bg-[var(--white)] mb-1 overflow-hidden">
        <div className=" w-full overflow-hidden relative h-[200px] xs:h-[250px]  bg-[var(--white)]">
          <div className=" flex absolute w-full h-full items-start justify-start p-3 bg-gradient-to-b from-black/50 to-transparent"></div>
          {examForm.picture ? (
            <Image
              src={String(examForm.picture)}
              loading="lazy"
              sizes="100vw"
              className="w-full h-full object-cover"
              width={100}
              height={100}
              alt={examForm.name}
            />
          ) : (
            <Image
              src={`${
                theme === 'dark'
                  ? '/images/DLogoback.png'
                  : '/images/Logoback.png'
              }`}
              loading="lazy"
              sizes="100vw"
              className="w-full h-full object-cover"
              width={100}
              height={100}
              alt={examForm.name}
            />
          )}
        </div>
        <div className="px-[10px] ">
          <div className="flex flex-wrap mb-3">
            <div className="relative w-[74px] flex items-center justify-center min:w-[70px] h-[74px] mr-5 mt-[-35px] rounded-full border-2 border-[var(--custom-color)]">
              <div className="bg-[var(--white-gray)] flex w-[70px] h-[70px] border-2 border-white rounded-full overflow-hidden relative">
                {examForm?.logo ? (
                  <Image
                    src={String(examForm.logo)}
                    loading="lazy"
                    sizes="100vw"
                    className="w-full h-full object-cover"
                    width={100}
                    height={100}
                    alt={examForm.name}
                  />
                ) : (
                  <Image
                    src="/images/cap.png"
                    loading="lazy"
                    sizes="100vw"
                    className="w-auto h-[50px] object-contain m-auto"
                    width={100}
                    height={100}
                    alt="Default Avatar"
                  />
                )}
              </div>
            </div>

            <div className="pr-3 flex items-start sm:items-center w-full sm:w-auto sm:flex-1">
              <div className="flex flex-wrap items-center mr-auto">
                <div className="account_name mr-2">{examForm.title}</div>
                <div className="post_username">@{examForm.name}</div>
              </div>
              {/* <div className="flex items-center ">
            <div className="mr-2">@IMSU</div>
            <div className="post_username">Elect/Elect</div>
          </div> */}
            </div>
          </div>

          <div className="flex items-center mb-3 flex-wrap">
            <div className="flex items-center mr-5">
              <i className="bi bi-calendar-check text-[var(--text-secondary)] mr-1"></i>
              {formatDate(String(examForm.publishedAt))}
            </div>
            <Link
              href={`/home/questions/${id}/details`}
              className="search_btn mr-auto"
            >
              Details
            </Link>

            <div
              onClick={startPaper}
              className="rounded-[25px] flex items-center cursor-pointer bg-[var(--custom-color)] py-[2px] px-5 text-white"
            >
              <div className="flex">{loading && <Spinner size={25} />}</div>
              Start
            </div>
          </div>
          {examForm.instruction && (
            <div className="relative mb-3 w-full">
              <div className="intro_input">{examForm.instruction}</div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between border-b border-b-[var(--border-color)]">
            <Link
              href={`/home/questions/${id}`}
              className={`${
                pathname === `/home/questions/${id}` ? 'active' : ''
              } profile_tab`}
            >
              <div className="text-[var(--text-title-color)] mb-1">
                {formatCount(examForm.participants)}{' '}
              </div>
              <div className="text">Users</div>
            </Link>
            <Link
              href={`/home/questions/${id}/reviews`}
              className={`${
                pathname === `/home/questions/${id}/reviews` ? 'active' : ''
              } profile_tab`}
            >
              <div className="text-[var(--text-title-color)] mb-1">0</div>
              <div className="text">Reviews</div>
            </Link>
            <Link
              href={`/home/questions/${id}/details`}
              className={`${
                pathname === `/home/questions/${id}/details` ? 'active' : ''
              } profile_tab`}
            >
              <div className="text-[var(--text-title-color)] mb-1">0</div>
              <div className="text">Details</div>
            </Link>
          </div>
        </div>
      </div>
      {children}
    </div>
  )
}

export default ExamProfile
