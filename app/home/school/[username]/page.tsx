'use client'
import Image from 'next/image'

export default function SchoolProfile() {
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
        <div className="bg-[var(--secondary)] w-full py-3 absoluteCenter">
          <div className="text-xl uppercase text-center">
            Sorry, No Post Found
          </div>
        </div>
      </div>
    </>
  )
}
