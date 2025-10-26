import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { MessageStore } from '@/src/zustand/notification/Message'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { ChatStore } from '@/src/zustand/chat/Chat'
import FriendStore, { FriendEmpty } from '@/src/zustand/chat/Friend'

interface Media {
  name: string
}

export default function ChatHead() {
  const [isInputExpanded, setExpandInput] = useState(false)
  const [text, setText] = useState('')
  const { setMessage } = MessageStore()
  const { friendsResults } = FriendStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const pathname = usePathname()
  const {
    searchResult,
    selectedItems,
    selectedFavItems,
    chatUserForm,
    selectChats,
    searchChats,
    massDelete,
    updateItem,
    selectFavChats,
    getChatUser,
  } = ChatStore()
  const { username } = useParams()
  const { user } = AuthStore()

  useEffect(() => {
    if (username && user && text.trim().length > 0) {
      const key = setConnectionKey(String(username), String(user.username))
      if (pathname.includes('favourites')) {
        searchChats(
          `/user-messages/search-fav/?connection=${key}&username=${user.username}&word=${text}`
        )
      } else {
        searchChats(
          `/user-messages/search/?connection=${key}&username=${user.username}&word=${text}`
        )
      }
    }
  }, [text])

  useEffect(() => {
    if (!chatUserForm.username) {
      getChatUser(`/users/chat/${username}`, setMessage)
    }
  }, [chatUserForm, pathname])

  useEffect(() => {
    if (friendsResults.length > 0 && username) {
      FriendStore.setState((prev) => {
        const friend = prev.friendsResults.find(
          (item) =>
            item.senderUsername === username ||
            item.receiverUsername === username
        )
        return {
          friendForm: friend ? friend : FriendEmpty,
        }
      })
      // getChatUser(`/users/chat/${username}`, setMessage)
    } else {
      FriendStore.setState({ friendForm: FriendEmpty })
    }
  }, [username, friendsResults.length])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = ''
      setText('')
    }
    ChatStore.setState(() => {
      return {
        selectedFavItems: [],
        selectedItems: [],
      }
    })
  }, [pathname])

  const saveChats = () => {
    if (pathname.includes('favourites')) {
      if (selectedFavItems.length === 0) {
        setMessage('Select at least one chat to unsave', false)
        return
      }
    } else {
      if (selectedItems.length === 0) {
        setMessage('Select at least one chat to save', false)
        return
      }
    }
    const key = setConnectionKey(String(username), String(user?.username))
    const form = new FormData()
    form.append('username', String(user?.username))
    if (pathname.includes('favourites')) {
      form.append('selectedItems', JSON.stringify(selectedFavItems))
      updateItem(`/user-messages/unsave/?connection=${key}`, form, setMessage)
    } else {
      form.append('selectedItems', JSON.stringify(selectedItems))
      updateItem(`/user-messages/save/?connection=${key}`, form, setMessage)
    }
  }

  const setConnectionKey = (id1: string, id2: string) => {
    const participants = [id1, id2].sort()
    return participants.join('')
  }

  const handleSelectChat = (id: string, time: number) => {
    if (inputRef.current) {
      inputRef.current.value = ''
      setText('')
    }
    setExpandInput(false)
    if (pathname.includes('favourites')) {
      selectFavChats(time)
    } else {
      selectChats(id)
    }
  }

  const makeMassDelete = () => {
    if (selectedItems.length === 0) {
      return
    }
    massDelete(
      `/user-messages/mass-delete/?senderUsername=${user?.username}`,
      selectedItems,
      setMessage
    )
  }
  return (
    <>
      <div className="flex-1 relative flex items-center px-2">
        <div className={` ${isInputExpanded ? 'hidden' : 'flex'}`}>
          <>
            <div className="flex items-center cursor-default ">
              {
                <Link
                  href={`/home/profile/${chatUserForm.username}`}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden mr-3"
                >
                  <Image
                    style={{ height: '100%', objectFit: 'cover' }}
                    src={`${chatUserForm.picture || '/avatar.png'}`}
                    loading="lazy"
                    sizes="100vw"
                    className="w-full h-full object-cover"
                    width={0}
                    height={0}
                    alt={`${chatUserForm.username}`}
                  />
                </Link>
              }
              <div className="flex-1">
                <div className="flex items-center">
                  <Link
                    href={`/home/profile/${chatUserForm.username}`}
                    className="account_name line-clamp-1 overflow-ellipsis"
                  >
                    {chatUserForm.displayName}
                  </Link>
                  <i className="bi bi-shield-check verify_icon"></i>
                </div>
                <div className="flex items-center">
                  <Link
                    href={`/home/profile/${chatUserForm.username}`}
                    className="post_username mr-7"
                  >
                    @{chatUserForm.username}
                  </Link>
                  {pathname.includes('favourites') ? (
                    <Link
                      href={`/home/friends/chat/${username}/`}
                      className="round secondary"
                    >
                      <i className="bi bi-chat-fill text-[10px] mt-[2px] leading-none cursor-pointer text-[var(--custom)]"></i>
                    </Link>
                  ) : (
                    <Link
                      href={`/home/friends/chat/${username}/favourites`}
                      className="round secondary"
                    >
                      <i className="bi bi-heart-fill text-[10px] mt-[2px] leading-none cursor-pointer text-red-600"></i>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </>
        </div>

        <div
          className={`input_wrap transition-[width] duration-700 ml-auto ${
            isInputExpanded ? 'active' : ''
          }`}
        >
          <input
            ref={inputRef}
            type="search"
            onChange={(e) => setText(e.target.value)}
            className={`transparent-input flex-1 ${
              isInputExpanded ? 'w-auto' : 'w-0 hidden'
            }`}
            placeholder={`Search for something...`}
          />
          <i
            className="bi bi-search common-icon cursor-pointer"
            onClick={() => setExpandInput((e) => !e)}
          ></i>

          {searchResult.length > 0 &&
            text.trim().length > 0 &&
            isInputExpanded && (
              <div className="absolute left-0 sm:px-[10px] top-[50px] w-full z-40">
                <div className="w-full rounded-[10px]  max-h-[300px] bg-[var(--primary)] overflow-x-hidden overflow-y-auto border border-[var(--border)]">
                  {searchResult.map((item, index) => {
                    const plainContent =
                      item.content?.replace(/<[^>]*>/g, '') || ''
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
                        onClick={() =>
                          handleSelectChat(String(item._id), item.timeNumber)
                        }
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

        {pathname.includes('favourites') ? (
          <>
            {selectedFavItems.length > 0 && (
              <div className="absolute w-auto rounded-b-[10px] bg-[var(--primary)] top-[60px] left-0 flex items-center py-[2px]">
                <i
                  onClick={makeMassDelete}
                  className="bi bi-trash cursor-pointer mx-2"
                ></i>
                <i
                  onClick={saveChats}
                  className="bi bi-heart cursor-pointer text-red-600 mx-2"
                ></i>
              </div>
            )}
          </>
        ) : (
          <>
            {selectedItems.length > 0 && (
              <div className="absolute w-auto rounded-b-[10px] bg-[var(--primary)] top-[60px] left-0 flex items-center py-[2px]">
                <i
                  onClick={makeMassDelete}
                  className="bi bi-trash cursor-pointer mx-2"
                ></i>
                <i
                  onClick={saveChats}
                  className="bi bi-heart-fill cursor-pointer text-red-600 mx-2"
                ></i>
              </div>
            )}
          </>
        )}

        {selectedItems.length > 0 ||
          (selectedFavItems.length > 0 && (
            <div className="absolute w-auto rounded-b-[10px] bg-[var(--primary)] top-[60px] left-0 flex items-center py-[2px]">
              <i
                onClick={makeMassDelete}
                className="bi bi-trash cursor-pointer mx-2"
              ></i>
              {pathname.includes('favourites') ? (
                <i
                  onClick={saveChats}
                  className="bi bi-heart cursor-pointer text-red-600 mx-2"
                ></i>
              ) : (
                <i
                  onClick={saveChats}
                  className="bi bi-heart-fill cursor-pointer text-red-600 mx-2"
                ></i>
              )}
              {/* {selectedItems.length === 1 && (
              <i className="bi bi-pin mx-2 cursor-pointer"></i>
            )} */}
            </div>
          ))}
      </div>
    </>
  )
}
