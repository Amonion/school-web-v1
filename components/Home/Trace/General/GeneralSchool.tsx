import { General } from "@/src/interface/team/interface";
import Image from "next/image";
import Link from "next/link";

interface GeneralSchoolProps {
  item: General;
  lastRef?: React.RefObject<HTMLDivElement>;
}

const GeneralSchool: React.FC<
  GeneralSchoolProps & { lastRef?: React.RefObject<HTMLDivElement> }
> = ({ item, lastRef }) => {
  const intro = "Peace, Unity and Progress.";

  return (
    <>
      <div ref={lastRef || null} className="">
        <Link
          href={`/home/school/${item.id}`}
          className="post_card all flex w-full"
        >
          <div className="h-auto flex items-center justify-center min-h-[70px] max-w-[70px] sm:max-h-[100px] sm:max-w-[100px] xs:rounded-[10px] rounded-[5px]  overflow-hidden">
            {item.picture ? (
              <Image
                style={{ height: "100%", objectFit: "cover" }}
                src={`${item.picture}`}
                loading="lazy"
                sizes="100vw"
                className="w-full h-full object-cover"
                width={0}
                height={0}
                alt={`${item.name}`}
              />
            ) : (
              <Image
                style={{ height: "auto" }}
                src="/images/cap.png"
                loading="lazy"
                sizes="100vw"
                className="w-[100px] h-auto "
                width={0}
                height={0}
                alt={`${item.name}`}
              />
            )}
          </div>
          <div className="flex flex-1 relative flex-wrap px-[10px]">
            <div className="flex  flex-wrap w-full ">
              <div className="flex-1 flex items-start flex-col">
                <div className="mb-auto xs:pt-0 flex items-center flex-wrap">
                  <div className="account_name mr-1 line-clamp-1 overflow-ellipsis">
                    {item.name}
                  </div>
                  <div className="post_username ">@{item.username}</div>
                </div>
                <div className="flex flex-wrap text-xs items-center my-1">
                  <div className="">{item.countrySymbol}</div>
                  <div className="profile_dot"></div>
                  <div className="">{item.state}</div>
                  <div className="profile_dot"></div>
                  <div className="flex items-center">
                    {" "}
                    <i className="bi bi-star-fill text-yellow-500 mr-[2px]"></i>
                    4.8
                  </div>
                  <div className="profile_dot"></div>
                  3.5K
                  {/* <div className="">{formatDateToDDMMYY(school.createdAt)}</div> */}
                </div>
                <div className="mb-auto xs:pt-0 flex items-center flex-wrap">
                  <div
                    className="text-[14px] line-clamp-2"
                    dangerouslySetInnerHTML={{
                      __html: item.description ? item.description : intro,
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

export default GeneralSchool;
