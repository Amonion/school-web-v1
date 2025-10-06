'use client'
import React, { useEffect } from 'react'
import CommentStore from '@/src/zustand/post/Comment'
import EachComment from './EachComment'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { usePathname } from 'next/navigation'
import { PostStore } from '@/src/zustand/post/Post'
import UserPostStore from '@/src/zustand/post/UserPost'

const CommentList = () => {
  const {
    comments,
    mainPost,
    tempComment,
    postedComment,
    page_size,
    sort,
    hasMoreComments,
    currentPage,
    getComments,
    resetActiveComment,
    resetPostedComment,
  } = CommentStore()
  const { user } = AuthStore()
  const pathname = usePathname()

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
      if (pathname === '/home') {
        PostStore.setState((state) => ({
          postResults: state.postResults.map((post) =>
            post._id === postedComment.postId
              ? { ...post, replies: (post.replies || 0) + 1 }
              : post
          ),
        }))
      } else {
        UserPostStore.setState((state) => ({
          postResults: state.postResults.map((post) =>
            post._id === postedComment.postId
              ? { ...post, replies: (post.replies || 0) + 1 }
              : post
          ),
        }))
      }
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
    <div className="flex-1 overflow-y-auto sm:px-4 px-2">
      <h3 className="text-lg font-semibold mb-3 text-white">Comments</h3>
      <div className="space-y-5 pb-4">
        {comments.map((item, index) => (
          <EachComment key={index} comment={item} />
        ))}
      </div>
    </div>
  )
}

export default CommentList
