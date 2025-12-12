import React from 'react'
import 'swiper/css'
import 'swiper/css/autoplay'
import CommentStore from '@/src/zustand/post/Comment'
import { Post, PostStore } from '@/src/zustand/post/Post'
import Image from 'next/image'
import { PlayCircle } from 'lucide-react'

interface MediaSource {
  preview: string
  source: string
  type: string
}

interface CreatePostMediaDisplayProps {
  sources: MediaSource[]
}

const CreatePostMediaDisplay: React.FC<CreatePostMediaDisplayProps> = ({
  sources,
}) => {
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
        `/comments?page=${currentPage}&page_size=${page_size}&postId=${mediaResults[index].postId}&level=1`
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

  const renderMedia = (media: {
    type: string
    source: string
    preview: string
  }) => {
    if (media.type.includes('video')) {
      return (
        <div className="flex items-center justify-center  overflow-hidden relative">
          <PlayCircle className="absolute w-[40px] h-[40px] text-[var(--custom-color)] top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]" />
          <video
            src={media.preview}
            className="lg:max-h-[400px] max-h-[300px] xs:max-h-[350px] w-auto"
            muted
            loop
            playsInline
          ></video>
        </div>
      )
    } else if (sources.length === 1) {
      return (
        <div className="w-full  lg:max-h-[500px] max-h-[350px] xs:max-h-[450px] sm:max-h-[500px] md:max-h-[550px] flex justify-center bg-[var(--white-gray)]  overflow-hidden">
          {media.type.includes('video') && media.preview ? (
            <Image
              src={media.preview}
              alt="Media"
              width={0}
              height={0}
              sizes="100vw"
              className="w-full h-auto object-cover  overflow-clip"
            />
          ) : (
            <Image
              src={media.source}
              alt="Media"
              width={0}
              height={0}
              sizes="100vw"
              className="w-full h-auto object-cover  overflow-clip"
            />
          )}
        </div>
      )
    } else {
      return (
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${media.source})` }}
        ></div>
      )
    }
  }

  return (
    <>
      <div
        onClick={(e) => {
          e.stopPropagation()
        }}
        className="mb-2 overflow-hidden  bg-[var(--secondary)]"
      >
        <div>
          {sources.length === 1 ? (
            <div
              onClick={() => setMedia(sources[0].preview)}
              className="media_layout"
            >
              {renderMedia(sources[0])}
            </div>
          ) : sources.length === 2 ? (
            <div className="flex gap-1">
              {sources.map((media, index) => (
                <div key={index} className="media_layout part">
                  {renderMedia(media)}
                </div>
              ))}
            </div>
          ) : sources.length === 3 ? (
            <div className="grid grid-cols-2 h-[250px] sm:h-[350px] xs:h-[350px] gap-1 w-full">
              <div className="col-span-1 media_layout">
                {renderMedia(sources[0])}
              </div>
              <div className="flex flex-col gap-1">
                {sources.slice(1).map((media, index) => (
                  <div key={index + 1} className=" media_layout split">
                    {renderMedia(media)}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 grid-rows-2 gap-1">
              {sources.slice(0, 4).map((media, index) => (
                <div
                  key={index}
                  className="h-[120px] xs:h-[140] sm:h-[150px] overflow-hidden bg-[var(--white-gray)] cursor-pointer"
                >
                  {renderMedia(media)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default CreatePostMediaDisplay
