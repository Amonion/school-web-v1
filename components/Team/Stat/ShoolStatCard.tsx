'use client'
import Image from 'next/image'
import Link from 'next/link'
import { School, School2, ShieldQuestionIcon, VerifiedIcon } from 'lucide-react'
import { useEffect } from 'react'
import { useTheme } from '@/context/ThemeProvider'
import { MessageStore } from '@/src/zustand/notification/Message'
import UserStatStore from '@/src/zustand/user/UsersStat'

const ShoolStatCard: React.FC = () => {
  const { theme } = useTheme()
  const { schoolStats, getSchoolStats } = UserStatStore()
  const { setMessage } = MessageStore()

  useEffect(() => {
    getSchoolStats(`/user-stats/schools`, setMessage)
  }, [])

  return (
    <>
      <div className="lg:grid-cols-4 xs:grid-cols-2 grid-cols-1 grid gap-2 mb-5">
        <div className="stat_card">
          <div className="flex justify-between mb-2">
            <div className="w-9 h-9 bg-[var(--secondary)] rounded-full flex justify-center items-center mr-2">
              <School className="text-sm text-[var(--success)]" />{' '}
            </div>
            <div className="flex items-start">
              <i className="bi bi-arrow-up-right mr-1"></i>
              <div className="text-sm">
                {schoolStats.totalSchools && (
                  <div className="text-[var(--success)]">
                    {parseFloat(schoolStats.totalSchoolIncrease.toFixed(2))}%
                  </div>
                )}
                <div>monthly increase</div>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div className="mr-1">
              <div className="text-[--success] text-lg font-semibold">
                {schoolStats.totalSchools}
              </div>
              <Link href={`/team/schools/table/`}>Total Schools</Link>
            </div>
            <div className="mb-1 rounded-b-[5px] overflow-hidden">
              <Image
                style={{ height: '50px', width: 'auto' }}
                src={`${
                  theme === 'light'
                    ? '/images/graph.png'
                    : '/images/graph_dark.png'
                }`}
                loading="lazy"
                sizes="100vw"
                className="flex-1"
                width={0}
                height={0}
                alt="graph"
              />
            </div>
          </div>
        </div>
        <div className="stat_card">
          <div className="flex justify-between mb-2">
            <div className="w-9 h-9 bg-[var(--secondary)] rounded-full flex justify-center items-center mr-2">
              <VerifiedIcon className="text-sm text-[var(--blue)]" />
            </div>
            <div className="flex items-start">
              <i className="bi bi-arrow-up-right mr-1"></i>
              <div className="text-sm">
                <div className="text-[var(--blue)]">
                  {' '}
                  {parseFloat(schoolStats.verifiedSchoolIncrease.toFixed(2))}%
                </div>
                <div>monthly increase</div>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div className="mr-1">
              <div className="text-[--blue] text-lg font-semibold">
                {schoolStats.verifiedSchools}
              </div>
              <Link
                className="line-clamp-1 overflow-ellipsis"
                href={`/team/schools/table/?isVerified=true`}
              >
                Verified Schools
              </Link>
            </div>
            <div className="mb-1 rounded-b-[5px] overflow-hidden">
              <Image
                style={{ height: '50px', width: 'auto' }}
                src={`${
                  theme === 'light'
                    ? '/images/graphblue.png'
                    : '/images/graphblue.png'
                }`}
                loading="lazy"
                sizes="100vw"
                className="flex-1"
                width={0}
                height={0}
                alt="graph"
              />
            </div>
          </div>
        </div>
        <div className="stat_card">
          <div className="flex justify-between mb-2">
            <div className="w-9 h-9 bg-[var(--secondary)] rounded-full flex justify-center items-center mr-2">
              <ShieldQuestionIcon className="text-sm text-red-500" />
              {/* <PersonStanding/> */}
            </div>
            <div className="flex items-start">
              <i className="bi bi-arrow-up-right mr-1"></i>
              <div className="text-sm">
                <div className="text-red-500">
                  {parseFloat(schoolStats.newSchoolIncrease.toFixed(2))}%
                </div>
                <div>monthly increase</div>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div className="mr-1">
              <div className="text-red-500 text-lg font-semibold">
                {schoolStats.newSchools}
              </div>
              <Link
                className="line-clamp-1 overflow-ellipsis"
                href={`/team/schools/table/?isNew=true`}
              >
                New Schools
              </Link>
            </div>
            <div className="mb-1 rounded-b-[5px] overflow-hidden">
              <Image
                style={{ height: '50px', width: 'auto' }}
                src={`${
                  theme === 'light'
                    ? '/images/graphred.png'
                    : '/images/graphred.png'
                }`}
                loading="lazy"
                sizes="100vw"
                className="flex-1"
                width={0}
                height={0}
                alt="graph"
              />
            </div>
          </div>
        </div>
        <div className="stat_card">
          <div className="flex justify-between mb-2">
            <div className="w-9 h-9 bg-[var(--secondary)] rounded-full flex justify-center items-center mr-2">
              <School2 className="text-sm text-[var(--custom)]" />
            </div>
            <div className="flex items-start">
              <i className="bi bi-arrow-up-right mr-1"></i>
              <div className="text-sm">
                <div className="text-[var(--custom)]">
                  {parseFloat(schoolStats.recordedSchoolIncrease.toFixed(2))}%
                </div>
                <div>monthly increase</div>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div className="mr-1">
              <div className="text-[--custom] text-lg font-semibold">
                {schoolStats.recordedSchools}
              </div>
              <Link
                href={`/team/schools/table/?isRecorded=true`}
                className="line-clamp-1 overflow-ellipsis"
              >
                Recorded Schools
              </Link>
            </div>
            <div className="mb-1 rounded-b-[5px] overflow-hidden">
              <Image
                style={{ height: '50px', width: 'auto' }}
                src={`${
                  theme === 'light'
                    ? '/images/graphcustom.png'
                    : '/images/graphcustom.png'
                }`}
                loading="lazy"
                sizes="100vw"
                className="flex-1"
                width={0}
                height={0}
                alt="graph"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ShoolStatCard
