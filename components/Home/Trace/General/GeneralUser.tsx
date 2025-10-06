import { formatCount, formatDateToDDMMYY, truncateString } from "@/lib/helpers";
import { General } from "@/src/interface/team/interface";
import { useAuthStore } from "@/src/zustand/authStore";
import { MessageStore } from "@/src/zustand/msgStore";
import GeneralStore from "@/src/zustand/users/General";
import Image from "next/image";
import Link from "next/link";
import pluralize from "pluralize";
import { useEffect, useState } from "react";

interface GeneralUserProps {
  item: General;
  lastRef?: React.RefObject<HTMLDivElement>;
}

const GeneralUser: React.FC<
  GeneralUserProps & { lastRef?: React.RefObject<HTMLDivElement> }
> = ({ item, lastRef }) => {
  const { followUserAccount, loading } = GeneralStore();
  const { setMessage } = MessageStore();
  const { user } = useAuthStore();
  const [id, setId] = useState("");

  const followAccount = (id: string) => {
    setId(id);
    followUserAccount(
      `/users/follow/${id}`,
      { isFolowed: item.isFollowed, followerId: user?._id },
      setMessage
    );
  };

  const intro =
    "Hi, lets socialize and exchange ideas to acheive something great.";

  useEffect(() => {
    if (!loading) {
      setId("");
    }
  }, [loading]);
  return (
    <>
      <div ref={lastRef || null} className="w-full post_card">
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
              <div className="ml-auto text-xs">
                {formatDateToDDMMYY(item.createdAt)}
              </div>
            </div>

            <div className="flex justify-between">
              <div className="flex items-center">
                <div className="flex text-sm items-center mr-4">
                  <div className="text-[var(--text-title-color)] mr-1">
                    {formatCount(Number(item?.followers))}{" "}
                  </div>{" "}
                  {pluralize("Follower", Number(item?.followers))}
                </div>
                <div className="flex text-sm items-center ">
                  <div className="text-[var(--text-title-color)] mr-1">
                    {formatCount(Number(item?.following))}{" "}
                  </div>{" "}
                  Following
                </div>
              </div>
              <div className="flex items-center">
                <Link
                  href={`/home/chat/friends/${item.username}`}
                  className="mr-2"
                >
                  <i className="bi bi-envelope text-[var(--custom)] cursor-pointer"></i>
                </Link>
                {loading && item.id === id ? (
                  <div className="follow_btn normal">
                    <div className="flex">
                      <i
                        className={`bi  bi-opencollective loading sm text-[var(--custom-color)]`}
                      ></i>{" "}
                    </div>
                    processing
                  </div>
                ) : (
                  <div
                    className={`follow_btn normal ${
                      item.isFollowed && "active"
                    }`}
                    onClick={() => followAccount(item.id)}
                  >
                    {item.isFollowed ? `unfollow` : `follow`}
                  </div>
                )}
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
      </div>
    </>
  );
};

export default GeneralUser;
