'use client'
import { formatCount } from '@/lib/helpers'
import PercentageChange from '../Utility/Dashboard/PercentageChange'

export default function SchoolDashboardCards() {
  return (
    <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
      <div className="card_body pad">
        <div className="text-lg text-[var(--text-secondary)]">Students</div>

        <div className="flex items-end my-3 justify-between">
          <div className="text-2xl leading-none text-[var(--custom)] flex items-end">
            {formatCount(5304)}{' '}
            <span className="text-[var(--text-primary)] -mb-1 text-base ml-2">
              Active
            </span>
          </div>
        </div>
        <div className="flex items-end justify-between text-[12px]">
          <PercentageChange percentage={+2.8} />
          <div className="text-xl leading-none ml-auto text-[var(--text-secondary)] flex items-end">
            {formatCount(8904)}{' '}
            <span className="text-[var(--text-primary)] -mb-1 text-base ml-2">
              Graduated
            </span>
          </div>
        </div>
      </div>

      <div className="card_body pad">
        <div className="text-lg text-[var(--text-secondary)]">Staff</div>

        <div className="flex items-end my-3 justify-between">
          <div className="text-2xl leading-none text-[var(--custom)] flex items-end">
            {formatCount(54)}{' '}
            <span className="text-[var(--text-primary)] -mb-1 text-base ml-2">
              Active
            </span>
          </div>
        </div>
        <div className="flex items-end justify-between text-[12px]">
          <PercentageChange percentage={+2.8} />
          <div className="text-xl leading-none ml-auto text-[var(--text-secondary)] flex items-end">
            {formatCount(23)}{' '}
            <span className="text-[var(--text-primary)] -mb-1 text-base ml-2">
              Left
            </span>
          </div>
        </div>
      </div>

      <div className="card_body pad">
        <div className="text-lg text-[var(--text-secondary)]">Subjects</div>

        <div className="flex items-end my-3 justify-between">
          <div className="text-2xl leading-none text-[var(--custom)] flex items-end">
            {formatCount(54)}{' '}
            <span className="text-[var(--text-primary)] -mb-1 text-base ml-2">
              Active
            </span>
          </div>
        </div>
        <div className="flex items-end justify-between text-[12px]">
          <PercentageChange percentage={+2.8} />
          <div className="text-xl leading-none ml-auto text-[var(--text-secondary)] flex items-end">
            {formatCount(23)}{' '}
            <span className="text-[var(--text-primary)] -mb-1 text-base ml-2">
              Inactive
            </span>
          </div>
        </div>
      </div>

      {/* <div className="card_body pad">
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
      </div> */}
    </div>
  )
}
