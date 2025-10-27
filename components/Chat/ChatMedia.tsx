'use client'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { getExtension } from '@/lib/helpers'
import AudioMessage from './Audio'
import pluralize from 'pluralize'
import { AuthStore } from '@/src/zustand/user/AuthStore'
import { ChatContent } from '@/src/zustand/chat/Chat'

type ChatContentProps = {
  e: ChatContent
}

const ChatMedia = ({ e }: ChatContentProps) => {
  const { user } = AuthStore()
  const { username } = useParams()
  const isSender = e.senderUsername === user?.username

  return (
    <>
      {e.media.length > 0 && (
        <>
          {e.media[0].type === 'document' ? (
            <div className="flex items-start mb-2">
              <Image
                style={{ height: '40px', objectFit: 'contain' }}
                src={getExtension(String(e.media[0].url))}
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
                  {String(e.media[0].url)
                    .substring(String(e.media[0].url).lastIndexOf('.'))
                    .slice(1)}{' '}
                  . {(e.media[0].size / (1024 * 1024)).toFixed(2)} MB{' '}
                  {e.media[0].pages &&
                    e.media[0].pages > 0 &&
                    `. ${e.media[0].pages} ${pluralize(
                      'Page',
                      e.media[0].pages
                    )}`}
                </div>
              </div>
              <a
                href={e.media[0].url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className={`${
                  username === e.senderUsername
                    ? 'border-white text-white'
                    : 'border-[var(--text-primary)]'
                } cursor-pointer ml-auto min-w-8 w-8 h-8 border rounded-full flex items-center justify-center`}
              >
                <i className="bi bi-download"></i>
              </a>
            </div>
          ) : e.media[0].type === 'audio' ? (
            <AudioMessage
              src={String(e.media[0].url)}
              isSender={isSender}
              name={e.media[0].name}
            />
          ) : (
            <div className="grid grid-cols-2  z-40 rounded-[10px] overflow-hidden gap-2 mb-3">
              {e.media.map((item, index) => (
                <div
                  key={index}
                  className="relative group rounded-lg overflow-hidden"
                >
                  {item.type.includes('image') ? (
                    <img
                      src={item.previewUrl}
                      alt={item.previewUrl}
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    item.type.includes('video') && (
                      <video
                        src={item.previewUrl}
                        className="w-full h-32 object-cover"
                        muted
                        onLoadedMetadata={(e) =>
                          (item.duration = e.currentTarget.duration)
                        }
                      />
                    )
                  )}

                  <div className="absolute top-1 left-1 bg-black/60 text-white rounded-full h-6 w-6 flex items-center justify-center text-[10px]">
                    {item.type.includes('image') ? (
                      <i className="bi bi-image"></i>
                    ) : item.type.includes('video') ? (
                      <i className="bi bi-camera-video"></i>
                    ) : (
                      <i className="bi bi-file-earmark"></i> // 📄 File icon
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  )
}

export default ChatMedia
