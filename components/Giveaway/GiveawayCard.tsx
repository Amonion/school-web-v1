import Image from 'next/image'
import { getRemainingTime } from '@/lib/helpers'
import { Weekend } from '@/src/zustand/exam/Weekend'
import { CountdownCellExam } from '../CountDownCell'

interface GiveawayCardProps {
  giveaway: Weekend
  lastRef?: React.RefObject<HTMLDivElement>
}

const GiveawayCard: React.FC<
  GiveawayCardProps & { lastRef?: React.RefObject<HTMLDivElement> }
> = ({ giveaway, lastRef }) => {
  return (
    <>
      <div ref={lastRef} className="mb-2">
        <div className="w-full lg:h-[200px] text-white h-[250px] relative xs:h-[300px] sm:h-[250px] md:h-[250px] overflow-hidden">
          {giveaway.picture && (
            <Image
              src={String(giveaway.picture)}
              alt="Media"
              width={0}
              height={0}
              sizes="100vw"
              className="w-full h-full object-cover  overflow-clip"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          {giveaway.startAt && (
            <div className="absolute right-1 top-2 rounded-[25px] bg-black/50 text-white text-[12px] items-center flex">
              <CountdownCellExam
                startingTime={getRemainingTime(giveaway.startAt)}
              />
            </div>
          )}
          <div className="line-clamp-2 overflow-ellipsis absolute z-10 bottom-2 left-0 p-2">
            {giveaway.title}
          </div>
        </div>
        {/* <NewsStat post={post} /> */}
      </div>
    </>
  )
}

export default GiveawayCard
