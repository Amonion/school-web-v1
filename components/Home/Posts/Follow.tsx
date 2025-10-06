import PostCard from './PostCard'
import { useEffect, useState } from 'react'
import ViewTracker from './ViewTracker'
import Image from 'next/image'
import { PostStore } from '@/src/zustand/post/Post'
import { MessageStore } from '@/src/zustand/notification/Message'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { useTheme } from '@/context/ThemeProvider'

export default function Post() {
  const {
    loading,
    followingPostResults,
    hasMoreFollowing,
    getFollowingPosts,
    updatePost,
  } = PostStore()
  const { setMessage } = MessageStore()
  const [sort] = useState('-createdAt')
  const { user } = AuthStore()
  const { theme } = useTheme()
  const [page_size] = useState(20)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (user) {
      setCurrentPage(1)
      getFollowingPosts(
        `/posts/following/?myId=${user._id}&page_size=${page_size}&page=${currentPage}&ordering=${sort}&postType=main`,
        setMessage
      )
    }
  }, [currentPage, user, sort])

  const increaseViewCount = async (id: string) => {
    PostStore.setState((state) => {
      const updatedPosts = state.followingPostResults.map((p) =>
        p._id === id
          ? {
              ...p,
              viewed: true,
              views: p.views + 1,
            }
          : p
      )

      return { followingPostResults: updatedPosts }
    })

    const updatedPost = PostStore.getState().followingPostResults.find(
      (p) => p._id === id
    )

    updatePost(
      `/posts/stats`,
      { views: updatedPost?.viewed, id: id, userId: user?._id },
      setMessage
    )
  }

  const fetchMore = async () => {
    if (hasMoreFollowing) {
      setCurrentPage(currentPage + 1)
    }
  }

  return (
    <>
      {followingPostResults.length > 0 ? (
        followingPostResults.map((post, index) => (
          <ViewTracker
            key={post._id}
            postId={post._id}
            onView={increaseViewCount}
            viewed={post.viewed}
            isLast={index === followingPostResults.length - 1}
            onLastInView={fetchMore}
          >
            <PostCard post={post} />
          </ViewTracker>
        ))
      ) : (
        <>
          {!loading && (
            <div className="max-w-[1000px] flex flex-col items-center w-full my-auto pb-5">
              <div className="text-center text-2xl mb-5 text-[var(--text-secondary)]">
                No Post Found
              </div>
              <div className="w-[400px] h-[300px]">
                <Image
                  src={
                    theme === 'dark'
                      ? `/images/NotFoundDark.png`
                      : '/images/NotFoundLight.png'
                  }
                  alt="Media"
                  width={0}
                  height={0}
                  sizes="100vw"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}{' '}
        </>
      )}

      <div className="flex items-center h-10 justify-center mt-4 flex-wrap w-full">
        <i
          className={`bi ${
            loading ? 'opacity-100' : 'opacity-0'
          } bi-opencollective loading  text-md text-[var(--custom-color)]`}
        ></i>
      </div>
    </>
  )
}
