import { NavStore } from '@/src/zustand/notification/Navigation'
import FriendsListBody from '@/components/Chat/FriendsListBody'

export default function AsideFriends() {
  const { asideNav, toggleAsideVNav } = NavStore()

  return (
    <div
      onClick={toggleAsideVNav}
      className={` ${asideNav ? 'right-0' : 'right-[-100%]'} v_nav aside`}
    >
      <div
        onClick={(e) => {
          e.stopPropagation()
        }}
        className="v_nav_card aside"
      >
        <div
          onClick={(e) => {
            e.stopPropagation()
          }}
          className="v_nav_card news"
        >
          <FriendsListBody />
        </div>
      </div>
    </div>
  )
}
