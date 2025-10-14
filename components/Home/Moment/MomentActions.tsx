'use client'
import React from 'react'
import {
  MomentEmpty,
  MomentMediaEmpty,
  MomentStore,
} from '@/src/zustand/post/Moment'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { MessageStore } from '@/src/zustand/notification/Message'

export default function MomentActions() {
  const { user } = AuthStore()
  const { setMessage } = MessageStore()
  const {
    activeMoment,
    isPlaying,
    activeMomentMediaIndex,
    showOptions,
    setIsPlaying,
    setIsEditing,
    setShowOptions,
    setShowMoment,
    deleteMoment,
  } = MomentStore()

  const onClose = () => {
    MomentStore.setState({
      activeMoment: MomentEmpty,
      activeMomentMedia: MomentMediaEmpty,
      activeMomentIndex: 0,
      activeMomentMediaIndex: 0,
    })
    setShowOptions(false)
  }

  const editMoment = (id: string) => {
    setShowMoment(true)
    onClose()
    setIsEditing(true, id, activeMomentMediaIndex)
  }

  const toggleOptions = () => {
    setIsPlaying(!isPlaying)
    setShowOptions(!showOptions)
  }

  const handleDeleteMoment = () => {
    deleteMoment(
      `/posts/moments/${activeMoment._id}?mediaIndex=${activeMomentMediaIndex}&mediaLength=${activeMoment.media.length}`,
      setMessage
    )
  }

  return (
    <>
      {activeMoment.username === user?.username && (
        <button
          onClick={() => toggleOptions()}
          className="mr-3 actionIconWrapper relative"
        >
          <i className="bi bi-three-dots-vertical "></i>{' '}
          {showOptions && (
            <div className="post_card_list font-normal text-[var(--text-primary)]">
              <div
                onClick={() => editMoment(activeMoment._id)}
                className="post_card_item"
              >
                <i className="bi bi-pen mr-3 text-[18px]"></i>
                Edit
              </div>
              <div className="post_card_item">
                <i className="bi bi-chat-dots mr-3 text-[18px]"></i>
                Comments
              </div>
              <div onClick={handleDeleteMoment} className="post_card_item">
                <i className="bi bi-trash mr-3 text-[18px]"></i>
                Delete
              </div>
              <div onClick={toggleOptions} className="post_card_item">
                <i className="bi bi-x-circle mr-3 text-[18px]"></i>
                Close
              </div>
            </div>
          )}
        </button>
      )}
      <button onClick={onClose} className="actionIconWrapper">
        ✕
      </button>
    </>
  )
}
