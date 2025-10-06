"use client";
import Image from "next/image";
import Link from "next/link";

import UserInfoStore from "@/src/zustand/users/UserInfo";

export default function UserChatRequest() {
  const { formData } = UserInfoStore();

  return (
    <div className="w-full flex flex-col min-h-[300px] justify-center items-center px-[10px] mt-10">
      {formData.username && (
        <Link
          href={`/home/profile/${formData.username}`}
          className="w-16 h-16  rounded-full overflow-hidden mb-5"
        >
          <Image
            style={{ height: "100%", objectFit: "cover" }}
            src={`${formData.picture || "/avatar.png"}`}
            loading="lazy"
            sizes="100vw"
            className="w-full h-full object-cover"
            width={0}
            height={0}
            alt={`${formData.username}`}
          />
        </Link>
      )}

      {formData.username ? (
        <div className="text-center max-w-[400px] text-lg leading-[25px]">
          <span className="text-[var(--custom)]">{formData.username}</span>{" "}
          would not see your message as friends. Both of you will be friends
          when <span className="text-[var(--custom)]">{formData.username}</span>{" "}
          sees your message in notifications and reply you.
        </div>
      ) : (
        <div className="text-center max-w-[400px] text-3xl leading-[25px]">
          SORRY USER NOT FOUND
        </div>
      )}
    </div>
  );
}
