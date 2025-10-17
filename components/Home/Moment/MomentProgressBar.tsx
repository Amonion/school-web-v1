import { MomentStore } from '@/src/zustand/post/Moment'
import { useEffect, useState } from 'react'

export default function MomentProgressBar() {
  const [progress, setProgress] = useState(0)
  const {
    activeMoment,
    moments,
    activeMomentIndex,
    activeMomentMediaIndex,
    isPlaying,
    openMomentModal,
    changeActiveMomentMedia,
  } = MomentStore()

  useEffect(() => {
    if (!activeMoment?.media?.length) return

    const currentItem = activeMoment.media[activeMomentMediaIndex]
    if (!currentItem) return

    setProgress(0)
    const duration = currentItem.duration * 1000
    const step = 100
    const increment = (step / duration) * 100
    let interval: NodeJS.Timeout | null = null

    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev + increment >= 100) {
            if (interval) clearInterval(interval)
            setTimeout(() => {
              if (activeMomentMediaIndex + 1 < activeMoment.media.length) {
                changeActiveMomentMedia(
                  activeMomentMediaIndex + 1,
                  activeMomentIndex
                )
              } else if (activeMomentIndex + 1 < moments.length) {
                openMomentModal(activeMomentIndex + 1)
              }
            }, 0)
            return 100
          }
          return prev + increment
        })
      }, step)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [activeMoment?._id, activeMomentMediaIndex, isPlaying])

  if (!activeMoment?.media?.length) return null

  return (
    <div
      style={{
        gridTemplateColumns: `repeat(${activeMoment.media.length}, minmax(0, 1fr))`,
      }}
      className="grid gap-1 absolute top-1 left-0 px-2 w-full z-20"
    >
      {activeMoment.media.map((item, index) => (
        <div
          key={index}
          className="h-1 bg-gray-300/20 rounded-full overflow-hidden"
        >
          <div
            className="h-full bg-gray-300 rounded-full transition-[width] duration-100 linear"
            style={{
              width:
                index < activeMomentMediaIndex
                  ? '100%'
                  : index === activeMomentMediaIndex
                  ? `${progress}%`
                  : '0%',
            }}
          ></div>
        </div>
      ))}
    </div>
  )
}
