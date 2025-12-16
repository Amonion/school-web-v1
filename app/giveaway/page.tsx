'use client'
import FeaturedGiveaways from '@/components/Giveaway/FeaturedGiveaways'
import GiveawayGrid from '@/components/Giveaway/GiveawayGrid'
import MainGiveaway from '@/components/Giveaway/MainGiveaway'
import HomeMediaHolder from '@/components/Home/Media/HomeMediaHolder'
import RelatedNews from '@/components/News/RelatedNews'
const Home: React.FC = () => {
  return (
    <>
      <HomeMediaHolder />
      <MainGiveaway />
      <FeaturedGiveaways />
      <GiveawayGrid />
      <RelatedNews />
    </>
  )
}

export default Home
