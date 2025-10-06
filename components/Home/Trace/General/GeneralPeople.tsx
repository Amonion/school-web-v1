import Link from "next/link";
import Image from "next/image";

import { truncateString } from "@/lib/helpers";
import { General } from "@/src/interface/team/interface";

interface GeneralUserProps {
  item: General;
  lastRef?: React.RefObject<HTMLDivElement>;
}

const GeneralUser: React.FC<
  GeneralUserProps & { lastRef?: React.RefObject<HTMLDivElement> }
> = ({ item, lastRef }) => {
  const intro =
    "Hi, lets socialize and exchange ideas to acheive something great.";

  return (
    <>
      <div
        ref={lastRef || null}
        className="post_card user cursor-pointer w-full"
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="flex mb-3 cursor-default"
        >
          {
            <Link
              href={`/home/user/${item.username}`}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden mr-3"
            >
              <Image
                style={{ height: "100%", objectFit: "cover" }}
                src={`${item.picture || "/avatar.png"}`}
                loading="lazy"
                sizes="100vw"
                className="w-full h-full object-cover"
                width={0}
                height={0}
                alt={`${item.username}`}
              />
            </Link>
          }
          <div className="flex-1">
            <div className="flex items-center flex-wrap">
              <Link
                href={`/home/user/${item.username}`}
                className="account_name line-clamp-1 mr-2"
              >
                {item.displayName}
              </Link>
              {item.isVerified && (
                <i className="bi bi-shield-check verify_icon"></i>
              )}
              <Link
                href={`/home/user/${item.username}`}
                className="post_username "
              >
                @{item.username}
              </Link>
              <div className="ml-auto text-sm">{item.currentSchoolCountry}</div>
            </div>

            <div className="flex justify-between">
              {item.isVerified ? (
                <Link
                  href={`/home/school/${item.username}`}
                  className="flex text-sm items-center line-clamp-1 overflow-ellipsis"
                >
                  {item.currentSchoolName}
                </Link>
              ) : (
                <div className="flex text-xs items-center ">Not Verified</div>
              )}
              <div className="flex items-center">
                <Link href={`/home/chat/user/${item.username}`} className="m">
                  <i className="bi bi-envelope text-[var(--custom)] cursor-pointer"></i>
                </Link>
                {/* <div className="follow_btn">follow</div> */}
              </div>
            </div>
          </div>
        </div>

        <div className="p-1 rounded-[5px] cursor-pointer mb-2 text-[14px] sm:text-[16px] ">
          <div
            dangerouslySetInnerHTML={{
              __html: item.intro ? truncateString(item.intro, 100) : intro,
            }}
          ></div>
        </div>

        {/* <PostStat post={post} /> */}
      </div>
    </>
  );
};

export default GeneralUser;
