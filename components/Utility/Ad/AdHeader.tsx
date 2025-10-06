'use client'

interface AdHeaderProps {
  page: number
  title: string
}

export const AdHeader: React.FC<AdHeaderProps> = ({ page, title }) => {
  return (
    <>
      <div className="flex flex-col items-end mb-5 -mt-2">
        <div className="flex text-lg sm:text-xl">
          {' '}
          <span className="text-[var(--custom)] mr-2">{page}/4</span> {title}
        </div>
        <div className="grid grid-cols-4 w-full gap-2">
          <div className={`h-[2px] rounded-[5px] bg-[var(--custom)]`}></div>
          <div
            className={`h-[2px] rounded-[5px] ${
              page > 1 ? 'bg-[var(--custom)]' : 'bg-[var(--primary)]'
            }`}
          ></div>
          <div
            className={`h-[2px] rounded-[5px] ${
              page > 2 ? 'bg-[var(--custom)]' : 'bg-[var(--primary)]'
            }`}
          ></div>
          <div
            className={`h-[2px] rounded-[5px] ${
              page > 3 ? 'bg-[var(--custom)]' : 'bg-[var(--primary)]'
            }`}
          ></div>
        </div>
      </div>
    </>
  )
}

export default AdHeader
