'use client'

import ChatHead from '@/components/Chat/ChatHead'

export default function UserChat({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      {/* <div className="fixed bottom-[55px] sm:bottom-0 sm:pt-[0px] pt-[120px] inset-0 sm:relative sm:h-[85vh] sm:rounded-[10px] bg-[var(--secondary)] flex flex-col"> */}
      <div className="flex-1 sm:relative w-full h-[100vh] sm:pb-1 flex flex-col">
        <div className="sticky z-30 left-0 py-2 top-0 w-full bg-[var(--primary)] mb-2 h-[65px]">
          <ChatHead />
        </div>

        {children}
      </div>
    </>
  )
}
