import { NavStore } from '@/src/zustand/notification/Navigation'
import { useState } from 'react'

export default function MiddleHeader() {
  const [isSearchInputActive, setSearchInput] = useState(false)
  const { toggleAsideVNav } = NavStore()

  return (
    <div className="flex-1 flex items-center md:pr-5 sm:pr-2">
      <div className={` ${isSearchInputActive ? 'hidden' : 'flex'}`}>
        <div className="circular_icon_button top mobile">
          <i className="bi bi-shop-window common-icon"></i>
        </div>
        <div
          className="circular_icon_button top between"
          onClick={toggleAsideVNav}
        >
          <i className="bi bi-people common-icon"></i>
        </div>
      </div>

      <div
        className={`input_wrap ml-auto ${isSearchInputActive ? 'active' : ''}`}
      >
        <i
          className={`bi bi-sliders common-icon cursor-pointer ${
            isSearchInputActive ? '' : 'hidden'
          }`}
        ></i>

        <input
          type="search"
          onBlur={() => setSearchInput((e) => !e)}
          className={`transparent-input flex-1 ${
            isSearchInputActive ? '' : 'hidden'
          }`}
          placeholder="Search your interest..."
        />
        <i
          className="bi bi-search common-icon cursor-pointer"
          onClick={() => setSearchInput((e) => !e)}
        ></i>
      </div>
    </div>
  )
}
