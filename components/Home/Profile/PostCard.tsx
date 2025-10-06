import MediaDisplay from "@/components/Users/Media/MediaDisplay";
// import { MessageStore, ParamStore } from "@/src/zustand/msgStore";
import { useRouter } from "next/navigation";
import PostStat from "@/components/Users/OfficialPosts/PostStat";
// import { useAuthStore } from "@/src/zustand/authStore";
import PostHeader from "./PostHeader";
import Polls from "./Polls";
import { useEffect, useRef } from "react";
import { Post } from "@/src/interface/user/interface";
import PostStore from "@/src/zustand/users/Post";
import { useAuthStore } from "@/src/zustand/authStore";
import { MessageStore } from "@/src/zustand/msgStore";

interface PostCardProps {
  post: Post;
  lastRef?: React.RefObject<HTMLDivElement>;
}

const ViewedPosts = new Set();

const PostCard: React.FC<
  PostCardProps & { lastRef?: React.RefObject<HTMLDivElement> }
> = ({ post, lastRef }) => {
  const { user } = useAuthStore();
  const { updatePost } = PostStore();
  const { setMessage } = MessageStore();
  const router = useRouter();

  const moveToPost = (id: string) => {
    router.push(`/post/${id}`);
  };

  const postRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const postId = post._id;

            if (!ViewedPosts.has(postId)) {
              ViewedPosts.add(postId);
              increaseViewCount(postId);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    if (postRef.current) {
      observer.observe(postRef.current);
    }

    return () => observer.disconnect();
  }, [post]);

  const increaseViewCount = async (postId: string) => {
    try {
      if (user && !post.viewed) {
        updatePost(
          `/posts/stats`,
          { views: true, id: postId, userId: user._id },
          setMessage
        );
      }
    } catch (error) {
      console.error("Failed to update view count", error);
    }
  };
  return (
    <>
      <div
        ref={postRef && lastRef}
        onClick={() => moveToPost(post._id)}
        className="post_card cursor-pointer"
      >
        <PostHeader post={post} />

        <div
          onClick={() => moveToPost(post._id)}
          className="p-1 rounded-[5px] cursor-pointer mb-2 text-[18px] text-[var(--text-title-color)]"
        >
          <div dangerouslySetInnerHTML={{ __html: post.content }}></div>
        </div>

        <MediaDisplay sources={post.media} />

        <Polls post={post} />

        <PostStat post={post} />
      </div>
    </>
  );
};

export default PostCard;
