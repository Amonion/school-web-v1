'use client'
import { useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation' // ✅ Get dynamic route params
import { PostStore } from '@/src/zustand/post/Post'
import CommentStore from '@/src/zustand/post/Comment'
import { MessageStore } from '@/src/zustand/notification/Message'
import PostHeader from '@/components/Home/Posts/PostHeader'
import MediaDisplay from '@/components/Home/Media/MediaDisplay'
import Polls from '@/components/Home/Posts/Polls'
import PostStat from '@/components/Home/Posts/PostStat'
import CommentBottomSheet from '@/components/Home/Comment/CommentBottomSheet'
import { AuthStore } from '@/src/zustand/user/AuthStore'

const MainPost = () => {
  const { _id } = useParams()
  const { getAPost, postForm, removePosts } = PostStore()
  const { removeComments, setMainPost, setShowComment, getComments } =
    CommentStore()
  const { setMessage } = MessageStore()
  const pathname = usePathname()
  const { user } = AuthStore()

  useEffect(() => {
    if (!postForm._id) {
      getAPost(`/posts/${_id}`, setMessage)
    }
    return () => {
      removeComments(String(_id))
      removePosts(String(_id))
    }
  }, [_id])

  useEffect(() => {
    if (postForm._id && pathname === `/home/posts/${_id}`) {
      getComments(
        `/posts/?postId=${_id}&level=1&myId=${user?._id}&page_size=30&page=1&ordering=-createdAt`
      )
      setMainPost(postForm)
      setShowComment(true)
    }
    return () => {
      setShowComment(false)
    }
  }, [postForm])

  return (
    <>
      <div className="w-full relative bg-[var(--white)] overflow-hidden pb-2 mb-1">
        <div className="post_card cursor-pointer">
          <PostHeader post={postForm} />
          <div className="p-1 rounded-[5px] cursor-pointer text-[16px] text-[var(--text-title-color)]">
            <div
              dangerouslySetInnerHTML={{
                __html: postForm.content,
              }}
            ></div>
          </div>

          <MediaDisplay sources={postForm.media} />
          <Polls postId={postForm._id} />

          <PostStat post={postForm} />
        </div>
      </div>
      <CommentBottomSheet />
    </>
  )
}

export default MainPost
