import { useRouter } from 'next/navigation'
import CommentStore from '@/src/zustand/post/Comment'
import PostHeader from '../../Posts/PostHeader'
import TruncatedContent from '../../Posts/TruncatedContent'
import { Post } from '@/src/zustand/post/Post'
import { PostStore } from '@/src/zustand/Trace/TracePosts'
import Polls from './Polls'
import TracePostMediaWrapper from './TracePostMediaWrapper'
import TracePostStat from './TracePostStat'

interface TracePostCardProps {
  post: Post
  lastRef?: React.RefObject<HTMLDivElement>
}

const TracePostCard: React.FC<
  TracePostCardProps & { lastRef?: React.RefObject<HTMLDivElement> }
> = ({ post, lastRef }) => {
  const router = useRouter()
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
          <div className="px-2 cursor-pointer mb-1 text-[16px] text-[var(--text-title-color)]">
            <TruncatedContent content={post.content} limit={200} post={post} />
          </div>
        )}
        <TracePostMediaWrapper sources={post.media} />
        <Polls postId={post._id} />
        <TracePostStat post={post} />
      </div>
    </>
  )
}

export default TracePostCard
