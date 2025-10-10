import React from 'react'
import { Post, PostStore } from '@/src/zustand/post/Post'
import { MessageStore } from '@/src/zustand/notification/Message'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import SocialStore from '@/src/zustand/post/Social'

interface PostProps {
  post: Post
}
const PostOptions: React.FC<PostProps> = ({ post }) => {
  const { user } = AuthStore()
  const { toggleActive, deleteItem, updatePost, repostItem, updatePinPost } =
    PostStore()
  const { setMessage } = MessageStore()
  const { blockUser, muteUser } = SocialStore()

  const deletePost = (id: string) => {
    deleteItem(`/posts/${id}`, id, setMessage)
  }

  const followAccount = () => {
    updatePost(
      `/posts/follow/${post.userId}`,
      { post: post, followerId: user?._id },
      setMessage
    )
  }

  const repost = (id: string) => {
    repostItem(`/posts/repost/${id}`, {
      post: post,
      userId: user?._id,
      username: user?.username,
      displayName: user?.displayName,
      isVerified: user?.isVerified,
      views: 1,
      picture: user?.picture,
      createdAt: new Date(),
    })
    toggleActive(id)
    // setVisible(false)
  }

  const pinPost = () => {
    updatePinPost(`/posts/pin/${post._id}`, {
      userId: user?._id,
      pinnedAt: new Date(),
    })
    toggleActive(post._id)
    // setActivePost(isActive ? null : post._id);
    // setVisible(false)
  }

  const blockAccount = () => {
    blockUser(`/posts/block/${post._id}`, {
      userId: user?._id,
      username: user?.username,
      displayName: user?.displayName,
      picture: user?.picture,
      bioUserId: user?.bioUserId,
      isVerified: user?.isVerified,
      accountUsername: post.username,
      accountUserId: post.userId,
      accountDisplayName: post.displayName,
      accountPicture: post.picture,
      accountIsVerified: post.isVerified,
    })
    toggleActive(post._id)

    // setVisible(false)
  }

  const muteAccount = () => {
    // setVisible(false)
    muteUser(`/posts/mute/${post._id}`, {
      userId: user?._id,
      username: user?.username,
      displayName: user?.displayName,
      picture: user?.picture,
      bioUserId: user?.bioUserId,
      isVerified: user?.isVerified,
      accountUsername: post.username,
      accountUserId: post.userId,
      accountDisplayName: post.displayName,
      accountPicture: post.picture,
      accountIsVerified: post.isVerified,
    })
    toggleActive(post._id)
  }

  return (
    <div className="relative ml-auto ">
      <div className="cursor-pointer flex justify-center items-center">
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
          <div onClick={pinPost} className="post_card_item">
            <i className="bi bi-pin mr-3 text-[18px]"></i>
            Pin Post
          </div>
          {user?._id !== post.userId && (
            <>
              <div onClick={() => repost(post._id)} className="post_card_item">
                <i className="bi bi-repeat mr-3 text-[18px]"></i>
                Repost
              </div>
              <div onClick={followAccount} className="post_card_item">
                <i className="bi bi-paperclip mr-3 text-[18px]"></i>
                <div className="line-clamp-1">
                  {post.followed ? `Unfollow Account` : `Follow Account`}
                </div>
              </div>
              <div onClick={muteAccount} className="post_card_item">
                <i className="bi bi-volume-mute mr-3 text-[18px]"></i>
                Mute Account
              </div>
              <div onClick={blockAccount} className="post_card_item">
                <i className="bi bi-ban mr-3 text-[18px]"></i>
                Block Account
              </div>
            </>
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
  )
}

export default PostOptions
