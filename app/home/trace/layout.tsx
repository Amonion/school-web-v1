'use client'
const TraceLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="flex flex-col items-center w-full overflow-auto">
        {children}
      </div>
    </>
  )
}

export default TraceLayout
