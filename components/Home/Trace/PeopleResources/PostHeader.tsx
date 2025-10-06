import Link from "next/link";
import Image from "next/image";

import React from "react";
import { UserInfo } from "@/src/interface/user/interface";

interface PostProps {
  user: UserInfo;
}
const PostHeader: React.FC<PostProps> = ({ user }) => {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
      }}
      className="flex mb-3 cursor-default"
    >
      {
        <Link
          href={`/home/user/${user.username}`}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden mr-3"
        >
          <Image
            style={{ height: "100%", objectFit: "cover" }}
            src={`${user.picture || "/avatar.png"}`}
            loading="lazy"
            sizes="100vw"
            className="w-full h-full object-cover"
            width={0}
            height={0}
            alt={`${user.username}`}
          />
        </Link>
      }
      <div className="flex-1">
        <div className="flex items-center flex-wrap">
          <Link
            href={`/home/user/${user.username}`}
            className="account_name line-clamp-1 mr-2"
          >
            {user.displayName}
          </Link>
          {user.isVerified && (
            <i className="bi bi-shield-check verify_icon"></i>
          )}
          <Link href={`/home/user/${user.username}`} className="post_username ">
            @{user.username}
          </Link>
          <div className="ml-auto text-sm">{user.currentSchoolCountry}</div>
        </div>

        <div className="flex justify-between">
          {user.isVerified ? (
            <Link
              href={`/home/school/${user.username}`}
              className="flex text-sm items-center line-clamp-1 overflow-ellipsis"
            >
              {user.currentSchoolName}
            </Link>
          ) : (
            <div className="flex text-xs items-center ">Not Verified</div>
          )}
          <div className="flex items-center">
            <Link href={`/home/chat/user/${user.username}`} className="m">
              <i className="bi bi-envelope text-[var(--custom)] cursor-pointer"></i>
            </Link>
            {/* <div className="follow_btn">follow</div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostHeader;
