"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Success: React.FC = () => {
  const router = useRouter();

  return (
    <>
      <div className="title">Congratulations</div>
      <Image
        src="/images/success.png"
        loading="lazy"
        sizes="100vw"
        width={0}
        height={0}
        style={{ width: "auto", height: "auto" }}
        alt=""
        className="mb-10"
      />
      <div className="text-2xl text-[var(--text-title-color)] text-center mb-5">
        Your account was created successfully
      </div>
      <div onClick={() => router.replace("/sign-in")} className="custom-btn ">
        Sign In &amp; Continue
      </div>
    </>
  );
};

export default Success;
