'use client'
import { useParams } from 'next/navigation'
import { useGeneralContext } from '@/context/GeneralContext'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { ChatContent, ChatStore } from '@/src/zustand/chat/Chat'

type ChatContentProps = {
  e: ChatContent
}

const ChatActions = ({ e }: ChatContentProps) => {
  const { selectChats, connection } = ChatStore()
  const { user } = AuthStore()
  const { username } = useParams()
  const { socket } = useGeneralContext()

  const setIsActive = (id: string) => {
    ChatStore.setState((prev) => {
      let willBeActive = false
      for (const group of prev.chatResults) {
        const chat = group.chats.find((c) => c._id === id)
        if (chat) {
          willBeActive = !chat.isActive
          break
        }
      }
      const updatedResults = prev.chatResults.map((group) => ({
        ...group,
        chats: group.chats.map((chat) => ({
          ...chat,
          isActive: chat._id === id ? willBeActive : false,
        })),
      }))
      return { chatResults: updatedResults }
    })
  }

  const startSetRepliedChat = (e: ChatContent | null) => {
    ChatStore.setState({
      repliedChat: e,
    })
    if (e) {
      setIsActive(e._id)
    }
  }

  const deleteChat = (id: string, chatUsername: string, day: string) => {
    if (socket && user) {
      const form = {
        to: 'deleteChat',
        id: id,
        connection: connection,
        day: day,
        isSender: user.username === chatUsername,
        username: user.username,
        receiverUsername: username,
      }

      socket.emit('message', form)
    }

    setIsActive(id)
  }

  const startSelectItem = (id: string) => {
    selectChats(id)
    setIsActive(id)
  }

  return (
    <div
      className={`flex flex-col text-[16px] text-[var(--text-primary)] z-30 absolute ${
        e.receiverUsername === user?.username ? 'left-[-80px]' : 'right-0'
      } rounded-[5px] border border-[var(--border)] bg-[var(--primary)]`}
    >
      {e.content.trim().length > 0 && (
        <div
          onClick={() => {
            const cleanedText = e.content.replace(/<[^>]*>/g, '')
            navigator.clipboard.writeText(cleanedText)
            setIsActive(e._id)
          }}
          className="chat_list_item"
        >
          <i className="bi bi-clipboard mr-2"></i>
          Copy
        </div>
      )}
      <div onClick={() => startSetRepliedChat(e)} className="chat_list_item">
        <i className="bi bi-reply mr-2"></i>
        Reply
      </div>
      <div onClick={() => startSelectItem(e._id)} className="chat_list_item">
        <i className="bi bi-check2-square mr-2"></i>
        Select
      </div>
      <div
        onClick={() => deleteChat(e._id, e.username, e.day)}
        className="chat_list_item"
      >
        <i className="bi bi-trash mr-2"></i>
        Delete
      </div>
      <div onClick={() => setIsActive(e._id)} className="chat_list_item">
        <i className="bi bi-x-circle mr-2"></i>
        Close
      </div>
    </div>
  )
}

export default ChatActions
