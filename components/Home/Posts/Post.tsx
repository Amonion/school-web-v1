import PostCard from './PostCard'
import { useEffect, useState } from 'react'
import ViewTracker from './ViewTracker'
import { PostStore } from '@/src/zustand/post/Post'
import { MessageStore } from '@/src/zustand/notification/Message'
import { AuthStore } from '@/src/zustand/user/AuthStore'

export default function Post() {
  const {
    loading,
    postResults,
    getPosts,
    page_size,
    updatePost,
    hasMore,
    addMorePosts,
    setCurrentPage,
    currentPage,
  } = PostStore()
  const { setMessage } = MessageStore()
  const [sort] = useState('-createdAt')
  const { user } = AuthStore()

  useEffect(() => {
    if (user && postResults.length === 0) {
      setCurrentPage(1)
      getPosts(
        `/posts/?myId=${user._id}&page_size=${page_size}&page=1&ordering=${sort}&postType=main`,
        setMessage
      )
    }
  }, [user, postResults])

  useEffect(() => {
    if (user && currentPage > 1) {
      addMorePosts(
        `/posts/?myId=${user._id}&page_size=${page_size}&page=${currentPage}&ordering=${sort}&postType=main`,
        setMessage
      )
    }
  }, [currentPage])

  const increaseViewCount = async (id: string) => {
    PostStore.setState((state) => {
      const updatedPosts = state.postResults.map((p) =>
        p._id === id
          ? {
              ...p,
              viewed: true,
              views: p.views + 1,
            }
          : p
      )

      return { postResults: updatedPosts }
    })

    updatePost(
      `/posts/view`,
      { viewedPostIds: [id], userId: user?._id },
      setMessage
    )
  }

  const fetchMore = async () => {
    if (hasMore) {
      setCurrentPage(currentPage + 1)
    }
  }
  return (
    <div className="pb-[55px] sm:pb-0">
      {postResults.map((post, index) => (
        <ViewTracker
          key={post._id}
          postId={post._id}
          onView={increaseViewCount}
          viewed={post.viewed}
          isLast={index === postResults.length - 1}
          onLastInView={fetchMore}
        >
          <PostCard post={post} />
        </ViewTracker>
      ))}

      {loading && (
        <div className="flex fixed top-[70px] z-50 left-0 items-center h-10 justify-center mt-4 flex-wrap w-full">
          <i
            className={`bi bi-opencollective loading  text-3xl text-[var(--custom-color)]`}
          ></i>
        </div>
      )}
    </div>
  )
}
