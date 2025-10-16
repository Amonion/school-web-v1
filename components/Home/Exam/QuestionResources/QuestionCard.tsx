import { forwardRef } from 'react'
import { formatCount, formatDate, truncateString } from '@/lib/helpers'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from '@/context/ThemeProvider'
import { Exam } from '@/src/zustand/exam/Exam'

interface QuestionCardProps {
  exam: Exam
}

const QuestionCard = forwardRef<HTMLDivElement, QuestionCardProps>(
  ({ exam }, ref) => {
    const { theme } = useTheme()
    return (
      <>
        <div ref={ref} className="post_card school  w-full xs:flex">
          {
            <Link
              href={`/home/questions/${exam._id}`}
              className="w-full h-[150px] sm:h-[100px] xs:h-[150px] xs:w-[150px] xs:rounded-[10px] rounded-[5px] block overflow-hidden"
            >
              {exam.picture ? (
                <Image
                  style={{ height: '100%', objectFit: 'cover' }}
                  src={`${exam.picture}`}
                  loading="lazy"
                  sizes="100vw"
                  className="w-full h-full object-cover"
                  width={0}
                  height={0}
                  alt={`${exam.title}`}
                />
              ) : (
                <>
                  <Image
                    style={{ height: '100%', objectFit: 'cover' }}
                    src={`${
                      theme === 'dark'
                        ? '/images/DLogoback.png'
                        : '/images/Logoback.png'
                    }`}
                    loading="lazy"
                    sizes="100vw"
                    className="w-full h-full object-cover"
                    width={0}
                    height={0}
                    alt={`${exam.title}`}
                  />
                </>
              )}
            </Link>
          }
          <div className="flex flex-1 flex-wrap xs:px-[10px]">
            <div className="flex flex-wrap w-full mb-3 cursor-default">
              <div className="flex-1">
                <div className="pt-1 xs:pt-0 flex items-center flex-wrap">
                  <Link
                    href={`/home/questions/${exam._id}`}
                    className="account_name mr-2"
                  >
                    {truncateString(exam.title, 150)}
                  </Link>
                  <Link
                    href={`/home/exam/${exam._id}`}
                    className="post_username "
                  >
                    @{exam.name}
                  </Link>
                </div>
                <div className="flex flex-wrap items-center justify-between">
                  <div className="flex flex-wrap text-xs items-center my-1">
                    {exam.countries.slice(0, 3).map((country, index) => (
                      <div key={country} className="flex items-center mr-[2px]">
                        <div className="">{country}</div>
                        {exam.countries.length > 1 &&
                          index !== exam.countries.length - 1 &&
                          index !== 2 && <div className="profile_dot"></div>}
                      </div>
                    ))}
                    {exam.countries.length > 3 && (
                      <div className="font-bold text-lg text-[var(--custom)]">
                        +
                      </div>
                    )}
                  </div>
                  <Link
                    href={`/home/questions/${exam._id}`}
                    className="follow_btn"
                  >
                    Start
                  </Link>
                </div>
              </div>
            </div>

            <div className="flex justify-between text-sm flex-wrap items-center w-full">
              <div className="flex items-center flex-wrap mr-4">
                <div className="flex mr-4 items-center">
                  <i className="bi bi-question-circle mr-1"></i>{' '}
                  {exam.questions}
                </div>
                <div className="flex mr-4 items-center">
                  <i className="bi bi-hourglass mr-1"></i>
                  {exam.duration} mins
                </div>
                <div className="flex items-center">
                  <i className="bi bi-people mr-1"></i>{' '}
                  {formatCount(exam.participants)}
                </div>
              </div>
              <div className="">{formatDate(String(exam.publishedAt))}</div>
            </div>
          </div>
        </div>
      </>
    )
  }
)

// export default QuestionCard;
QuestionCard.displayName = 'QuestionCard'

export default QuestionCard
