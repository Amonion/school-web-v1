'use client'
import React from 'react'
import Image from 'next/image'
import NewsStore from '@/src/zustand/news/News'
import Link from 'next/link'

export default function RelatedNews() {
  const { featuredNews } = NewsStore()

  return (
    <div className="sm:hidden">
      <div className="text-lg mt-4 px-2 sm:px-0">Related News</div>

      <div className="w-full overflow-x-auto py-2 mb-4">
        <div className="flex gap-2 px-2 md:px-0">
          {featuredNews.map((post, idx) => (
            <Link
              href={`/news/${post._id}`}
              key={idx}
              className="w-[250px] flex-shrink-0"
            >
              <div className="w-full h-[200px] mb-2 relative">
                <Image
                  src={String(post.picture)}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="w-full">
                <div className="text-sm font-medium line-clamp-2">
                  {post.title}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
