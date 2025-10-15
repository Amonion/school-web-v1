import React, { useEffect } from 'react'
import Image from 'next/image'
import EachComment from './EachComment'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import CommentStore from '@/src/zustand/post/Comment'
import { PostStore } from '@/src/zustand/post/Post'

export default function CommentBox() {
  const {
    mainPost,
    postedComment,
    page_size,
    currentPage,
    sort,
    hasMoreComments,
    tempComment,
    comments,
    getComments,
    resetActiveComment,
    resetPostedComment,
  } = CommentStore()
  const { user } = AuthStore()

  useEffect(() => {
    if (mainPost._id !== tempComment.postId) return

    CommentStore.setState((prev) => {
      const insertComment = (
        commentsList: typeof prev.comments
      ): typeof prev.comments => {
        return commentsList.map((comment) => {
          if (tempComment.level === 4) {
            const index = comment.comments.findIndex(
              (c) => c._id === tempComment.replyToId
            )
            if (index !== -1) {
              const updatedChildren = [
                ...comment.comments.slice(0, index + 1),
                tempComment,
                ...comment.comments.slice(index + 1),
              ]
              return {
                ...comment,
                comments: updatedChildren,
              }
            }
          }

          if (comment._id === tempComment.replyToId) {
            return {
              ...comment,
              comments: [tempComment, ...comment.comments],
            }
          }

          return {
            ...comment,
            comments: insertComment(comment.comments),
          }
        })
      }

      if (tempComment.level === 1) {
        return {
          comments: [tempComment, ...prev.comments],
        }
      }

      return {
        comments: insertComment(prev.comments),
      }
    })

    resetActiveComment()
  }, [tempComment])

  useEffect(() => {
    if (!postedComment._id || !postedComment.uniqueId) return

    if (postedComment.level === 1) {
      PostStore.setState((state) => ({
        postResults: state.postResults.map((post) =>
          post._id === postedComment.postId
            ? { ...post, replies: (post.replies || 0) + 1 }
            : post
        ),
      }))
    } else {
      CommentStore.setState((prev) => {
        let didIncrement = false

        const replaceComment = (
          commentsList: typeof prev.comments
        ): typeof prev.comments => {
          return commentsList.map((comment) => {
            if (!didIncrement && comment._id === postedComment.replyToId) {
              didIncrement = true
              return {
                ...comment,
                replies: comment.replies + 1,
                comments: replaceComment(comment.comments),
              }
            }

            if (comment.uniqueId === postedComment.uniqueId) {
              return {
                ...comment,
                ...postedComment,
              }
            }

            return {
              ...comment,
              comments: replaceComment(comment.comments),
            }
          })
        }

        return {
          comments: replaceComment(prev.comments),
        }
      })
    }

    resetPostedComment()
  }, [postedComment])

  useEffect(() => {
    if (currentPage > 1 && hasMoreComments) {
      getComments(
        `/posts/?postId=${mainPost._id}&level=1&myId=${user?._id}&page_size=${page_size}&page=${currentPage}&ordering=${sort}`
      )
    }
  }, [currentPage])

  return (
    <div className="flex-1 pt-3 pb-[100px] max-h-[70vh] overflow-auto bg-[var(--secondary)] px-2">
      {comments.map((item, index) => (
        <EachComment key={index} comment={item} />
      ))}
      {comments.length === 0 && (
        <div className="relative flex-1 py-3 flex justify-center">
          <Image
            src="/images/not-found.png"
            loading="lazy"
            sizes="100vw"
            className="w-full h-full object-contain"
            width={0}
            height={0}
            style={{ height: 'auto', width: 200 }}
            alt="Default Avatar"
          />
          <div className="bg-secondary w-full dark:bg-dark-secondary py-3 absoluteCenter">
            <div className="text-xl uppercase text-center py-1 px-3 bg-[var(--secondary)]">
              Be the first to comment
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
