"use client";
import { MessageStore, NavStore } from "@/src/zustand/msgStore";
import { useEffect, useRef, useState } from "react";
import EmptySearch from "@/components/Users/Trace/EmptySearch";
import GeneralCard from "@/components/Users/Trace/General/GenerableCard";
import { useAuthStore } from "@/src/zustand/authStore";
import GeneralStore from "@/src/zustand/users/General";

export default function GeneralList() {
  const { searchedText, tab } = NavStore();
  const { addGeneralItems, loading, getGeneralItems, generalResults } =
    GeneralStore();
  const [page_size] = useState(4);
  const { setMessage } = MessageStore();
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const lastCardRef = useRef<HTMLDivElement | null>(null);
  const url = "/posts/general";

  useEffect(() => {
    const findResults = async () => {
      const myIds = [user?._id, user?.userId];
      getGeneralItems(
        `${url}/?myIds=${encodeURIComponent(myIds.join(","))}&myId=${
          user?._id
        }&username=${searchedText}&displayName=${searchedText}&content=${searchedText}&firstName=${searchedText}&name=${searchedText}&page_size=${page_size}&page=1`,
        setMessage
      );
    };
    findResults();
  }, [searchedText, tab, page_size, url]);

  useEffect(() => {
    const findItems = async () => {
      const myIds = [user?._id, user?.userId];
      addGeneralItems(
        `${url}/?myIds=${encodeURIComponent(myIds.join(","))}&myId=${
          user?._id
        }&username=${searchedText}&displayName=${searchedText}&content=${searchedText}&firstName=${searchedText}&name=${searchedText}&page_size=${page_size}&page=${page}`,
        setMessage
      );
    };

    // if (searchedText !== "") {
    //   findItems();
    // }
    if (page > 1) {
      findItems();
    }
  }, [page, user, page_size, url]);

  useEffect(() => {
    if (!lastCardRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage(page + 1);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(lastCardRef.current);
    return () => observer.disconnect();
  }, [generalResults.length]);

  return (
    <>
      {generalResults ? (
        <div className="w-full relative pt-1">
          {generalResults.length > 0 ? (
            <>
              {generalResults.map((result, index) => (
                <GeneralCard
                  key={index}
                  item={result}
                  lastRef={
                    index === generalResults.length - 1
                      ? lastCardRef
                      : undefined
                  }
                />
              ))}
              {loading && (
                <div className="flex relative items-center h-5 justify-center flex-wrap w-full">
                  <i
                    className={`bi mt-[-10px] bi-opencollective loading text-md text-[var(--custom-color)]`}
                  ></i>
                </div>
              )}
            </>
          ) : (
            <>
              <EmptySearch />
            </>
          )}
        </div>
      ) : (
        <EmptySearch />
      )}
    </>
  );
}
