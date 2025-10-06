"use client";
import Image from "next/image";
import useSocket from "@/src/hooks/useSocket";
import { useAuthStore } from "@/src/zustand/authStore";
import { useEffect, useRef, useState } from "react";
import { MessageStore } from "@/src/zustand/msgStore";
import { getExtension, formatTimeTo12Hour } from "@/lib/helpers";
import { useParams } from "next/navigation";
import ChatStore from "@/src/zustand/users/Chat";
import { User } from "@/src/interface/team/interface";
import pluralize from "pluralize";
import AudioMessage from "@/components/Users/Chat/Audio";
import MediaDisplay from "@/components/Users/Media/MediaDisplay";
import UserStore from "@/src/zustand/users/User";

const UserChat = () => {
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const {
    favChatResults,
    getFavChats,
    current,
    favChatContentResults,
    moveUp,
    selectFavChats,
    selectedFavItems,
  } = ChatStore();
  const { user } = useAuthStore();
  const { formData } = UserStore();

  const { _id, username } = useParams();
  const socket = useSocket();
  const [connection, setConnection] = useState("");
  const { setMessage } = MessageStore();
  const [isNearBottom, setIsNearBottom] = useState(false);
  const optionsRef = useRef<HTMLDivElement | null>(null);
  const firstCardRef = useRef<HTMLDivElement | null>(null);
  const [dropDirection, setDropDirection] = useState<"top" | "bottom">(
    "bottom"
  );

  useEffect(() => {
    if (!moveUp) return;

    const container = chatContainerRef.current;
    if (container) {
      setTimeout(() => {
        container.scrollTop = 0;
        console.log(favChatContentResults[favChatContentResults.length - 1]);
      }, 1000);
    }
  }, [moveUp]);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;

      setIsNearBottom(distanceFromBottom < 150);
    };

    container.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (user) {
      const key = setConnectionKey(String(_id), String(user._id));
      setConnection(key);
    }
  }, [user]);

  //////////////SCROLL DOWN ON NEW CHAT//////////////////
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const isUserNearBottom = () => {
      return (
        container.scrollHeight - container.scrollTop - container.clientHeight <
        200
      );
    };

    const scrollToBottom = () => {
      container.scrollTop = container.scrollHeight;
    };

    const shouldScroll = isUserNearBottom();

    if (shouldScroll) {
      scrollToBottom();
    }

    const mediaElements = container.querySelectorAll("img, video");
    let pending = 0;

    const handleLoad = () => {
      pending--;
      if (pending <= 0 && shouldScroll) {
        scrollToBottom();
      }
    };

    mediaElements.forEach((el) => {
      const media = el as HTMLImageElement | HTMLVideoElement;

      if (media.tagName === "IMG") {
        const img = media as HTMLImageElement;
        if (!img.complete) {
          pending++;
          img.addEventListener("load", handleLoad);
          img.addEventListener("error", handleLoad);
        }
      } else if (media.tagName === "VIDEO") {
        const video = media as HTMLVideoElement;
        if (video.readyState < 3) {
          pending++;
          video.addEventListener("loadeddata", handleLoad);
          video.addEventListener("error", handleLoad);
        }
      }
    });

    if (pending === 0 && shouldScroll) {
      scrollToBottom();
    }

    return () => {
      mediaElements.forEach((el) => {
        const media = el as HTMLImageElement | HTMLVideoElement;
        media.removeEventListener("load", handleLoad);
        media.removeEventListener("error", handleLoad);
        media.removeEventListener("loadeddata", handleLoad);
      });
    };
  }, [favChatContentResults.length]);
  //***********SCROLL DOWN ON NEW CHAT****************//

  //////////////ALLOW FIRST SCROLL DOWN ON CHAT LOAD//////////////////
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container || favChatResults.length === 0 || current !== 2) return;

    container.scrollTop = container.scrollHeight;

    const mediaElements = container.querySelectorAll("img, video");
    let pending = 0;

    const scrollToBottom = () => {
      container.scrollTop = container.scrollHeight;
    };

    const handleMediaLoad = () => {
      pending--;
      if (pending === 0) {
        scrollToBottom();
      }
    };

    mediaElements.forEach((media) => {
      if (media.tagName === "IMG") {
        const img = media as HTMLImageElement;
        if (!img.complete) {
          pending++;
          img.addEventListener("load", handleMediaLoad);
          img.addEventListener("error", handleMediaLoad);
        }
      } else if (media.tagName === "VIDEO") {
        const video = media as HTMLVideoElement;
        if (video.readyState < 3) {
          pending++;
          video.addEventListener("loadeddata", handleMediaLoad);
          video.addEventListener("error", handleMediaLoad);
        }
      }
    });

    if (pending === 0) {
      scrollToBottom();
    }

    return () => {
      mediaElements.forEach((media) => {
        media.removeEventListener("load", handleMediaLoad);
        media.removeEventListener("error", handleMediaLoad);
        media.removeEventListener("loadeddata", handleMediaLoad);
      });
    };
  }, [favChatResults.length, current]);
  //***********ALLOW FIRST SCROLL DOWN ON CHAT LOAD****************//

  //////////////FETCH OLDER CHATS WHEN USER SCROLL UP//////////////////
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop === 0 && user) {
        handleFetchOlderChats(user);
      }
    };

    container.addEventListener("scroll", handleScroll);

    if (username && user) {
      const key = setConnectionKey(String(username), String(user?.username));
      setConnection(key);

      getFavChats(
        `/user-messages/save/?connection=${key}&page_size=10&page=1&ordering=-createdAt&deletedUsername[ne]=${user.username}&isSavedUsernames[in]=${user.username}`,
        setMessage
      );
    }

    return () => container.removeEventListener("scroll", handleScroll);
  }, [username, user]);
  //***********FETCH OLDER CHATS WHEN USER SCROLL UP****************//

  const handleFetchOlderChats = async (user: User) => {
    const container = chatContainerRef.current;
    if (!container) return;

    const prevScrollHeight = container.scrollHeight;
    const key = setConnectionKey(String(username), String(user.username));

    await ChatStore.getState().addFavChats(
      `/user-messages/user-chats/?connection=${key}&page_size=10&ordering=-createdAt&username=${user.username}&deletedUsername[ne]=${user.username}`,
      setMessage
    );
    requestAnimationFrame(() => {
      const newScrollHeight = container.scrollHeight;
      const scrollDiff = newScrollHeight - prevScrollHeight;

      container.scrollTop = scrollDiff;
    });
  };

  const setConnectionKey = (id1: string, id2: string) => {
    const participants = [id1, id2].sort();
    return participants.join("");
  };

  const scrollDown = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const handleOptionsClick = (e: React.MouseEvent, id: string) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const shouldDropUp = rect.top > window.innerHeight / 2;

    setIsActive(id);
    setDropDirection(shouldDropUp ? "top" : "bottom");
  };

  const setIsActive = (id: string) => {
    ChatStore.setState((prev) => {
      let willBeActive = false;
      for (const group of prev.favChatResults) {
        const chat = group.chats.find((c) => c._id === id);
        if (chat) {
          willBeActive = !chat.isActive;
          break;
        }
      }
      const updatedResults = prev.favChatResults.map((group) => ({
        ...group,
        chats: group.chats.map((chat) => ({
          ...chat,
          isActive: chat._id === id ? willBeActive : false,
        })),
      }));
      return { favChatResults: updatedResults };
    });
  };

  const deleteChat = (id: string, chatUsername: string, day: string) => {
    if (socket && user) {
      const form = {
        to: "deleteChat",
        id: id,
        connection: connection,
        day: day,
        isSender: user.username === chatUsername,
        username: user.username,
        receiverUsername: username,
      };

      socket.emit("message", form);
    }
    setIsActive(id);
  };

  const selectItem = (id: string) => {
    if (selectedFavItems.length > 0) {
      selectFavChats(id);
    }
  };

  const startSelectItem = (id: string) => {
    selectFavChats(id);
    setIsActive(id);
  };

  return (
    <>
      <div
        ref={chatContainerRef}
        className="flex-1 sm:px-[5px] overflow-auto chat_scrollbar"
      >
        <div className="flex flex-col mb-auto ">
          {favChatResults.map((item, index) => (
            <div key={index} className="flex flex-col w-full">
              <div className="mx-auto mb-2 rounded-[25px] py-1 px-3 bg-[var(--primary)]">
                {item.day}
              </div>
              {item.chats.map((e, i) => {
                const isFirst = index === 0 && i === 0;

                return (
                  <div
                    onClick={() => selectItem(e._id)}
                    className={`${e.isChecked ? "selected" : ""} ${
                      e.isAlert ? "cursor-pointer" : "cursor-default"
                    } full_chat_wrapper`}
                    key={i}
                    ref={isFirst ? firstCardRef : null}
                  >
                    {e.deletedUsername !== user?.username && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className={`${
                          e.userId === user?._id ? "sender" : "receiver"
                        } ${
                          e.media[0] && e.media[0].type === "audio"
                            ? "audio"
                            : ""
                        } ${
                          e.media[0] &&
                          (e.media[0].type === "picture" ||
                            e.media[0].type === "video")
                            ? "media"
                            : ""
                        }  chat_wrapper cursor-default`}
                      >
                        {e.media.length > 0 && (
                          <>
                            {e.media[0].type === "document" ? (
                              <div className="flex items-start mb-2">
                                <Image
                                  style={{
                                    height: "40px",
                                    objectFit: "contain",
                                  }}
                                  src={getExtension(e.media[0].source)}
                                  loading="lazy"
                                  sizes="100vw"
                                  className="w-auto h-auto object-contain mr-3"
                                  width={0}
                                  height={0}
                                  alt={`"/files/file.png"`}
                                />
                                <div className="flex-col flex flex-1 mr-2">
                                  <div className="flex items-start mb-1 justify-between">
                                    {e.media[0].name && (
                                      <div className="text-[var(--text-secondary)] mr-2 line-clamp-1 overflow-hidden text-ellipsis">
                                        {e.media[0].name}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex mb-auto text-[12px] uppercase">
                                    {e.media[0].source
                                      .substring(
                                        e.media[0].source.lastIndexOf(".")
                                      )
                                      .slice(1)}{" "}
                                    .{" "}
                                    {(e.media[0].size / (1024 * 1024)).toFixed(
                                      2
                                    )}{" "}
                                    MB{" "}
                                    {e.media[0].pages > 0 &&
                                      `. ${e.media[0].pages} ${pluralize(
                                        "Page",
                                        e.media[0].pages
                                      )}`}
                                  </div>
                                </div>
                                <a
                                  href={e.media[0].source}
                                  download
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`${
                                    _id === e.userId
                                      ? "border-white text-white"
                                      : "border-[var(--text-primary)]"
                                  } cursor-pointer ml-auto min-w-8 w-8 h-8 border rounded-full flex items-center justify-center`}
                                >
                                  <i className="bi bi-download"></i>
                                </a>
                              </div>
                            ) : e.media[0].type === "audio" ? (
                              <AudioMessage
                                src={e.media[0].source}
                                isSender={e.userId === user?._id}
                                name={e.media[0].name}
                              />
                            ) : (
                              <MediaDisplay sources={e.media} />
                            )}
                          </>
                        )}

                        <div className="mb-1">
                          <div
                            dangerouslySetInnerHTML={{ __html: e.content }}
                          ></div>
                        </div>
                        <div className="flex leading-[15px] justify-between w-full items-center text-[11px]">
                          <div className="flex items-end">
                            {e.userId === user?._id ? (
                              <>
                                {formatTimeTo12Hour(e.senderTime)}{" "}
                                {e.isSent ? (
                                  <i className="bi bi-check2-all ml-1"></i>
                                ) : (
                                  <i className="bi bi-check2 ml-1"></i>
                                )}
                              </>
                            ) : (
                              formatTimeTo12Hour(e.receiverTime)
                            )}
                          </div>
                          <div className="relative" ref={optionsRef}>
                            {e.isActive && (
                              <div
                                className={`flex flex-col text-[16px] text-[var(--text-primary)] z-30 absolute ${
                                  dropDirection === "top" ? "bottom-0" : "top-0"
                                } ${
                                  e.receiverId === user?._id
                                    ? "left-[-80px]"
                                    : "right-0"
                                } rounded-[5px] border border-[var(--border)] bg-[var(--primary)]`}
                              >
                                {e.content.trim().length > 0 && (
                                  <div
                                    onClick={() => {
                                      const cleanedText = e.content.replace(
                                        /<[^>]*>/g,
                                        ""
                                      );
                                      navigator.clipboard.writeText(
                                        cleanedText
                                      );
                                      setIsActive(e._id);
                                    }}
                                    className="chat_list_item"
                                  >
                                    <i className="bi bi-clipboard mr-2"></i>
                                    Copy
                                  </div>
                                )}
                                <div
                                  onClick={() => startSelectItem(e._id)}
                                  className="chat_list_item"
                                >
                                  <i className="bi bi-check2-square mr-2"></i>
                                  Select
                                </div>
                                <div
                                  onClick={() =>
                                    deleteChat(e._id, e.username, e.day)
                                  }
                                  className="chat_list_item"
                                >
                                  <i className="bi bi-trash mr-2"></i>
                                  Delete
                                </div>
                                <div
                                  onClick={() => setIsActive(e._id)}
                                  className="chat_list_item"
                                >
                                  <i className="bi bi-x-circle mr-2"></i>
                                  Close
                                </div>
                              </div>
                            )}

                            <i
                              onClick={(event) =>
                                handleOptionsClick(event, e._id)
                              }
                              className="bi bi-three-dots-vertical text-sm cursor-pointer"
                            ></i>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {!isNearBottom && (
          <div
            onClick={scrollDown}
            className="cursor-pointer w-8 h-8 border border-[var(--border)] rounded-full flex items-center justify-center bg-[var(--primary)] absolute right-[10px] top-[-40px]"
          >
            <i className="bi bi-arrow-down"></i>
          </div>
        )}
      </div>

      <div className="w-full justify-center relative sm:rounded-[10px] flex items-end bg-[var(--primary)] py-3 text-center">
        <div className="mr-2">Your Saved Chats With </div>
        <div className="text-[var(--custom)]">{formData.username}</div>
      </div>
    </>
  );
};

export default UserChat;
