import { NavStore } from '@/src/zustand/notification/Navigation'
import FriendStore from '@/src/zustand/chat/Friend'
import EachFriend from '../../Chat/EachFriend'

export default function AsideFriends() {
  const { asideNav, toggleAsideVNav } = NavStore()
  const { friendsResults } = FriendStore()

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
          <div
            className={`rounded-[20px] bg-[var(--primary)] mt-3 mb-5 h-[40px] w-full flex items-center px-3`}
          >
            <i className="bi bi-sliders cursor-pointer mr-3"></i>
            <input
              type="search"
              // onChange={(e) => setSearchedText(e.target.value)}
              className={`bg-transparent border-none outline-none flex-1`}
              placeholder={`Search friends or conversation...`}
            />
            <i className="bi bi-search common-icon cursor-pointer"></i>
          </div>
          <ul className="m-0 p-0">
            {friendsResults.map((friend, index) => (
              <EachFriend key={index} friend={friend} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
