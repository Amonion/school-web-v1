'use client'
import { formatCount } from '@/lib/helpers'
import PercentageChange from './PercentageChange'
import PostAnalysisStore from '@/src/zustand/post/PostAnalysis'

export default function DashboardCards() {
  const { postAnalysisData } = PostAnalysisStore()

  return (
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
      <div className="card_body pad">
        <div className="text-lg text-[var(--text-secondary)]">
          Posts Analysis
        </div>

        <div className="flex items-end my-3 justify-between">
          <div className="text-2xl leading-none text-[var(--custom)]">
            {formatCount(postAnalysisData.post.totalPosts)}
          </div>
          <div className="flex items-center text-[12px]">
            <div className="flex items-center">
              <i className={`bi bi-eye mr-1 mb-[-2px]`}></i>{' '}
              {formatCount(postAnalysisData.post.totalViews)}
            </div>
            <div className="flex items-center ml-5">
              <i className={`bi bi-share mr-1 text-[10px] mb-[-2px]`}></i>{' '}
              {formatCount(postAnalysisData.post.totalShares)}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between text-[12px]">
          <PercentageChange
            percentage={postAnalysisData.postChangePercentage}
          />
          <div className="flex items-center ml-auto">
            <i className={`bi bi-heart mr-1 mb-[-2px]`}></i>{' '}
            {formatCount(postAnalysisData.post.totalLikes)}
          </div>
          <div className="flex items-center ml-5">
            <i className={`bi bi-bookmark mr-1 mb-[-2px]`}></i>{' '}
            {formatCount(postAnalysisData.post.totalBookmarks)}
          </div>
          <div className="flex items-center ml-5">
            <i className={`bi bi-chat-left-text mr-1 mb-[-2px]`}></i>{' '}
            {formatCount(postAnalysisData.post.totalReplies)}
          </div>
        </div>
      </div>

      <div className="card_body pad">
        <div className="text-lg text-[var(--text-secondary)]">
          Comment Analysis
        </div>

        <div className="flex items-end my-3 justify-between">
          <div className="text-2xl leading-none text-[var(--custom)]">
            {formatCount(postAnalysisData.comment.totalComments)}
          </div>
        </div>
        <div className="flex items-center justify-between text-[12px]">
          <PercentageChange
            percentage={postAnalysisData.commentPercentageChange}
          />
          <div className="flex items-center ml-auto">
            <i className={`bi bi-hand-thumbs-up mr-1 mb-[-2px]`}></i>{' '}
            {formatCount(postAnalysisData.comment.totalLikes)}
          </div>
          <div className="flex items-center ml-5">
            <i className={`bi bi-hand-thumbs-down mr-1 mb-[-2px]`}></i>{' '}
            {formatCount(postAnalysisData.comment.totalHates)}
          </div>
          <div className="flex items-center ml-5">
            <i className={`bi bi-chat mr-1 mb-[-2px]`}></i>{' '}
            {formatCount(postAnalysisData.comment.totalReplies)}
          </div>
        </div>
      </div>

      <div className="card_body pad">
        <div className="text-lg text-[var(--text-secondary)]">
          Competition Analysis
        </div>

        <div className="flex items-end my-3 justify-between">
          <div className="text-2xl leading-none text-[var(--custom)]">10</div>
        </div>
        <div className="flex items-center justify-between text-[12px]">
          <div className="flex items-center text-green-400">+ 15K</div>
          <div className="flex items-center ml-auto text-red-400">-₦ 215K</div>
          <div className="flex items-center ml-5 text-green-400">+₦ 0.00</div>
          <div className="flex items-center ml-5">
            <i className={`bi bi-people mr-1 mb-[-2px]`}></i> 1K
          </div>
        </div>
      </div>
    </div>
  )
}
