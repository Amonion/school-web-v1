import Link from 'next/link'
import Image from 'next/image'
// import MediaDisplay from "@/components/Users/Media/MediaDisplay";
// import { useAuthStore } from "@/src/zustand/authStore";
import React, { useState, useEffect } from 'react'
import { formatRelativeDate } from '@/lib/helpers'
import PostOptions from './PostOptions'
import { Post } from '@/src/zustand/post/Post'

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
      className="flex mb-[6px] cursor-default"
    >
      {
        <Link
          href={`/home/profile/${post.username}`}
          className="w-12 h-12 rounded-full overflow-hidden mr-3 border border-[var(--border)]"
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
        <div className="flex items-start flex-wrap">
          <div className="flex items-center">
            <Link
              href={`/home/profile/${post.username}`}
              className="account_name mr-2"
            >
              {truncateString(post.displayName, maxLength)}
            </Link>
            {post.isVerified && (
              <i className="bi bi-shield-check verify_icon"></i>
            )}
          </div>
          <PostOptions post={post} />
        </div>
        <div className="flex justify-between">
          <Link
            href={`/home/profile/${post.username}`}
            className="post_username mt-[-8px]"
          >
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
