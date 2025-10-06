'use client'
import React, { useEffect, useRef, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import { Pagination, Navigation } from 'swiper/modules'
import { Swiper as SwiperType } from 'swiper'

// import Interest from "@/components/Users/Onboarding/Interests";
import '@/styles/team/team.css'
import '@/styles/users/main.css'
import '@/styles/users/onboard.css'
import UserResponse from '@/components/Messages/UserResponse'
import { UserStore } from '@/src/zustand/user/User'
import Welcome from '@/components/Home/Onboarding/Welcome'
import Username from '@/components/Home/Onboarding/Username'
import Final from '@/components/Home/Onboarding/Final'
// import Accounts from "@/components/Users/Onboarding/Accounts";
const OnboardingCarousel = () => {
  const swiperRef = useRef<SwiperType | null>(null)
  const { userForm, selectedUsers, resetForm } = UserStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const totalSlides = 3

  useEffect(() => {
    return () => {
      resetForm()
    }
  }, [])

  return (
    <div className="card_body fixed h-[100vh] left-0 top-0 w-full overflow-hidden ">
      <UserResponse />

      <div className="max-w-[600px] mx-auto my-auto">
        <Swiper
          modules={[Pagination, Navigation]}
          spaceBetween={50}
          slidesPerView={1}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          onSlideChange={(swiper) => setCurrentIndex(swiper.activeIndex)}
          style={{ height: '100%', overflowY: 'auto' }}
          allowTouchMove={false}
        >
          <SwiperSlide>
            <Welcome />
          </SwiperSlide>

          <SwiperSlide>
            <Username />
          </SwiperSlide>

          <SwiperSlide>
            <Final />
          </SwiperSlide>
        </Swiper>

        <div className="flex justify-between items-center">
          {currentIndex > 0 && (
            <button
              className="custom_btn"
              onClick={() => {
                if (swiperRef.current) {
                  swiperRef.current.slidePrev()
                }
              }}
            >
              Back
            </button>
          )}

          <div className="w-full mx-1 md:mx-4 relative">
            <div
              className="absolute bg-gray-300 h-2 rounded-full w-full"
              style={{ zIndex: -1 }}
            ></div>
            <div
              className="bg-[var(--custom-color)] h-2 rounded-full relative"
              style={{
                width: `${((currentIndex + 1) / totalSlides) * 100}%`,
                transition: 'width 0.5s ease-in-out',
              }}
            >
              <div className="absolute bottom-2 right-0">
                {(((currentIndex + 1) / totalSlides) * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          {currentIndex === 0 ? (
            <button
              className="custom_btn"
              onClick={() => {
                if (swiperRef.current) {
                  swiperRef.current.slideNext()
                }
              }}
            >
              Next
            </button>
          ) : currentIndex === 1 ? (
            <>
              {userForm.username !== '' &&
              userForm.picture !== '' &&
              userForm.displayName !== '' ? (
                <button
                  className="custom_btn"
                  onClick={() => {
                    if (swiperRef.current) {
                      swiperRef.current.slideNext()
                    }
                  }}
                >
                  Next
                </button>
              ) : (
                <button className="custom_btn disabled">Next</button>
              )}
            </>
          ) : (
            currentIndex === 2 && (
              <>
                {selectedUsers.length > 0 ? (
                  <button
                    className="custom_btn"
                    onClick={() => {
                      if (swiperRef.current) {
                        swiperRef.current.slideNext()
                      }
                    }}
                  >
                    Next
                  </button>
                ) : (
                  <></>
                )}
              </>
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default OnboardingCarousel
