import Link from "next/link";
import { General } from "@/src/interface/team/interface";
import Image from "next/image";

interface GeneralExamProps {
  item: General;
  lastRef?: React.RefObject<HTMLDivElement>;
}

const GeneralExam: React.FC<
  GeneralExamProps & { lastRef?: React.RefObject<HTMLDivElement> }
> = ({ item, lastRef }) => {
  const intro = "Peace, Unity and Progress.";
  return (
    <>
      <div ref={lastRef || null} className="w-full">
        <Link
          href={`/home/exam/${item.id}`}
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
                  <div className="text-[12px] text-[var(--text-secondary)] line-clamp-1 overflow-ellipsis mr-1">
                    {item.title}
                  </div>
                  <div className="text-[var(--custom)] text-[12px]">
                    @{item.name}
                  </div>
                </div>

                <div className="flex text-xs items-center mb-1">
                  <div className="">{item.subject}</div>
                  <div className="w-1 h-1 bg-[var(--text-primary)] rounded-full mx-1"></div>
                  <div className="">{item.nature}</div>
                </div>

                <div className="mb-auto xs:pt-0 flex items-center flex-wrap">
                  <div
                    className="text-[14px] line-clamp-2"
                    dangerouslySetInnerHTML={{
                      __html: item.subtitle ? item.subtitle : intro,
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
            {/* {loading && (
              <i
                className={`bi bi-opencollective loading text-[var(--custom-color)] absolute bottom-0 right-[-15px]`}
              ></i>
            )} */}
          </div>
        </Link>
      </div>
    </>
  );
};

export default GeneralExam;
