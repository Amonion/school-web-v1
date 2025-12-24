import { formatCount } from '@/lib/helpers'
import { Comment } from '@/src/zustand/post/Comment'
import EachComment from './EachComment'

interface SubCommentPartProps {
  comments: Comment[]
  fetchedComments: Comment[]
  parentHeight: number
  lastHeight: number
  comment: Comment
  hasMore: boolean
  loading: boolean
  toggleIsActive: (id: string, level: number, status: boolean) => void
  setLastHeight: (height: number) => void
  fetchComments: () => void
  fetchMoreComments: () => void
  onHeightChange?: (id: string, height: number) => void
  isLast?: boolean
  hasMoreComments?: boolean
}

const SubCommentPart: React.FC<SubCommentPartProps> = ({
  comments,
  fetchedComments,
  comment,
  parentHeight,
  lastHeight,
  hasMore,
  loading,
  toggleIsActive,
  setLastHeight,
  fetchComments,
  fetchMoreComments,
  isLast,
  hasMoreComments,
}) => {
  return (
    <>
      {comments.map((item, index) => (
        <EachComment
          onHeightChange={(id, height) => {
            if (comments.length - 1 === index) {
              setLastHeight(height)
            }
          }}
          key={index}
          comment={item}
        />
      ))}

      {comment.replies > 0 && fetchedComments.length === 0 && (
        <div className="relative">
          <div
            style={{
              height:
                parentHeight - lastHeight - (comment.level === 1 ? 65 : 30),
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
    </>
  )
}

export default SubCommentPart
