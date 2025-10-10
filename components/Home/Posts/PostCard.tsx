import { usePathname, useRouter } from 'next/navigation'
import PostHeader from './PostHeader'
import Polls from './Polls'
import TruncatedContent from './TruncatedContent'
import PostStat from './PostStat'
import { Post, PostStore } from '@/src/zustand/post/Post'
import HomePostMedia from '../Media/HomePostMedia'
import UserPostMedia from '../Media/UserPostMedia'

interface PostCardProps {
  post: Post
  lastRef?: React.RefObject<HTMLDivElement>
}

const PostCard: React.FC<
  PostCardProps & { lastRef?: React.RefObject<HTMLDivElement> }
> = ({ post, lastRef }) => {
  const router = useRouter()
  const pathname = usePathname()
  const moveToPost = (id: string) => {
    PostStore.setState({ postForm: post })
    router.push(`/home/posts/${id}`)
  }

  return (
    <>
      <div
        ref={lastRef}
        onClick={() => moveToPost(post._id)}
        className="bg-[var(--primary)] py-2 mb-1 cursor-pointer"
      >
        <PostHeader post={post} />
        <div className="px-2 cursor-pointer mb-1 text-[16px] text-[var(--text-title-color)]">
          <TruncatedContent content={post.content} limit={200} post={post} />
        </div>
        {pathname === '/home' ? (
          <HomePostMedia sources={post.media} />
        ) : (
          <UserPostMedia sources={post.media} />
        )}
        <Polls postId={post._id} />
        <PostStat post={post} />
      </div>
    </>
  )
}

export default PostCard
