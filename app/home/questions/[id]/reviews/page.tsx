'use client'
import Image from 'next/image'

const ExamReviews = () => {
  return (
    <>
      <div className="relative flex-1 flex justify-center">
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
          <div className="sm:text-xl bg-[var(--secondary)] py-1 px-2 uppercase text-center">
            Sorry, No Exam Reviews Found
          </div>
        </div>
      </div>
    </>
  )
}

export default ExamReviews
