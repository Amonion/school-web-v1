'use client'
import HomeMediaHolder from '@/components/Home/Media/HomeMediaHolder'
import HomeNews from '@/components/News/HomeNews'
import MainNewsGrid from '@/components/News/MainNewsGrid'
import PopularNews from '@/components/News/PopularNews'
import RelatedNews from '@/components/News/RelatedNews'
const Home: React.FC = () => {
  return (
    <>
      <HomeMediaHolder />
      <HomeNews />
      <PopularNews />
      <MainNewsGrid />
      <RelatedNews />
    </>
  )
}

export default Home
