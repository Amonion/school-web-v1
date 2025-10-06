import { truncateString } from "@/lib/helpers";
import { General } from "@/src/interface/team/interface";
import Image from "next/image";
import Link from "next/link";

interface GeneralPostProps {
  item: General;
  lastRef?: React.RefObject<HTMLDivElement>;
}

const GeneralPost: React.FC<
  GeneralPostProps & { lastRef?: React.RefObject<HTMLDivElement> }
> = ({ item, lastRef }) => {
  return (
    <>
      <div ref={lastRef || null} className="w-full">
        <Link
          href={`/home/post/${item.id}`}
          className="post_card all flex w-full"
        >
          {item.media ? (
            <div className="h-auto max-h-[70px] w-[70px] sm:max-h-[150px] sm:w-[150px] xs:rounded-[10px] rounded-[5px] block overflow-hidden">
              {item.media.type === "video" ? (
                <video
                  className="w-full h-full object-cover pointer-events-none"
                  src={item.media.source}
                  muted
                  loop
                  preload="metadata"
                />
              ) : (
                <Image
                  style={{ height: "100%", objectFit: "cover" }}
                  src={item.media.source}
                  loading="lazy"
                  sizes="100vw"
                  className="w-full h-full object-cover"
                  width={0}
                  height={0}
                  alt={item.name}
                />
              )}
            </div>
          ) : (
            <div className="h-[50px] w-[70px] xs:rounded-[10px] rounded-[5px] block overflow-hidden">
              <Image
                style={{ height: "100%", objectFit: "cover" }}
                src={`${
                  item.picture !== "" ? item.picture : "/images/avatar.jpg"
                }`}
                loading="lazy"
                sizes="100vw"
                className="w-full h-full object-cover"
                width={0}
                height={0}
                alt={`${item.name}`}
              />
            </div>
          )}
          <div className="flex flex-1 relative flex-wrap px-[10px]">
            <div className="flex  flex-wrap w-full ">
              <div className="flex-1 flex items-start flex-col">
                <div className="mb-auto xs:pt-0 flex items-center flex-wrap">
                  <div className="account_name mr-1">
                    {truncateString(item.displayName, 150)}
                  </div>
                  <div className="post_username ">@{item.username}</div>
                </div>
                <div className="mb-auto xs:pt-0 flex items-center flex-wrap">
                  <div
                    className="text-[14px] line-clamp-2"
                    dangerouslySetInnerHTML={{
                      __html: truncateString(item.content, 150),
                    }}
                  ></div>
                </div>
                <div className="w-full flex items-center">
                  <div className="text-sm absolute top-[-10px] right-0 lowercase">
                    {item.type}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </>
  );
};

export default GeneralPost;
