import Link from "next/link";
import Image from "next/image";
// import MediaDisplay from "@/components/Users/Media/MediaDisplay";
// import { useAuthStore } from "@/src/zustand/authStore";
import React, { useState, useEffect } from "react";

function truncateString(input: string, maxLength: number): string {
  if (input.length > maxLength) {
    return input.substring(0, maxLength) + "...";
  }
  return input;
}
export default function Quiz() {
  //   const { user } = useAuthStore();
  const [maxLength, setMaxLength] = useState(20);
  const [isUsername, toggleUsername] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;

      if (screenWidth > 370) {
        const num = Math.floor((screenWidth - 370) / 10);
        setMaxLength(20 + num);
      } else {
        setMaxLength(20);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="post_card">
      <div className="flex mb-3">
        <Link
          href="/home"
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden mr-3"
        >
          <Image
            style={{ height: "auto", objectFit: "cover" }}
            src="/Icon.png"
            loading="lazy"
            sizes="100vw"
            className="sm:w-40 w-32"
            width={0}
            height={0}
            alt="Schooling Social Logo"
          />
        </Link>
        <div className="flex-1">
          <div className="flex items-center flex-wrap">
            <Link href={`/home`} className="account_name">
              {truncateString("Schooling Social Weekend Quiz", maxLength)}
            </Link>
            <i className="bi bi-shield-check verify_icon"></i>
            <div className="relative ml-auto flex">
              <i
                onClick={() => toggleUsername((e) => !e)}
                className={`bi bi-caret-down-fill xl:hidden text-[18px] lg:block sm:hidden ${
                  isUsername ? "active" : ""
                }`}
              ></i>
              <Link
                href={`/home`}
                className="post_username xl:block lg:hidden md:hidden sm:block hidden"
              >
                @schooling_Social
              </Link>
              {isUsername && (
                <Link
                  href={`/home`}
                  className="post_username md:relative absolute px-2 py-1 bg-[var(--white-gray)] top-[20px] right-0 rounded-[3px]"
                >
                  @schooling_Social
                </Link>
              )}
            </div>
          </div>
          <div className="flex justify-between">
            <div className="flex items-center">
              <div className="text-[12px]">NG</div>
              <div className="post_dot">.</div>
              <div className="text-[12px]">MSC</div>
              <div className="post_dot">.</div>
              <div className="text-[12px]">IMSU</div>
            </div>

            <div className="text-sm">5th Oct, 2025</div>
          </div>
        </div>
      </div>
      {/* <MediaDisplay
        source="https://www.youtube.com/watch?v=x63EgMyPC4I"
        type="youtube"
      /> */}

      <div className="flex flex-col">
        <div className="flex justify-between mb-1">
          <div>Time remaining </div>
          <div className="text-[var(--custom-color)] font-semibold">4m:44s</div>
        </div>
        <input
          className="input_field mb-2"
          type="text"
          placeholder="Enter the code of the corresponding answer"
        />
        <button className="btn w-full sm:w-auto mx-auto ">Submit Answer</button>
      </div>
    </div>
  );
}
