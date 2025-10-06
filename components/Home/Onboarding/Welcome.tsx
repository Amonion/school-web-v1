"use client";
import Image from "next/image";

const Welcome = () => {
  return (
    <div className="flex flex-col items-center px-5 text-center ">
      <div className="title">WELCOME </div>
      <div className="text-sm">TO</div>
      <div className="sm:text-4xl text-2xl text-[var(--custom-color)] font-bold mb-3">
        SCHOOLING SOCIAL
      </div>

      <Image
        alt={`welcom of `}
        src="/images/welcome.png"
        width={0}
        sizes="100vw"
        height={0}
        style={{ width: "100%", height: "auto" }}
      />
      <div className="mt-3">
        The issue arises because setCurrentIndex is not being updated as the
        slide changes. This can be resolved by adding the onSlideChange event to
        the Swiper component.
      </div>
    </div>
  );
};

export default Welcome;
