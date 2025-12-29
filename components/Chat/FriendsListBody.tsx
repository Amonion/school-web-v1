import FriendStore from '@/src/zustand/chat/Friend'
import { useEffect, useRef, useState } from 'react'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { ChatStore } from '@/src/zustand/chat/Chat'
import Image from 'next/image'
import CustomBtn from '@/components/CustomBtn'
import Link from 'next/link'
import EachFriend from './EachFriend'

interface Media {
  name: string
}

export default function FriendsListBody() {
  const { friendsResults } = FriendStore()
  const [text, setText] = useState('')
  const { user } = AuthStore()
  const inputRef = useRef<HTMLInputElement>(null)

  const { searchResult, selectChats, searchChats } = ChatStore()

  useEffect(() => {
    if (user && text.trim().length > 0) {
      searchChats(
        `/user-messages/search/?username=${user.username}&word=${text}`
      )
    }
  }, [text])

  const handleSelectChat = (id: number) => {
    if (inputRef.current) {
      inputRef.current.value = ''
      setText('')
    }
    selectChats(String(id))
  }

  return (
    <>
      <div className="relative w-full">
        <div
          className={`rounded-[20px] bg-[var(--primary)] mt-3 mb-5 h-[40px] w-full flex items-center px-3`}
        >
          <i className="bi bi-sliders cursor-pointer mr-3"></i>
          <input
            type="search"
            onChange={(e) => setText(e.target.value)}
            className={`bg-transparent border-none outline-none flex-1`}
            placeholder={`Search friends or conversation...`}
          />
          <i className="bi bi-search common-icon cursor-pointer"></i>
        </div>

        {searchResult.length > 0 && text.trim().length > 0 && (
          <div className="absolute left-0 sm:px-[10px] top-[50px] w-full z-40">
            <div className="w-full rounded-[10px]  max-h-[300px] bg-[var(--primary)] overflow-x-hidden overflow-y-auto border border-[var(--border)]">
              {searchResult.map((item, index) => {
                const plainContent = item.content?.replace(/<[^>]*>/g, '') || ''
                const regex = new RegExp(text, 'i')

                const matchInContent = plainContent.match(regex)
                const matchInMedia = item.media?.find(
                  (m: Media) => m?.name && m.name.match(regex)
                )

                let displayText = ''

                if (matchInContent) {
                  const start = Math.max(matchInContent.index! - 15, 0)
                  const end = matchInContent.index! + text.length + 15
                  displayText = plainContent.slice(start, end)
                } else if (matchInMedia) {
                  const name = matchInMedia.name
                  const match = name.match(regex)
                  if (match) {
                    const start = Math.max(match.index! - 10, 0)
                    const end = match.index! + text.length + 10
                    displayText = name.slice(start, end)
                  }
                }

                if (!displayText.trim()) return null

                return (
                  <div
                    onClick={() => handleSelectChat(item.timeNumber)}
                    key={index}
                    className="chat_search_list line-clamp-1 overflow-ellipsis"
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: displayText.replace(
                          new RegExp(`(${text})`, 'ig'),
                          `<mark style="background: none; color: var(--text-secondary); ">$1</mark>`
                        ),
                      }}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
      <ul className="m-0 p-0">
        {friendsResults.map((friend, index) => (
          <EachFriend key={index} friend={friend} />
        ))}
      </ul>
      {friendsResults.length === 0 && (
        <div className="flex-1 overflow-hidden rounded">
          <div className="my-2 text-center">You have no friends</div>
          <Image
            src={'/images/socialize.png'}
            loading="lazy"
            sizes="100vw"
            className="w-full flex-1 object-cover mb-10"
            width={0}
            height={0}
            alt="Schooling Social Logo"
          />
          <Link className="flex min-h-[60px]" href={`/home/trace/accounts`}>
            <CustomBtn label="Search Friends" loading={false} />
          </Link>
        </div>
      )}
    </>
  )
}
