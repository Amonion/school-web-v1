// components/RepliedChat.tsx
import Image from "next/image";
import ReplyMedia from "./ReplyMedia";
import { User } from "@/src/interface/team/interface"; // adjust path
import {
  RepliedChatContent,
  ChatContent,
} from "@/src/interface/user/interface";
import pluralize from "pluralize";
import AudioMessage from "./Audio";
import { getExtension } from "@/lib/helpers";

interface RepliedChatProps {
  repliedChat: RepliedChatContent;
  chat?: ChatContent;
  user: User | null;
  username: string;
  inner: boolean;
  onClose?: () => void;
}

const RepliedChat: React.FC<RepliedChatProps> = ({
  repliedChat,
  chat,
  user,
  username,
  inner,
  onClose,
}) => {
  const media = repliedChat.media[0];

  return (
    <div
      className={`full_chat_wrapper flex w-full text-[14px] ${
        inner ? "inner" : "absolute left-0 bottom-[50px] z-40 px-1"
      } `}
    >
      <div
        className={`reply ${inner ? "inner" : ""} ${
          media?.type === "audio" ? "audio" : ""
        } ${
          media && (media.type === "picture" || media.type === "video")
            ? "media"
            : ""
        } chat_wrapper`}
      >
        {onClose && (
          <i
            onClick={onClose}
            className="bi z-20 bi-x-circle-fill cursor-pointer absolute top-[-10px] right-0 text-[var(--custom)] text-xl"
          ></i>
        )}

        {media && (
          <div className="flex relative  px-[0px] justify-between">
            <div className="absolute w-full h-full top-0 left-0 z-10"></div>
            {media.type !== "audio" && media.type !== "document" && (
              <div className="line-clamp-1 overflow-ellipsis mr-2">
                {media.name} {media.type}
              </div>
            )}
            <div className="flex-1 flex">
              {media.type === "document" ? (
                <div className="flex items-start mb-2 w-full">
                  <Image
                    style={{ height: "40px", objectFit: "contain" }}
                    src={getExtension(media.source)}
                    loading="lazy"
                    sizes="100vw"
                    className="w-auto h-auto object-contain mr-3"
                    width={0}
                    height={0}
                    alt="Document"
                  />
                  <div className="flex-col flex flex-1 mr-2">
                    <div className="flex items-start mb-1 justify-between">
                      {media.name && (
                        <div
                          className={`${
                            chat?.userId !== user?._id
                              ? "text-white"
                              : "text-[var(--text-secondary)]"
                          }  mr-2 line-clamp-1 overflow-hidden text-ellipsis`}
                        >
                          {media.name}
                        </div>
                      )}
                    </div>
                    <div className="flex mb-auto text-[12px] uppercase">
                      {media.source
                        .substring(media.source.lastIndexOf("."))
                        .slice(1)}{" "}
                      · {`${(media.size / (1024 * 1024)).toFixed(2)} MB`}
                      {media.pages > 0 &&
                        `. ${media.pages} ${pluralize("Page", media.pages)}`}
                    </div>
                  </div>
                  <a
                    href={media.source}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${
                      username === repliedChat.username
                        ? "border-white text-white"
                        : "border-[var(--text-primary)]"
                    } cursor-pointer ml-auto min-w-8 w-8 h-8 border rounded-full flex items-center justify-center`}
                  >
                    <i className="bi bi-download"></i>
                  </a>
                </div>
              ) : media.type === "audio" ? (
                <AudioMessage
                  src={media.source}
                  isSender={repliedChat.userId === user?._id}
                  name={media.name}
                />
              ) : (
                <ReplyMedia sources={repliedChat.media} />
              )}
            </div>
          </div>
        )}

        <div className="mb-1">
          <div dangerouslySetInnerHTML={{ __html: repliedChat.content }}></div>
        </div>
      </div>
    </div>
  );
};

export default RepliedChat;
