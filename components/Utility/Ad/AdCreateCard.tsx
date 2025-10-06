'use client'
import { useState } from 'react'
import AdCard from '@/components/Utility/Ad/AdCard'
import { Post, PostEmpty } from '@/src/zustand/post/Post'
import AdStore from '@/src/zustand/finance/Ad'

const AdCreateCard: React.FC = () => {
  const { itemFormData } = AdStore()
  const [adPost] = useState<Post>(PostEmpty)

  return (
    <div className="flex card_body overflow-auto w-full sm:w-auto flex-col items-center">
      <AdCard
        post={{
          ...adPost,
          picture: String(itemFormData.picture),
          displayName: itemFormData.displayName,
          username: itemFormData.username,
          content: itemFormData.description,
          media: itemFormData.media,
        }}
      />
    </div>
  )
}

export default AdCreateCard
