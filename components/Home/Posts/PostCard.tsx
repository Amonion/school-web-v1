import { usePathname, useRouter } from 'next/navigation'
import PostHeader from './PostHeader'
import Polls from './Polls'
import PostStat from './PostStat'
import { Post, PostStore } from '@/src/zustand/post/Post'
import HomePostMedia from '../Media/HomePostMedia'
import UserPostMedia from '../Media/UserPostMedia'
import CommentStore from '@/src/zustand/post/Comment'
import { useState } from 'react'

interface PostCardProps {
  post: Post
  lastRef?: React.RefObject<HTMLDivElement>
}

const PostCard: React.FC<
  PostCardProps & { lastRef?: React.RefObject<HTMLDivElement> }
> = ({ post, lastRef }) => {
  const router = useRouter()
  const pathname = usePathname()
  const [showFullText, toggleFullText] = useState(false)
  const { page_size, currentPage, getComments } = CommentStore()
  const { mediaResults, setSelectedMedia, setCurrentIndex, setFitMode } =
    PostStore()
  const moveToPost = (id: string) => {
    PostStore.setState({ postForm: post })
    router.push(`/home/posts/${id}`)
  }

  const setMainPost = (index: number) => {
    let comment: Post | undefined
    PostStore.setState((prev) => {
      comment = prev.postResults.find(
        (item) => item._id === mediaResults[index].postId
      )
      return {
        postForm: prev.postResults.find(
          (item) => item._id === mediaResults[index].postId
        ),
      }
    })
    CommentStore.setState({ mainPost: comment })
    if (mediaResults[index].postId) {
      getComments(
        `/comments?page=${currentPage}&page_size=${page_size}&postType=comment&postId=${mediaResults[index].postId}&level=1`
      )
    }
  }

  const setMedia = () => {
    const mediaIndex = mediaResults.findIndex(
      (item) => item.postId === post._id
    )
    setMainPost(mediaIndex)
    setCurrentIndex(mediaIndex)
    setFitMode(false)
    setSelectedMedia(mediaResults[mediaIndex])
  }
  return (
    <>
      <div
        ref={lastRef}
        onClick={() => moveToPost(post._id)}
        className="bg-[var(--primary)] py-2 mb-1 cursor-pointer"
      >
        <PostHeader post={post} />
        {post.backgroundColor ? (
          <div
            onClick={(e) => {
              setMedia()
              e.stopPropagation()
            }}
            style={{ backgroundColor: post.backgroundColor }}
            className="w-full text-white text-lg px-2 sm:text-xl text-center flex justify-center items-center min-h-[300px]"
            dangerouslySetInnerHTML={{
              __html: post.content,
            }}
          ></div>
        ) : (
          <>
            <div
              className={`${
                showFullText ? '' : 'overflow-ellipsis line-clamp-3'
              } px-2 cursor-pointer mb-1 text-[16px] text-[var(--text-title-color)]`}
              dangerouslySetInnerHTML={{
                __html: post.content,
              }}
            ></div>
            {!showFullText && post.content.length > 100 && (
              <span
                onClick={() => toggleFullText(true)}
                className="text-[var(--custom)] cursor-pointer mt-4 mb-1 px-2"
              >
                Show full text
              </span>
            )}
          </>
        )}
        {post.media.length > 0 && pathname === '/home' ? (
          <HomePostMedia sources={post.media} />
        ) : (
          post.media.length > 0 && <UserPostMedia sources={post.media} />
        )}
        <Polls postId={post._id} />
        <PostStat post={post} />
      </div>
    </>
  )
}

export default PostCard
