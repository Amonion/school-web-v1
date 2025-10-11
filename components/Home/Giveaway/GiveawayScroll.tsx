'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, Plus } from 'lucide-react'

type StoryItem = {
  id: string
  type: 'image' | 'video'
  src: string
  preview?: string
  durationMs?: number
}

type Story = {
  id: string
  username: string
  displayName?: string
  picture?: string
  isNew?: boolean
  items: StoryItem[]
}

const DEFAULT_DURATION = 5000
const FADE_MS = 400

// 👇 6 SAMPLE STORIES
const sampleStories: Story[] = [
  {
    id: '1',
    username: 'john_doe',
    displayName: 'John Doe',
    picture: 'https://randomuser.me/api/portraits/men/1.jpg',
    isNew: true,
    items: [
      {
        id: '1a',
        type: 'image',
        src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
      },
      {
        id: '1b',
        type: 'image',
        src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
      },
    ],
  },
  {
    id: '2',
    username: 'sarah_smith',
    displayName: 'Sarah Smith',
    picture: 'https://randomuser.me/api/portraits/women/2.jpg',
    isNew: true,
    items: [
      {
        id: '2a',
        type: 'video',
        src: 'https://www.w3schools.com/html/mov_bbb.mp4',
        preview: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308',
        durationMs: 10000,
      },
    ],
  },
  {
    id: '3',
    username: 'alex',
    picture: 'https://randomuser.me/api/portraits/men/3.jpg',
    items: [
      {
        id: '3a',
        type: 'image',
        src: 'https://images.unsplash.com/photo-1520975698519-59c9c3f0c0b8',
      },
    ],
  },
  {
    id: '4',
    username: 'maya',
    displayName: 'Maya',
    picture: 'https://randomuser.me/api/portraits/women/4.jpg',
    isNew: true,
    items: [
      {
        id: '4a',
        type: 'image',
        src: 'https://images.unsplash.com/photo-1514512364185-4c2b27b37d62',
      },
    ],
  },
  {
    id: '5',
    username: 'leo',
    displayName: 'Leo',
    picture: 'https://randomuser.me/api/portraits/men/5.jpg',
    items: [
      {
        id: '5a',
        type: 'video',
        src: 'https://www.w3schools.com/html/movie.mp4',
        preview: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470',
      },
    ],
  },
  {
    id: '6',
    username: 'nina',
    displayName: 'Nina',
    picture: 'https://randomuser.me/api/portraits/women/6.jpg',
    items: [
      {
        id: '6a',
        type: 'image',
        src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
      },
    ],
  },
]

export default function GiveawayScroll() {
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  const [itemIdx, setItemIdx] = useState(0)
  const [paused, setPaused] = useState(false)

  const openStory = (idx: number) => {
    setOpenIdx(idx)
    setItemIdx(0)
    setPaused(false)
    document.body.style.overflow = 'hidden'
  }

  const closeViewer = () => {
    setOpenIdx(null)
    setItemIdx(0)
    setPaused(false)
    document.body.style.overflow = ''
  }

  const nextItem = useCallback(() => {
    if (openIdx === null) return
    const story = sampleStories[openIdx]
    if (itemIdx < story.items.length - 1) {
      setItemIdx((i) => i + 1)
    } else if (openIdx < sampleStories.length - 1) {
      setOpenIdx((i) => (i as number) + 1)
      setItemIdx(0)
    } else {
      closeViewer()
    }
  }, [openIdx, itemIdx])

  const prevItem = useCallback(() => {
    if (openIdx === null) return
    if (itemIdx > 0) {
      setItemIdx((i) => i - 1)
    } else if (openIdx > 0) {
      const prev = sampleStories[openIdx - 1]
      setOpenIdx(openIdx - 1)
      setItemIdx(prev.items.length - 1)
    }
  }, [openIdx, itemIdx])

  useEffect(() => {
    if (openIdx === null || paused) return

    const story = sampleStories[openIdx]
    const item = story.items[itemIdx]
    const duration =
      item.type === 'video'
        ? item.durationMs ?? 7000
        : item.durationMs ?? DEFAULT_DURATION

    const t = setTimeout(() => {
      nextItem()
    }, duration)
    return () => clearTimeout(t)
  }, [openIdx, itemIdx, paused, nextItem])

  const StoryViewer = () => {
    if (openIdx === null) return null
    const story = sampleStories[openIdx]
    const item = story.items[itemIdx]

    return (
      <div
        className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Progress bars */}
        <div className="absolute top-4 left-0 right-0 px-4 flex gap-2">
          {story.items.map((_, i) => (
            <div key={i} className="relative flex-1 h-1 bg-white/20 rounded">
              <div
                className={`absolute left-0 top-0 h-full bg-white transition-all`}
                style={{
                  width:
                    i < itemIdx
                      ? '100%'
                      : i === itemIdx
                      ? paused
                        ? '50%'
                        : '0%'
                      : '0%',
                  transition: `width ${FADE_MS}ms linear`,
                }}
              />
            </div>
          ))}
        </div>

        <button
          onClick={closeViewer}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/40 text-white"
        >
          <X />
        </button>

        <button
          onClick={prevItem}
          className="absolute left-4 p-2 bg-black/30 text-white rounded-full hidden sm:flex"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={nextItem}
          className="absolute right-4 p-2 bg-black/30 text-white rounded-full hidden sm:flex"
        >
          <ChevronRight />
        </button>

        <div className="max-w-[900px] w-full max-h-[90vh] relative">
          {item.type === 'image' ? (
            <div className="relative w-full h-[70vh] bg-black">
              <Image
                src={item.src}
                alt={story.displayName ?? story.username}
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <video
              src={item.src}
              poster={item.preview}
              autoPlay
              muted
              playsInline
              className="w-full h-[70vh] object-contain bg-black"
              onEnded={() => nextItem()}
            />
          )}
          <div className="absolute bottom-4 left-4 flex items-center gap-3 text-white">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/60">
              {story.picture ? (
                <Image
                  src={story.picture}
                  alt={story.username}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-600" />
              )}
            </div>
            <div>
              <div className="font-semibold">
                {story.displayName ?? story.username}
              </div>
              <div className="text-xs text-white/70">Posted a story</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="text-lg mt-4 px-2 sm:px-0">Free Giveaways</div>

      <div className="w-full overflow-x-auto py-2 mb-2">
        <div className="flex gap-2 px-2 md:px-0">
          <div className="story bg-[var(--primary)] flex flex-col justify-between p-3 cursor-pointer">
            <div className="w-10 h-10 border-[var(--border)] rounded-full bg-[var(--secondary)] flex items-center justify-center text-[var(--custom)] border">
              <Plus size={20} />
            </div>
            <span className="text-white text-sm">Throw Some Gifts</span>
          </div>

          {sampleStories.map((story, idx) => (
            <div
              key={story.id}
              onClick={() => openStory(idx)}
              className="story"
            >
              {story.items[0].type === 'image' ? (
                <Image
                  src={story.items[0].src}
                  alt={story.username}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-black flex items-center justify-center">
                  {story.items[0].preview ? (
                    <Image
                      src={story.items[0].preview!}
                      alt={story.username}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-white/70">Video</span>
                  )}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full overflow-hidden border-2 ${
                    story.isNew ? 'border-[var(--custom)]' : 'border-white/30'
                  }`}
                >
                  <Image
                    src={story.picture ?? '/default.png'}
                    alt={story.username}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>
                <div className="text-white text-sm font-medium line-clamp-1 max-w-[6rem]">
                  {story.displayName ?? story.username}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {openIdx !== null && <StoryViewer />}
    </>
  )
}
