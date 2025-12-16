import WeekendStore, { Weekend } from '@/src/zustand/exam/Weekend'
import { useEffect, useState } from 'react'
import GiveawayCard from './GiveawayCard'

export default function GiveawayGrid() {
  const { giveaways } = WeekendStore()
  const [normalGiveaways, setNormalGiveaways] = useState<Weekend[]>([])

  useEffect(() => {
    const filt = giveaways.filter((item) => !item.isFeatured && !item.isMain)
    setNormalGiveaways(filt)
  }, [giveaways])

  return (
    <>
      <div className="text-lg px-2 mb-2 sm:px-0">{`Today's`} Giveaways</div>

      <div className="grid sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-x-2 gap-y-4 sm:pb-0">
        {normalGiveaways.map((item, index) => (
          <GiveawayCard key={index} giveaway={item} />
        ))}
      </div>
    </>
  )
}
