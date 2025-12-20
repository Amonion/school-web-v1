import { Poll } from '@/src/zustand/post/Post'
import { PostStore } from '@/src/zustand/Trace/TracePosts'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import Image from 'next/image'
import React from 'react'

interface PostProps {
  postId: string
}
const Polls: React.FC<PostProps> = ({ postId }) => {
  const { user } = AuthStore()
  const { selectPoll } = PostStore()
  const post = PostStore((state) =>
    state.postResults.find((p) => p._id === postId)
  )

  if (!post) return null

  const handleSelectPoll = (int: number) => {
    let sendPoll = false
    let total = 0
    let polls: Poll[] = []
    PostStore.setState((state) => {
      const updatedPosts = state.postResults.map((item) => {
        if (item._id === post._id) {
          const updatedPolls = item.polls.map((poll, index) => {
            if (index === int) {
              if (poll.userId === user?._id) {
                sendPoll = false
                return poll
              }
              sendPoll = true
              return {
                ...poll,
                percent: (poll.percent || 0) + 1,
                userId: String(user?._id),
              }
            } else if (poll.userId === user?._id) {
              return {
                ...poll,
                percent: Math.max((poll.percent || 0) - 1, 0),
                userId: '',
              }
            }
            return poll
          })

          const totalVotes = updatedPolls.reduce(
            (sum, poll) => sum + (poll.percent || 0),
            0
          )

          polls = updatedPolls

          total = totalVotes
          return {
            ...item,
            polls: updatedPolls,
            totalVotes,
            isSelected: true,
          }
        }
        return item
      })

      return { postResults: updatedPosts }
    })
    if (sendPoll) {
      selectPoll(`/posts/poll/${post._id}`, {
        polls: polls,
        userId: user?._id,
        username: user?.username,
        totalVotes: total,
        pollIndex: int,
      })
    }
  }
  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
      }}
      className="cursor-default"
    >
      {post.polls.map((poll, index) => (
        <div
          onClick={() => handleSelectPoll(index)}
          key={index}
          className="poll_tile"
        >
          {poll.picture && (
            <div className="relative z-10 h-[40px] w-[50px] min-w-[50px] overflow-hidden mr-2">
              <Image
                src={String(poll.picture)}
                alt="Selected Image"
                layout="fill"
                objectFit="cover"
                className=" rounded-[5px]"
              />
            </div>
          )}
          <div className="flex-1 z-10">{poll.text}</div>
          {post.isSelected && (
            <div className="poll_percent z-10">
              {((poll.percent * 100) / post.totalVotes).toFixed(2)}%
            </div>
          )}
          <div
            style={{
              width: post.isSelected
                ? `${(poll.percent * 100) / post.totalVotes}%`
                : 0,
            }}
            className="bg-[var(--white-gray)] absolute top-0 left-0 h-full"
          ></div>
        </div>
      ))}
      {post.isSelected && <div>votes: {post.totalVotes}</div>}
    </div>
  )
}

export default Polls
