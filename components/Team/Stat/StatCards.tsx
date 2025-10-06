'use client'
import Image from 'next/image'
import Link from 'next/link'
import { ShieldQuestionIcon, Users, Verified, Wifi } from 'lucide-react'
import { useEffect } from 'react'
import { useTheme } from '@/context/ThemeProvider'
import { MessageStore } from '@/src/zustand/notification/Message'
import UserStatStore from '@/src/zustand/user/UsersStat'

const StatCard: React.FC = () => {
  const { theme } = useTheme()
  const { userStats, getStats } = UserStatStore()
  const { setMessage } = MessageStore()

  useEffect(() => {
    getStats(`/user-stats`, setMessage)
  }, [])

  return (
    <>
      <div className="lg:grid-cols-4 xs:grid-cols-2 grid-cols-1 grid gap-2 mb-5">
        <div className="stat_card">
          <div className="flex justify-between mb-2">
            <div className="w-9 h-9 bg-[var(--secondary)] rounded-full flex justify-center items-center mr-2">
              <Users className="text-sm text-[var(--success)]" />{' '}
            </div>
            <div className="flex items-start">
              <i className="bi bi-arrow-up-right mr-1"></i>
              <div className="text-sm">
                {userStats.totalUsersIncrease && (
                  <div className="text-[var(--success)]">
                    {parseFloat(userStats.totalUsersIncrease.toFixed(2))}%
                  </div>
                )}
                <div>monthly increase</div>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div className="mr-1">
              <div className="text-[--success] text-lg font-semibold">
                {userStats.totalUsers}
              </div>
              <div>Total Users</div>
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
              <Verified className="text-sm text-[var(--blue)]" />
            </div>
            <div className="flex items-start">
              <i className="bi bi-arrow-up-right mr-1"></i>
              <div className="text-sm">
                <div className="text-[var(--blue)]">15%</div>
                <div>monthly increase</div>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div className="mr-1">
              <div className="text-[--blue] text-lg font-semibold">
                {userStats.verifiedUsers}
              </div>
              <Link href={`/team/users/verified`}>Verified Users</Link>
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
                  {parseFloat(userStats.verificationIncrease.toFixed(2))}%
                </div>
                <div>monthly increase</div>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div className="mr-1">
              <div className="text-red-500 text-lg font-semibold">
                {userStats.verifyingUsers}
              </div>
              <Link href={`/team/users/onverification`}>On Process</Link>
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
              <Wifi className="text-sm text-[var(--custom)]" />
            </div>
            <div className="flex items-start">
              <i className="bi bi-arrow-up-right mr-1"></i>
              <div className="text-sm">
                <div className="text-[var(--custom)]">
                  {parseFloat(userStats.onlineIncrease.toFixed(2))}%
                </div>
                <div>monthly increase</div>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div className="mr-1">
              <div className="text-[--custom] text-lg font-semibold">
                {userStats.onlineUsers}
              </div>
              <div>Online Users</div>
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

export default StatCard
