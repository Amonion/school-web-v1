import Link from 'next/link'
import Image from 'next/image'
// import MediaDisplay from "@/components/Users/Media/MediaDisplay";
// import { useAuthStore } from "@/src/zustand/authStore";
import React, { useState, useEffect } from 'react'
import { Post } from '@/src/interface/user/interface'
import { formatRelativeDate } from '@/lib/helpers'
import PostOptions from './PostOptions'

interface PostProps {
  post: Post
}
const PostHeader: React.FC<PostProps> = ({ post }) => {
  const [maxLength, setMaxLength] = useState(20)
  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth

      if (screenWidth > 370) {
        const num = Math.floor((screenWidth - 370) / 10)
        setMaxLength(20 + num)
      } else {
        setMaxLength(20)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  function truncateString(input: string, maxLength: number): string {
    if (input.length > maxLength) {
      return input.substring(0, maxLength) + '...'
    }
    return input
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
      }}
      className="flex mb-3 cursor-default"
    >
      {
        <Link
          href={`/profile/${post.userId}`}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden mr-3"
        >
          <Image
            style={{ height: '100%', objectFit: 'cover' }}
            src={`${post.picture || '/avatar.png'}`}
            loading="lazy"
            sizes="100vw"
            className="w-full h-full object-cover"
            width={0}
            height={0}
            alt={`${post.username}`}
          />
        </Link>
      }
      <div className="flex-1">
        <div className="flex items-center flex-wrap">
          <Link href={`/profile/${post.userId}`} className="account_name mr-1">
            {truncateString(post.displayName, maxLength)}
          </Link>
          <i className="bi bi-shield-check verify_icon"></i>
          <PostOptions post={post} />
        </div>
        <div className="flex justify-between">
          <Link href={`/profile/${post.userId}`} className="post_username ">
            @{post.username}
          </Link>

          {post.createdAt && (
            <div className="text-sm">{formatRelativeDate(post.createdAt)} </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PostHeader
