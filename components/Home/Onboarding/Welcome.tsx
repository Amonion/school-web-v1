'use client'
import Image from 'next/image'

const Welcome = () => {
  return (
    <div className="flex flex-1 flex-col items-center px-5 text-center ">
      <div className="title">WELCOME </div>
      <div className="text-sm">TO</div>
      <div className="sm:text-4xl text-2xl text-[var(--custom-color)] font-bold mb-3">
        SCHOOLING SOCIAL
      </div>

      <Image
        alt={`welcom of `}
        src="/images/welcome.png"
        width={0}
        sizes="100vw"
        height={0}
        style={{ width: '100%', height: 'auto' }}
      />
      <div className="mt-3">
        Welcome to SchoolingSocial
        <br />
        {`We're excited to have you on board.
You can connect with students, share ideas, participate in scholarships, and grow together.
Let’s make learning engaging and fun.`}
      </div>
    </div>
  )
}

export default Welcome
