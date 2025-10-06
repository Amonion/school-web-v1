"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import ChatStore from "@/src/zustand/users/Chat";
import { useParams } from "next/navigation";
import { formatTimeTo12Hour, getExtension } from "@/lib/helpers";
import { ChatContent, UserInfo } from "@/src/interface/user/interface";
import pluralize from "pluralize";
import { Socket } from "socket.io-client";
import AudioMessage from "../Audio";
import MediaDisplay from "../MediaDisplay";
import UserInfoStore from "@/src/zustand/users/UserInfo";
import UserChatRequest from "../UserChatRequest";
import UserDetailsStore from "@/src/zustand/users/UserDetails";
import UserRepliedChat from "./UserRepliedChat";

type ChatBodyProps = {
  socket: Socket | null;
};

const UserChatBody = ({ socket }: ChatBodyProps) => {
  const {
    chatResults,
    selectChats,
    selectedItems,
    repliedChat,
    loading,
    isFriends,
    senderUsername,
    pendingReadIds,
  } = ChatStore();
  const [user, setUser] = useState<UserInfo | null>(null);
  const { formData } = UserInfoStore();
  const { userData } = UserDetailsStore();
  const { _id } = useParams();
  const { username } = useParams();
  const [connection, setConnection] = useState("");
  const optionsRef = useRef<HTMLDivElement | null>(null);
  const firstCardRef = useRef<HTMLDivElement | null>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const observedChats = useRef<Map<string, ChatContent>>(new Map());
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const allMessages: ChatContent[] = chatResults.flatMap((chat) => chat.chats);

  const [dropDirection, setDropDirection] = useState<"top" | "bottom">(
    "bottom"
  );

  const setConnectionKey = (id1: string, id2: string) => {
    const participants = [id1, id2].sort();
    return participants.join("");
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
      for (const group of prev.chatResults) {
        const chat = group.chats.find((c) => c._id === id);
        if (chat) {
          willBeActive = !chat.isActive;
          break;
        }
      }
      const updatedResults = prev.chatResults.map((group) => ({
        ...group,
        chats: group.chats.map((chat) => ({
          ...chat,
          isActive: chat._id === id ? willBeActive : false,
        })),
      }));
      return { chatResults: updatedResults };
    });
  };

  const startSetRepliedChat = (e: ChatContent | null) => {
    ChatStore.setState(() => {
      return {
        repliedChat: e,
      };
    });
    if (e) {
      setIsActive(e._id);
    }
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
    if (selectedItems.length > 0) {
      selectChats(id);
    }
  };

  const startSelectItem = (id: string) => {
    selectChats(id);
    setIsActive(id);
  };

  //--------------------MARK READ CHATS----------------------//
  useEffect(() => {
    if (user) {
      setConnection(setConnectionKey(user.username, String(username)));
    }

    const observer = new IntersectionObserver(
      (entries) => {
        let hasNew = false;

        entries.forEach((entry) => {
          const messageId = (entry.target as HTMLElement).dataset.id;
          if (
            messageId &&
            entry.isIntersecting &&
            !observedChats.current.has(messageId)
          ) {
            const chat = allMessages.find((c) => c._id === messageId);
            if (chat && chat.receiverUsername === user?.username) {
              observedChats.current.set(messageId, chat);
              hasNew = true;

              if (pendingReadIds.current.has(messageId)) {
                const form = {
                  to: "read",
                  ids: [messageId],
                  receiverId: user?._id,
                  receiverUsername: user?.username,
                  username: chat.username,
                  isRead: true,
                };
                socket?.emit("message", form);
                pendingReadIds.current.delete(messageId);
              }
            }
          }
        });

        if (hasNew && user && socket) {
          if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
          }

          debounceTimeout.current = setTimeout(() => {
            const chatsToSend = Array.from(observedChats.current.values());
            if (chatsToSend.length > 0) {
              const unreadChatIds = chatsToSend
                .filter(
                  (e) =>
                    !e.isRead &&
                    e.receiverUsername === user.username &&
                    e.isFriends
                )
                .map((e) => e._id);
              if (unreadChatIds.length > 0) {
                const form = {
                  to: "read",
                  ids: unreadChatIds,
                  connection: connection,
                  username: username,
                  receiverUsername: user?.username,
                  isRead: true,
                };
                socket.emit("message", form);
                observedChats.current.clear();
              }
            }
          }, 3000);
        }
      },
      {
        threshold: 0.5,
      }
    );

    Object.values(messageRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [chatResults, user, socket]);

  useEffect(() => {
    if (userData.username) {
      setUser(userData);
    }
  }, [userData]);

  return (
    <>
      <div className="flex flex-col mb-auto ">
        {chatResults.length === 0 && !loading && <UserChatRequest />}

        {chatResults.map((item, index) => (
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
                  ref={(el) => {
                    if (el) {
                      messageRefs.current[e._id] = el;
                      if (isFirst) {
                        firstCardRef.current = el;
                      }
                    }
                  }}
                  data-id={e._id}
                >
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className={`${
                      e.username === user?.username ? "sender" : "receiver"
                    } ${
                      e.media[0] && e.media[0].type === "audio" ? "audio" : ""
                    } ${
                      e.media[0] &&
                      (e.media[0].type === "picture" ||
                        e.media[0].type === "video")
                        ? "media"
                        : ""
                    }  chat_wrapper cursor-default`}
                  >
                    {e.repliedChat && e.repliedChat !== null && (
                      <div
                        onClick={() =>
                          selectChats(String(e.repliedChat?.username))
                        }
                        className={`${
                          e.username === user?.username
                            ? "bg-[var(--secondary)]"
                            : "bg-[var(--custom-dark)]"
                        } flex  rounded-[10px] py-[1px] px-[5px] cursor-pointer w-full mb-2`}
                      >
                        <UserRepliedChat
                          repliedChat={e.repliedChat}
                          chat={e}
                          user={user}
                          username={String(username)}
                          inner={true}
                        />
                      </div>
                    )}
                    {e.media.length > 0 && (
                      <>
                        {e.media[0].type === "document" ? (
                          <div className="flex items-start mb-2">
                            <Image
                              style={{ height: "40px", objectFit: "contain" }}
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
                                  .substring(e.media[0].source.lastIndexOf("."))
                                  .slice(1)}{" "}
                                . {(e.media[0].size / (1024 * 1024)).toFixed(2)}{" "}
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
                            isSender={e.username === user?.username}
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
                        {e.username === user?.username ? (
                          <>
                            {formatTimeTo12Hour(e.senderTime)}{" "}
                            {e.isSent ? (
                              <i
                                className={`bi text-[15px] bi-check2-all ml-1 ${
                                  e.isRead ? "text-[var(--custom)] " : ""
                                }`}
                              ></i>
                            ) : (
                              <i className="bi bi-check2 ml-1 text-[15px]"></i>
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
                              e.receiverUsername === user?.username
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
                                  navigator.clipboard.writeText(cleanedText);
                                  setIsActive(e._id);
                                }}
                                className="chat_list_item"
                              >
                                <i className="bi bi-clipboard mr-2"></i>
                                Copy
                              </div>
                            )}
                            <div
                              onClick={() => startSetRepliedChat(e)}
                              className="chat_list_item"
                            >
                              <i className="bi bi-reply mr-2"></i>
                              Reply
                            </div>
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
                          onClick={(event) => handleOptionsClick(event, e._id)}
                          className="bi bi-three-dots-vertical text-sm cursor-pointer"
                        ></i>
                      </div>
                    </div>
                    {e.isSavedUsernames.includes(String(user?.username)) && (
                      <>
                        {e.username === user?.username ? (
                          <div className="round absolute left-0 bottom-[-15px]">
                            <i className="bi bi-heart-fill text-[10px] mt-[2px] leading-none cursor-pointer text-red-600"></i>
                          </div>
                        ) : (
                          <div className="round absolute left-[10px] bottom-[-15px]  ">
                            <i className="bi bi-heart-fill text-[10px] mt-[1px] leading-none cursor-pointer text-red-600"></i>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {!isFriends &&
          user?.username !== senderUsername &&
          chatResults.length !== 0 && (
            <div className="w-full flex flex-col items-center px-[10px] mt-10">
              <div className="text-center max-w-[400px] text-lg leading-[25px]">
                <span className="text-[var(--custom)]">
                  {formData.username}
                </span>{" "}
                will not see you as friend until you send a reply.
              </div>
            </div>
          )}

        {repliedChat && (
          <>
            {repliedChat && (
              <UserRepliedChat
                repliedChat={repliedChat}
                user={user}
                username={String(username)}
                inner={false}
                onClose={() => startSetRepliedChat(null)}
              />
            )}
          </>
        )}
      </div>
    </>
  );
};

export default UserChatBody;
