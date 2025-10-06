"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation"; // ✅ Get dynamic route params

import PostCard from "@/components/Users/OfficialPosts/PostCard";
import { useAuthStore } from "@/src/zustand/authStore";
import PostStore from "@/src/zustand/users/Post";
import { MessageStore } from "@/src/zustand/msgStore";

const UserPosts = () => {
  const { _id } = useParams();
  // const [loading, setLoading] = useState(false);
  const [page_size] = useState(10);
  const { setMessage } = MessageStore();
  const [currentPage, setCurrentPage] = useState(1);
  const lastPostRef = useRef<HTMLDivElement | null>(null);
  const { user } = useAuthStore();
  const { loading, postResults, getPosts, reshuffleResults } = PostStore();

  const findPosts = async () => {
    getPosts(
      `/posts/?userId=${_id}&myId=${user?._id}&ordering=createdA&postType=main&page_size=${page_size}&page=${currentPage}`,
      setMessage
    );
  };

  useEffect(() => {
    if (_id && user) {
      findPosts();
    }
  }, [_id, user]);

  useEffect(() => {
    findPosts();
    return () => {
      reshuffleResults();
    };
  }, [currentPage]);

  useEffect(() => {
    if (!lastPostRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setCurrentPage(currentPage + 1);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(lastPostRef.current);
    return () => observer.disconnect();
  }, [postResults.length]);

  return (
    <>
      {postResults.map((post, index) => (
        <PostCard
          key={index}
          post={post}
          lastRef={index === postResults.length - 1 ? lastPostRef : undefined}
        />
      ))}
      {loading && (
        <div className="flex relative items-center h-5 justify-center flex-wrap w-full">
          <i
            className={`bi mt-[-60px]  bi-opencollective loading  text-md text-[var(--custom-color)]`}
          ></i>
        </div>
      )}
    </>
  );
};

export default UserPosts;
