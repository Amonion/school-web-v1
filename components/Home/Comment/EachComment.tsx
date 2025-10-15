import Link from 'next/link'
import Image from 'next/image'
import { ThumbsDown, ThumbsUp } from 'lucide-react'
import { formatCount, formatRelativeDate } from '@/lib/helpers'
import { useEffect, useRef, useState } from 'react'
import apiRequest from '@/lib/axios'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import CommentStore, { Comment } from '@/src/zustand/post/Comment'
import MediaDisplay from '../Media/MediaDisplay'

interface FetchCommentResponse {
  count: number
  message: string
  page_size: number
  results: Comment[]
}

interface EachCommentProps {
  comment: Comment
  onHeightChange?: (id: string, height: number) => void
  isLast?: boolean
  hasMoreComments?: boolean
}

const EachComment: React.FC<EachCommentProps> = ({
  comment,
  onHeightChange,
  isLast,
  hasMoreComments,
}) => {
  const { user } = AuthStore()
  const { setActiveComment, updateComment, showComments } = CommentStore()
  const [pageSize] = useState(20)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(false)
  const [lastHeight, setLastHeight] = useState(0)
  const [parentHeight, setParentHeight] = useState(0)
  const [sort] = useState('-createdAt')
  const [fetchedComments, setComments] = useState<Comment[]>([])
  const [moreComments, setMoreComments] = useState<Comment[]>([])
  const commentRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!Array.isArray(fetchedComments) || fetchedComments.length === 0) return

    CommentStore.setState((prev) => {
      const replaceChildren = (
        list: typeof prev.comments,
        targetParentId: string,
        newReplies: typeof prev.comments
      ): typeof prev.comments => {
        return list.map((comment) => {
          if (comment._id === targetParentId) {
            return {
              ...comment,
              comments: newReplies,
            }
          }

          return {
            ...comment,
            comments: replaceChildren(
              comment.comments,
              targetParentId,
              newReplies
            ),
          }
        })
      }

      let updatedComments = [...prev.comments]
      const parentId = fetchedComments[0]?.replyToId

      if (fetchedComments[0].level === 1) {
        updatedComments = fetchedComments
      } else if (parentId) {
        updatedComments = replaceChildren(
          updatedComments,
          parentId,
          fetchedComments
        )
      }

      return {
        comments: updatedComments,
      }
    })
  }, [fetchedComments])

  useEffect(() => {
    if (!Array.isArray(moreComments) || moreComments.length === 0) return

    CommentStore.setState((prev) => {
      const insertOne = (
        list: typeof prev.commentResults,
        newComment: Comment
      ): typeof prev.commentResults => {
        return list.map((comment) => {
          if (comment._id === newComment.replyToId) {
            return {
              ...comment,
              commentResults: [newComment, ...comment.comments],
            }
          }
          return {
            ...comment,
            commentResults: insertOne(comment.comments, newComment),
          }
        })
      }

      let updatedComments = [...prev.commentResults]

      for (const newComment of moreComments) {
        if (newComment.level === 0) {
          updatedComments = [newComment, ...updatedComments]
        } else {
          updatedComments = insertOne(updatedComments, newComment)
        }
      }

      return {
        commentResults: updatedComments,
      }
    })
  }, [moreComments])

  useEffect(() => {
    if (commentRef.current && onHeightChange) {
      onHeightChange(comment._id, commentRef.current.offsetHeight)
    }
  }, [onHeightChange, showComments, comment._id])

  useEffect(() => {
    if (commentRef.current) {
      setParentHeight(commentRef.current.offsetHeight)
    }
  }, [
    lastHeight,
    comment.comments,
    comment._id,
    showComments,
    fetchedComments.length,
  ])

  const fetchComments = async () => {
    try {
      setCurrentPage(1)
      setLoading(true)
      const response = await apiRequest<FetchCommentResponse>(
        `/posts/comments/?replyToId=${comment._id}&level=${
          comment.level + 1
        }&myId=${user?._id}&page_size=${pageSize}&page=1&ordering=${sort}`
      )

      const data = response?.data?.results
      if (data) {
        setComments(data)
        setHasMore(data.length >= pageSize)
        setCurrentPage(currentPage + 1)
      }
    } catch (error: unknown) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMoreComments = async () => {
    if (!hasMore) return
    try {
      setLoading(true)
      const response = await apiRequest<FetchCommentResponse>(
        `/posts/comments/?postId=${comment._id}&level=${
          comment.level + 1
        }&myId=${
          user?._id
        }&page_size=${pageSize}&page=${currentPage}&ordering=${sort}`
      )

      const data = response?.data?.results
      if (data) {
        setMoreComments((prev) => [...prev, ...data])
        setHasMore(data.length > pageSize)
        setCurrentPage(currentPage + 1)
      }
    } catch (error: unknown) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const toggleLike = (targetId: string, targetLevel: number) => {
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(targetId)
    if (isMongoId) {
      handleLike(true)
      CommentStore.setState((prev) => {
        const toggle = (
          commentsList: typeof prev.comments
        ): typeof prev.comments => {
          return commentsList.map((comment) => {
            if (comment._id === targetId && comment.level === targetLevel) {
              const isLiked = comment.liked
              const isHated = comment.hated

              const newLiked = !isLiked
              const newLikes = newLiked
                ? (comment.likes ?? 0) + 1
                : (comment.likes ?? 0) - 1

              let newHated = isHated
              let newHates = comment.hates ?? 0

              // 👇 If user is toggling like ON and it was hated, remove hate
              if (newLiked && isHated) {
                newHated = false
                newHates = newHates - 1
              }

              return {
                ...comment,
                liked: newLiked,
                likes: newLikes,
                hated: newHated,
                hates: newHates,
              }
            }

            // Recursive toggle for nested replies
            return {
              ...comment,
              comments: toggle(comment.comments),
            }
          })
        }

        return {
          comments: toggle(prev.comments),
        }
      })
    }
  }

  const toggleHate = (targetId: string, targetLevel: number) => {
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(targetId)
    if (isMongoId) {
      handleLike(false)
      CommentStore.setState((prev) => {
        const toggle = (
          commentsList: typeof prev.comments
        ): typeof prev.comments => {
          return commentsList.map((comment) => {
            if (comment._id === targetId && comment.level === targetLevel) {
              const isHated = comment.hated
              const isLiked = comment.liked

              const newHated = !isHated
              const newHates = newHated
                ? (comment.hates ?? 0) + 1
                : (comment.hates ?? 0) - 1

              let newLiked = isLiked
              let newLikes = comment.likes ?? 0

              // 👇 If user is toggling hate ON and it was liked, remove like
              if (newHated && isLiked) {
                newLiked = false
                newLikes = newLikes - 1
              }

              return {
                ...comment,
                hated: newHated,
                hates: newHates,
                liked: newLiked,
                likes: newLikes,
              }
            }

            // recursive toggle for nested replies
            return {
              ...comment,
              comments: toggle(comment.comments),
            }
          })
        }

        return {
          comments: toggle(prev.comments),
        }
      })
    }
  }

  const toggleIsActive = (
    targetId: string,
    targetLevel: number,
    status?: boolean
  ) => {
    CommentStore.setState((prev) => {
      const toggle = (
        commentsList: typeof prev.comments
      ): typeof prev.comments => {
        return commentsList.map((comment) => {
          if (comment._id === targetId && comment.level === targetLevel) {
            return {
              ...comment,
              isActive: status ? status : !comment.isActive,
            }
          } else {
            return {
              ...comment,
              isActive: false,
            }
          }
        })
      }

      return {
        comments: toggle(prev.comments),
      }
    })
  }

  const handleLike = async (status: boolean) => {
    updateComment(`/posts/${status ? 'like' : 'hate'}`, {
      id: comment._id,
      userId: user?._id,
    })
  }

  return (
    <>
      <div ref={commentRef} className="eachComment">
        {comment && (
          <div className="flex">
            <div
              className={`${
                comment.level === 1 ? 'mr-2' : 'mr-1'
              } relative z-10`}
            >
              {comment.comments.length > 0 && comment.level < 2 && (
                <div
                  style={{
                    height:
                      parentHeight -
                      lastHeight -
                      (comment.level === 1 ? 45 : 30),
                    top: comment.level === 1 ? 40 : 28,
                    left: comment.level === 1 ? 20 : 16,
                  }}
                  className={`absolute w-px border-l border-[var(--border)]`}
                />
              )}

              {comment.level === 2 && (
                <div
                  className={`absolute border-l border-b border-[var(--border)] rounded-bl-[20px]`}
                  style={{
                    height: 22,
                    width: 32,
                    top: -5,
                    left: comment.level === 2 ? -32 : -24,
                  }}
                />
              )}

              <Link
                href={`/home/profile/${comment.username}`}
                className={`${
                  comment.level === 1 ? 'w-10 h-10 min-w-10' : 'w-8 h-8 min-w-8'
                } rounded-full overflow-hidden border border-[var(--border)] block`}
              >
                <Image
                  style={{ height: '100%', objectFit: 'cover' }}
                  src={comment.picture}
                  loading="lazy"
                  sizes="100vw"
                  className="w-full block"
                  width={0}
                  height={0}
                  alt={`${comment.username}`}
                />
              </Link>
            </div>

            <div className="flex-1">
              <Link
                href={`/home/profile/${comment.username}`}
                className="flex items-center mb-1"
              >
                <div className={`text-[var(--text-secondary)] mr-2`}>
                  {comment.displayName}
                </div>
                <div className="ml-auto text-[12px]">
                  {formatRelativeDate(String(comment.createdAt))}
                </div>
              </Link>
              <div className="flex-1 mb-1 text-[16px]">
                <div
                  onClick={() => toggleIsActive(comment._id, comment.level)}
                  className={`p-1 mb-1 cursor-pointer text-sm sm:text-base ${
                    comment.isActive ? '' : 'line-clamp-3 overflow-ellipsis'
                  }`}
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: comment.content,
                    }}
                  />
                </div>

                {comment.commentMedia && (
                  <MediaDisplay
                    sources={[
                      { source: String(comment.commentMedia), type: 'image' },
                    ]}
                  />
                )}
              </div>
              <div className="flex items-center mb-3">
                <div
                  onClick={() => toggleLike(comment._id, comment.level)}
                  className={`${comment.level > 1 ? 'sm' : ''} commentBtns`}
                >
                  {comment.liked ? (
                    <ThumbsUp
                      size={14}
                      fill="currentColor"
                      stroke="currentColor"
                      className="text-[var(--text-primary)] mr-1"
                    />
                  ) : (
                    <ThumbsUp
                      size={14}
                      className="text-[var(--text-primary)] mr-1"
                    />
                  )}
                  {formatCount(comment.likes)}
                </div>

                <div
                  onClick={() => toggleHate(comment._id, comment.level)}
                  className={`${comment.level > 1 ? 'sm' : ''} commentBtns`}
                >
                  {comment.hated ? (
                    <ThumbsDown
                      size={14}
                      fill="currentColor"
                      stroke="currentColor"
                      className="text-[var(--text-primary)] -mb-[6px] mr-1"
                    />
                  ) : (
                    <ThumbsDown
                      size={14}
                      className="text-[var(--text-primary)] -mb-[6px] mr-1"
                    />
                  )}
                  {formatCount(comment.hates)}
                </div>
                <i
                  onClick={() => {
                    setActiveComment({
                      ...comment,
                      level: comment.level + 1,
                    })
                  }}
                  className={`${
                    comment.level > 1 ? 'text-sm' : ''
                  } bi bi-arrow-90deg-left cursor-pointer`}
                ></i>
                {user?.username === comment.username && (
                  <div className="relative ml-auto">
                    <i className="bi bi-three-dots-vertical cursor-pointer"></i>
                  </div>
                )}
              </div>

              {comment.comments.map((item, index) => (
                <EachComment
                  onHeightChange={(id, height) => {
                    if (comment.comments.length - 1 === index) {
                      setLastHeight(height)
                    }
                  }}
                  key={index}
                  comment={item}
                />
              ))}

              {comment.replies > 0 && comment.comments.length === 0 && (
                <div className="relative">
                  <div
                    style={{
                      height:
                        parentHeight -
                        lastHeight -
                        (comment.level === 1 ? 65 : 30),
                      top: comment.level === 1 ? -1 * (parentHeight - 54) : 28,
                      left: comment.level === 1 ? -28 : 16,
                    }}
                    className={`absolute z-0 w-px border-l border-[var(--border)]`}
                  />
                  <div
                    className={`absolute border-l border-b border-[var(--border)] rounded-bl-[18px]`}
                    style={{
                      height: 22,
                      width: 32,
                      top: -12,
                      left: -28,
                    }}
                  />{' '}
                  <div
                    onClick={() => {
                      toggleIsActive(comment._id, comment.level, true)
                      fetchComments()
                    }}
                    className={`text-[12px] ml-3 cursor-pointer`}
                  >
                    {formatCount(comment.replies)} Replies
                  </div>
                </div>
              )}

              {hasMore && comment.level > 1 && isLast && (
                <div
                  onClick={fetchMoreComments}
                  className="text-center text-sm text-custom mt-3"
                >
                  {`${loading ? 'Loading Comments' : 'More Comments.'}`}
                </div>
              )}
              {hasMoreComments && comment.level === 1 && isLast && (
                <div
                  onClick={fetchMoreComments}
                  className="text-center text-sm text-custom mt-3"
                >
                  {`${loading ? 'Loading Comments' : 'More Comments.'}`}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default EachComment
