'use client'
export default function FriendsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // const socket = useSocket();

  return (
    <>
      <div className="w-full flex-1">{children}</div>
    </>
  )
}
