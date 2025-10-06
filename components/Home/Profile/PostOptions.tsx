// import MediaDisplay from "@/components/Users/Media/MediaDisplay";
// import { useAuthStore } from "@/src/zustand/authStore";
import React from "react";
import { Post } from "@/src/interface/user/interface";
import { useAuthStore } from "@/src/zustand/authStore";
import { MessageStore } from "@/src/zustand/msgStore";
import PostStore from "@/src/zustand/users/UserPost";

interface PostProps {
  post: Post;
}
const PostOptions: React.FC<PostProps> = ({ post }) => {
  const { user } = useAuthStore();
  const { toggleActive, deleteItem } = PostStore();
  const { setMessage } = MessageStore();
  const deletePost = (id: string) => {
    deleteItem(`/posts/${id}`, id, setMessage);
  };

  return (
    <div className="relative ml-auto ">
      <div className="cursor-pointer flex justify-center items-center w-8 h-8 rounded-full bg-[var(--white-gray)]">
        <i
          onClick={() => toggleActive(post._id)}
          className="bi bi-three-dots-vertical"
        ></i>
      </div>
      {post.isActive && (
        <div className="post_card_list ">
          <span onClick={() => toggleActive(post._id)} className="more_close ">
            X
          </span>
          {user?._id !== post.userId && (
            <div className="post_card_item">
              <i className="bi bi-repeat mr-3 text-[18px]"></i>
              Repost
            </div>
          )}
          {user?._id !== post.userId && (
            <div className="post_card_item">
              <i className="bi bi-paperclip mr-3 text-[18px]"></i>
              Follow Account
            </div>
          )}
          {user?._id !== post.userId && (
            <div className="post_card_item">
              <i className="bi bi-volume-mute mr-3 text-[18px]"></i>
              Mute Account
            </div>
          )}
          {user?._id === post.userId && (
            <div
              //   onClick={() => deletePost(post._id)}
              className="post_card_item"
            >
              <i className="bi bi-pin mr-3 text-[18px]"></i>
              Pin Post
            </div>
          )}
          {user?._id === post.userId && (
            <div
              onClick={() => deletePost(post._id)}
              className="post_card_item"
            >
              <i className="bi bi-trash mr-3 text-[18px]"></i>
              Delete Post
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostOptions;
