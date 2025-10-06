import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { truncateString } from "@/lib/helpers";
import { General } from "@/src/interface/team/interface";
import Image from "next/image";
import GeneralPost from "./General/GeneralPost";
import GeneralUser from "./General/GeneralUser";
import GeneralSchool from "./General/GeneralSchool";
import GeneralExam from "./General/GeneralExam";

interface GeneralCardProps {
  item: General;
  lastRef?: React.RefObject<HTMLDivElement>;
}

const GeneralCard: React.FC<
  GeneralCardProps & { lastRef?: React.RefObject<HTMLDivElement> }
> = ({ item, lastRef }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const moveToPost = (item: General) => {
    setLoading(true);
    if (item.type.toLowerCase() === "exam") {
      router.push(`/exam/${item.id}`);
    } else if (item.type.toLowerCase() === "school") {
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <>
      {item.type === "Post" ? (
        <GeneralPost item={item} lastRef={lastRef} />
      ) : item.type === "User" ? (
        <GeneralUser item={item} lastRef={lastRef} />
      ) : item.type === "School" ? (
        <GeneralSchool item={item} lastRef={lastRef} />
      ) : item.type === "Exam" ? (
        <GeneralExam item={item} lastRef={lastRef} />
      ) : (
        <div ref={lastRef || null} className="post_card school flex w-full">
          {
            <div
              onClick={() => moveToPost(item)}
              className="h-[50px] w-[70px] xs:rounded-[10px] rounded-[5px] block overflow-hidden"
            >
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
          }
          <div className="flex flex-1 relative flex-wrap px-[10px]">
            {item.type === "Post" ? (
              <div className="flex  flex-wrap w-full cursor-default">
                <div className="flex-1 flex items-start flex-col">
                  <div className="mb-auto xs:pt-0 flex items-center flex-wrap">
                    <div className="account_name mr-1">
                      {truncateString(item.displayName, 150)}
                    </div>
                    <div
                      onClick={() => moveToPost(item)}
                      className="post_username "
                    >
                      @{item.username}
                    </div>
                  </div>
                  <div className="mb-auto xs:pt-0 flex items-center flex-wrap">
                    <div
                      className="text-[15px]"
                      dangerouslySetInnerHTML={{
                        __html: truncateString(item.content, 150),
                      }}
                    ></div>
                  </div>
                  <div className="w-full flex items-center">
                    <div
                      onClick={() => moveToPost(item)}
                      className="text-sm absolute top-[-10px] right-0 lowercase"
                    >
                      {item.type}
                    </div>
                    {loading && (
                      <i
                        className={`bi ml-auto  bi-opencollective loading text-[var(--custom-color)]`}
                      ></i>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex  flex-wrap w-full cursor-default">
                <div className="flex-1 flex items-start flex-col">
                  <div className="mb-auto xs:pt-0 flex items-center flex-wrap">
                    <div
                      onClick={() => moveToPost(item)}
                      className="account_name mr-1"
                    >
                      {item.name
                        ? truncateString(item.name, 150)
                        : truncateString(item.title, 150)}
                    </div>
                    <div
                      onClick={() => moveToPost(item)}
                      className="post_username "
                    >
                      @{item.username}
                    </div>
                  </div>
                  <div className="w-full flex items-center">
                    <div
                      onClick={() => moveToPost(item)}
                      className="follow_btn"
                    >
                      {item.type}
                    </div>
                    {loading && (
                      <i
                        className={`bi ml-auto  bi-opencollective loading text-[var(--custom-color)]`}
                      ></i>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default GeneralCard;
