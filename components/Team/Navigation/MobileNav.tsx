import { NavStore } from '@/src/zustand/notification/Navigation'

export default function MobileNav() {
  const { toggleVNav, toggleAsideVNav } = NavStore()
  return (
    <div className="border-t-2 border-t-[var(--border-color)] flex bg-[var(--white)] justify-between items-center py-2 px-2 fixed bottom-0 w-full left-0 z-20 sm:hidden">
      <span onClick={toggleVNav} className="mobile_navs">
        <i className="bi bi-text-left text-lg text-[var(--text-title-color)]"></i>
      </span>
      <span className="mobile_navs">
        <i className="bi bi-camera-video text-lg text-[var(--text-title-color)]"></i>
      </span>
      <span className="mobile_navs">
        <i className="bi bi-shop-window text-lg text-[var(--text-title-color)]"></i>
      </span>
      <span className="mobile_navs">
        <i className="bi bi-music-note-beamed text-lg text-[var(--text-title-color)]"></i>
      </span>
      <span onClick={toggleAsideVNav} className="mobile_navs">
        <i className="bi bi-people text-lg text-[var(--text-title-color)]"></i>
      </span>
    </div>
  )
}
