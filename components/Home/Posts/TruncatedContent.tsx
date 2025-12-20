'use client'

import { Post, PostStore } from '@/src/zustand/post/Post'
import { useRouter } from 'next/navigation'
import React, { useMemo, useState } from 'react'

interface Props {
  content: string
  post: Post
  limit?: number
}

const TruncatedContent: React.FC<Props> = ({ content, post, limit = 300 }) => {
  const [showFull, setShowFull] = useState(false)
  const router = useRouter()

  // Remove HTML tags safely
  const plainText = useMemo(() => content.replace(/<[^>]+>/g, ''), [content])

  const isLong = plainText.length > limit

  const displayedText =
    showFull || !isLong ? plainText : plainText.slice(0, limit) + '…'

  const moveToPost = () => {
    PostStore.setState({ postForm: post })
    router.push(`/home/posts/${post._id}`)
  }

  return (
    <div>
      {/* Content */}
      <div onClick={moveToPost} className="cursor-pointer">
        {displayedText}
      </div>

      {/* Toggle button */}
      {isLong && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation() // 🔥 stops navigation
            setShowFull((prev) => !prev)
          }}
          className="text-[var(--custom)] text-sm mt-1"
        >
          {showFull ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  )
}

export default TruncatedContent
