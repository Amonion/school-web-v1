'use client'
import { useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { PostStore } from '@/src/zustand/post/Post'
import CommentStore from '@/src/zustand/post/Comment'
import { MessageStore } from '@/src/zustand/notification/Message'
import PostHeader from '@/components/Home/Posts/PostHeader'
import MediaDisplay from '@/components/Home/Media/MediaDisplay'
import Polls from '@/components/Home/Posts/Polls'
import PostStat from '@/components/Home/Posts/PostStat'
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
        `/comments/?postId=${_id}&level=1&postType=comment&myId=${user?._id}&page_size=30&page=1&ordering=-createdAt`
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
        <div className="bg-[var(--primary)] py-2">
          <PostHeader post={postForm} />
          {postForm.backgroundColor ? (
            <div
              style={{ backgroundColor: postForm.backgroundColor }}
              className="w-full text-white text-lg sm:text-xl text-center flex justify-center items-center min-h-[300px]"
              dangerouslySetInnerHTML={{
                __html: postForm.content,
              }}
            ></div>
          ) : (
            <div className="p-1 text-[16px] text-[var(--text-title-color)]">
              <div
                dangerouslySetInnerHTML={{
                  __html: postForm.content,
                }}
              ></div>
            </div>
          )}

          <MediaDisplay sources={postForm.media} />
          <Polls postId={postForm._id} />

          <PostStat post={postForm} />
        </div>
      </div>
    </>
  )
}

export default MainPost
