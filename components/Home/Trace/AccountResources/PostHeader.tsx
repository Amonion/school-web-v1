import Link from 'next/link'
import Image from 'next/image'

import React, { useEffect, useState } from 'react'
import { formatCount, formatDateToDDMMYY } from '@/lib/helpers'
import pluralize from 'pluralize'
import UserStore from '@/src/zustand/users/User'
import { MessageStore } from '@/src/zustand/msgStore'
import { useAuthStore } from '@/src/zustand/authStore'
import { User } from '@/src/interface/team/interface'

interface PostProps {
  userItem: User
}
const PostHeader: React.FC<PostProps> = ({ userItem }) => {
  const { followUserAccount, loading } = UserStore()
  const { setMessage } = MessageStore()
  const { user } = useAuthStore()
  const [id, setId] = useState('')

  const followAccount = (id: string) => {
    setId(id)
    followUserAccount(
      `/users/follow/${id}`,
      { isFolowed: userItem.isFollowed, followerId: user?._id },
      setMessage
    )
  }

  useEffect(() => {
    if (!loading) {
      setId('')
    }
  }, [loading])

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
      }}
      className="flex mb-3 cursor-default"
    >
      {
        <Link
          href={`/home/user/${userItem.username}`}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden mr-3"
        >
          <Image
            style={{ height: '100%', objectFit: 'cover' }}
            src={`${userItem.picture || '/avatar.png'}`}
            loading="lazy"
            sizes="100vw"
            className="w-full h-full object-cover"
            width={0}
            height={0}
            alt={`${userItem.username}`}
          />
        </Link>
      }
      <div className="flex-1">
        <div className="flex items-center flex-wrap">
          <Link
            href={`/home/user/${userItem.username}`}
            className="account_name line-clamp-1 mr-2"
          >
            {userItem.displayName}
          </Link>
          {userItem.isVerified && (
            <i className="bi bi-shield-check verify_icon"></i>
          )}
          <Link
            href={`/home/user/${userItem.username}`}
            className="post_username "
          >
            @{userItem.username}
          </Link>
          <div className="ml-auto text-xs">
            {formatDateToDDMMYY(userItem.createdAt)}
          </div>
        </div>

        <div className="flex justify-between">
          <div className="flex items-center">
            <div className="flex text-sm items-center mr-4">
              <div className="text-[var(--text-title-color)] mr-1">
                {formatCount(Number(userItem?.followers))}{' '}
              </div>{' '}
              {pluralize('Follower', Number(userItem?.followers))}
            </div>
            <div className="flex text-sm items-center ">
              <div className="text-[var(--text-title-color)] mr-1">
                {formatCount(Number(userItem?.following))}{' '}
              </div>{' '}
              Following
            </div>
          </div>
          <div className="flex items-center">
            <Link
              href={`/home/chat/friends/${userItem.username}`}
              className="mr-2"
            >
              <i className="bi bi-envelope text-[var(--custom)] cursor-pointer"></i>
            </Link>
            {loading && userItem._id === id ? (
              <div className="follow_btn normal">
                <div className="flex">
                  <i
                    className={`bi  bi-opencollective loading sm text-[var(--custom-color)]`}
                  ></i>{' '}
                </div>
                processing
              </div>
            ) : (
              <div
                className={`follow_btn normal ${
                  userItem.isFollowed && 'active'
                }`}
                onClick={() => followAccount(userItem._id)}
              >
                {userItem.isFollowed ? `unfollow` : `follow`}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostHeader
