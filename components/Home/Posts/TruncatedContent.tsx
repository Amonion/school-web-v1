import { Post, PostStore } from '@/src/zustand/post/Post'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

interface Props {
  content: string
  post: Post
  limit?: number
}

const TruncatedContent: React.FC<Props> = ({ content, post, limit = 300 }) => {
  const [showFull, setShowFull] = useState(false)
  const router = useRouter()

  const plainText = content.replace(/<[^>]+>/g, '')
  const isLong = plainText.length > limit

  const toggleContent = () => setShowFull((prev) => !prev)

  const htmlToDisplay =
    showFull || !isLong ? content : content.substring(0, 2000) + '...'

  const moveToPost = (id: string) => {
    PostStore.setState({ postForm: post })
    router.push(`/home/posts/${id}`)
  }
  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
      }}
    >
      <div
        onClick={() => moveToPost(post._id)}
        dangerouslySetInnerHTML={{
          __html: htmlToDisplay,
        }}
      />

      {isLong && (
        <button onClick={toggleContent} className="text-[var(--custom)]">
          {showFull ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  )
}

export default TruncatedContent
