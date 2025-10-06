import React from 'react'
import 'swiper/css'
import 'swiper/css/autoplay'
import CommentStore from '@/src/zustand/post/Comment'
import { Post, PostStore } from '@/src/zustand/post/Post'
import CommonMedia from './CommonMedia'

interface MediaSource {
  source: string
  type: string
}

interface HomeMediaProps {
  sources: MediaSource[]
}

const HomeMedia: React.FC<HomeMediaProps> = ({ sources }) => {
  const { mediaResults, setSelectedMedia, setCurrentIndex, setFitMode } =
    PostStore()
  const { page_size, currentPage, getComments } = CommentStore()

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
        `/posts/comments?page=${currentPage}&page_size=${page_size}&postType=comment&postId=${mediaResults[index].postId}&level=1`
      )
    }
  }

  const setMedia = (src: string) => {
    const mediaIndex = PostStore.getState().mediaResults.findIndex(
      (item) => item.src === src
    )
    setMainPost(mediaIndex)
    setCurrentIndex(mediaIndex)
    setFitMode(false)
    setSelectedMedia(mediaResults[mediaIndex])
  }

  return (
    <>
      <CommonMedia sources={sources} setMedia={setMedia} />
    </>
  )
}

export default HomeMedia
