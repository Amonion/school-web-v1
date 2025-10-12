import { Post } from '@/src/zustand/post/Post'
import Image from 'next/image'
// import MediaDisplay from "@/components/Users/Media/MediaDisplay";
// import { useAuthStore } from "@/src/zustand/authStore";
import React from 'react'

interface PostProps {
  post: Post
}
const Polls: React.FC<PostProps> = ({ post }) => {
  return (
    <div className="cursor-default">
      {post.polls.map((poll, index) => (
        <div key={index} className="poll_tile">
          {poll.picture && (
            <div className="relative h-[40px] w-[50px] min-w-[50px] overflow-hidden mr-2">
              <Image
                src={String(poll.picture)}
                alt="Selected Image"
                layout="fill"
                objectFit="cover"
                className=" rounded-[5px]"
              />
            </div>
          )}
          <div className="flex-1">{poll.text}</div>
          <div className="poll_percent">{poll.percent}%</div>
        </div>
      ))}
    </div>
  )
}

export default Polls
