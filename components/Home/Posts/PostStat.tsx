import { formatCount } from '@/lib/helpers'
import { MessageStore } from '@/src/zustand/notification/Message'
import CommentStore from '@/src/zustand/post/Comment'
import { Post, PostStore } from '@/src/zustand/post/Post'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { useEffect, useState } from 'react'

interface PostProps {
  post: Post
}

const PostStat: React.FC<PostProps> = ({ post }) => {
  const { updatePost, loading } = PostStore()
  const { setShowComment, getComments, setMainPost, comments, showComments } =
    CommentStore()
  const { setMessage } = MessageStore()
  const { user } = AuthStore()
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const postLink = `https://schoolingsocial.com/home/posts/${post._id}?action=shared`

  const handleLike = async () => {
    setIsLiked(true)
    PostStore.setState((state) => {
      const updatedPosts = state.postResults.map((p) =>
        p._id === post._id
          ? {
              ...p,
              liked: !p.liked,
              likes: p.liked ? p.likes - 1 : p.likes + 1,
            }
          : p
      )

      return { postResults: updatedPosts }
    })

    const updatedPost = PostStore.getState().postResults.find(
      (p) => p._id === post._id
    )

    updatePost(
      `/posts/like`,
      { likes: updatedPost?.liked, id: post._id, userId: user?._id },
      setMessage
    )
  }

  const handleBookmark = async () => {
    setIsSaved(true)
    PostStore.setState((state) => {
      const updatedPosts = state.postResults.map((p) =>
        p._id === post._id
          ? {
              ...p,
              bookmarked: !p.bookmarked,
              bookmarks: p.bookmarked ? p.bookmarks - 1 : p.bookmarks + 1,
            }
          : p
      )

      return { postResults: updatedPosts }
    })

    const updatedPost = PostStore.getState().postResults.find(
      (p) => p._id === post._id
    )

    updatePost(
      `/posts/bookmarks`,
      { bookmarks: updatedPost?.bookmarked, id: post._id, userId: user?._id },
      setMessage
    )
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(postLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000) // hide message after 2s
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const fetchComments = async () => {
    CommentStore.setState({ comments: [] })
    getComments(
      `/comments/?postId=${post._id}&level=1&myId=${user?._id}&page_size=30&page=1&ordering=-createdAt`
    )
  }

  const handleShowComments = () => {
    setMainPost(post)
    if (comments.length === 0) {
      fetchComments()
    } else if (comments.length > 0 && comments[0].postId !== post._id) {
      fetchComments()
    }
    setShowComment(!showComments)
  }

  useEffect(() => {
    if (!loading) {
      setIsLiked(false)
      setIsSaved(false)
    }
  }, [loading])

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
      }}
      className="py-[4px] cursor-default px-2 flex items-center justify-between"
    >
      <div className="post_stat cursor-pointer flex items-center space-x-1 transition-all duration-300">
        {loading && isLiked ? (
          <i
            className={`bi bi-heart-fill text-[var(--custom-color)] scale-125 post_icon text-[16px] transition-transform duration-300`}
          ></i>
        ) : (
          <i
            onClick={handleLike}
            className={`bi ${
              post.liked
                ? 'bi-heart-fill text-[var(--custom-color)] '
                : 'bi-heart'
            }
      post_icon text-[16px] transition-transform duration-300`}
          ></i>
        )}
        {post.likes > 0 && (
          <span className="transition-opacity duration-300">
            {formatCount(post.likes)}
          </span>
        )}
      </div>
      <div className="post_stat cursor-pointer flex items-center space-x-1 transition-all duration-300">
        {loading && isSaved ? (
          <i
            className={`bi bi-bookmark-fill text-[var(--custom-color)] scale-125 post_icon text-[16px] transition-transform duration-300`}
          ></i>
        ) : (
          <i
            onClick={handleBookmark}
            className={`bi ${
              post.bookmarked
                ? 'bi-bookmark-fill text-[var(--custom-color)] '
                : 'bi-bookmark'
            }
      post_icon text-[16px] transition-transform duration-300`}
          ></i>
        )}
        {post.bookmarks > 0 && (
          <span className="transition-opacity duration-300">
            {formatCount(post.bookmarks)}
          </span>
        )}
      </div>

      <div onClick={handleShowComments} className="post_stat">
        <i className="bi bi-chat-left-text post_icon mt-1 text-[16px]"></i>
        {post.replies > 0 && (
          <span className="transition-opacity duration-300">
            {formatCount(post.replies)}
          </span>
        )}
      </div>

      <div className="post_stat">
        {/* <i className="bi bi-lightning-charge post_icon text-[18px]"></i> */}
        <i className="bi bi-eye post_icon text-[18px]"></i>
        {post.views > 0 && (
          <span className="transition-opacity duration-300">
            {formatCount(post.views)}
          </span>
        )}
      </div>
      <div className="post_stat relative" onClick={handleCopy}>
        <i className="bi bi-share post_icon cursor-pointer"></i>
        {copied && (
          <div className="absolute right-[-10px] bottom-8 w-[95px]  px-2 py-1 text-sm text-[var(--custom)] bg-[var(--secondary)] rounded shadow transition-all animate-fade-in-out">
            Link copied!
          </div>
        )}
      </div>
    </div>
  )
}

export default PostStat
