"use client";
import { User } from "@/src/interface/team/interface";
import UserStore from "@/src/zustand/users/User";
import Image from "next/image";

interface SearchedUserProps {
  user: User;
  index: number; // Pass the index as a prop
}

const SearchedUser: React.FC<SearchedUserProps> = ({ user, index }) => {
  const { toggleChecked } = UserStore();

  return (
    <div className=" w-full border border-[var(--border-color)] rounded-xl mb-5 px-3 py-3">
      <div className="flex items-start relative">
        <div className="min-w-[50px] h-[50px] rounded-full mr-2 overflow-hidden">
          {user && user.picture && (
            <Image
              className="object-cover "
              src={String(user.picture)}
              loading="lazy"
              alt="username"
              sizes="100vw"
              height={0}
              width={0}
              style={{ height: "50px", width: "50px" }}
            />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center">
            <div>{user.displayName}</div>
            <i className="bi bi-shield-check mx-1 text-[var(--custom-color)] text-[10px]"></i>
            <div className="text-sm">@{user.username}</div>
          </div>
          <div className="flex items-center">
            <div className="text-[12px]">NG</div>
            <div className="font-extrabold mx-2 mb-2">.</div>
            <div className="text-[12px]">MSC</div>
            <div className="font-extrabold mx-2 mb-2">.</div>

            <div className="text-[12px]">IMSU</div>
          </div>
        </div>
        <div
          onClick={() => toggleChecked(index)}
          className={`absolute top-[-5px] text-gray-300 right-[-5px] px-[8px] py-[2px] text-sm border bg-[var(--custom)] border-[var(--border-color)] ml-auto cursor-pointer rounded-[25px] ${
            user.isChecked ? "active text-white bg-[var(--custom)]" : ""
          }`}
        >
          {user.isChecked ? `Unfollow` : `Follow`}
        </div>
      </div>
      <div className="text-start ">{user.intro}</div>
    </div>
  );
};

export default SearchedUser;
