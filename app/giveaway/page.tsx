'use client'
import MainGiveaway from '@/components/Giveaway/MainGiveaway'
import HomeMediaHolder from '@/components/Home/Media/HomeMediaHolder'
import MainNewsGrid from '@/components/News/MainNewsGrid'
import PopularNews from '@/components/News/PopularNews'
import RelatedNews from '@/components/News/RelatedNews'
const Home: React.FC = () => {
  return (
    <>
      <HomeMediaHolder />
      <MainGiveaway />
      <PopularNews />
      <MainNewsGrid />
      <RelatedNews />
    </>
  )
}

export default Home
