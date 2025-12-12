import React from 'react'
import 'swiper/css'
import 'swiper/css/autoplay'
import CommentStore from '@/src/zustand/post/Comment'
import { Post } from '@/src/zustand/post/Post'
import CommonPostMedia from './CommonPostMedia'
import UserPostStore from '@/src/zustand/post/UserPost'

interface MediaSource {
  source: string
  type: string
}

interface UserPostMediaProps {
  sources: MediaSource[]
}

const UserPostMedia: React.FC<UserPostMediaProps> = ({ sources }) => {
  const {
    userMediaResults,
    setSelectedUserMedia,
    setCurrentIndex,
    setFitMode,
  } = UserPostStore()
  const { page_size, currentPage, getComments } = CommentStore()

  const setMainPost = (index: number) => {
    let comment: Post | undefined
    UserPostStore.setState((prev) => {
      comment = prev.postResults.find(
        (item) => item._id === userMediaResults[index].postId
      )
      return {
        userPostForm: comment,
      }
    })
    CommentStore.setState({ mainPost: comment })
    if (userMediaResults[index].postId) {
      getComments(
        `/comments?page=${currentPage}&page_size=${page_size}&postType=comment&postId=${userMediaResults[index].postId}&level=1`
      )
    }
  }

  const setMedia = (src: string) => {
    const mediaIndex = UserPostStore.getState().userMediaResults.findIndex(
      (item) => item.src === src
    )
    setMainPost(mediaIndex)
    setCurrentIndex(mediaIndex)
    setFitMode(false)
    setSelectedUserMedia(userMediaResults[mediaIndex])
  }

  return (
    <>
      <CommonPostMedia sources={sources} setMedia={setMedia} />
    </>
  )
}

export default UserPostMedia
