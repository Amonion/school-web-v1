import { usePathname, useRouter } from 'next/navigation'
import PostHeader from './PostHeader'
import Polls from './Polls'
import TruncatedContent from './TruncatedContent'
import PostStat from './PostStat'
import { Post, PostStore } from '@/src/zustand/post/Post'
import PostMediaGrid from '../Media/PostMediaGrid'
import HomeMedia from '../Media/HomeMedia'

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
        className="post_card cursor-pointer"
      >
        <PostHeader post={post} />
        <div className="p-1 rounded-[5px] cursor-pointer mb-1 text-[16px] text-[var(--text-title-color)]">
          <TruncatedContent content={post.content} limit={200} post={post} />
        </div>
        {pathname === '/home' ? (
          <HomeMedia sources={post.media} />
        ) : (
          <PostMediaGrid sources={post.media} />
        )}
        <Polls postId={post._id} />
        <PostStat post={post} />
      </div>
    </>
  )
}

export default PostCard
