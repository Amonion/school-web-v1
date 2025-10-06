'use client'
import Image from 'next/image'
const UserExams = () => {
  return (
    <>
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
            Sorry, No Exams Found
          </div>
        </div>
      </div>
    </>
  )
}

export default UserExams
