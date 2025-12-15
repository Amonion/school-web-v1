import { ChatContent } from '@/src/zustand/chat/Chat'
import { openDB } from 'idb'

const DB_NAME = 'chatDB'
const DB_VERSION = 9
const MESSAGES_STORE = 'messages'
const FRIENDS_STORE = 'friends'
const MOMENTS_STORE = 'moments'
const POSTS_STORE = 'posts'
const NEWS_STORE = 'news'
const TRACE_POSTS_STORE = 'trace_posts'
const PEOPLE_STORE = 'people'
const ACCOUNT_STORE = 'accounts'
const GIVEAWAY_STORE = 'giveaway'

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      if (!db.objectStoreNames.contains(MESSAGES_STORE)) {
        const store = db.createObjectStore(MESSAGES_STORE, {
          keyPath: 'timeNumber',
        })
        store.createIndex('connection', 'connection')
        store.createIndex('sender', 'username')
        store.createIndex('receiver', 'receiverUsername')
        store.createIndex('status', 'status')
      } else {
        const store = transaction.objectStore(MESSAGES_STORE)
        if (!store.indexNames.contains('status')) {
          store.createIndex('status', 'status')
        }
      }

      if (!db.objectStoreNames.contains(FRIENDS_STORE)) {
        db.createObjectStore(FRIENDS_STORE, { keyPath: 'connection' })
      }

      if (!db.objectStoreNames.contains(MOMENTS_STORE)) {
        const store = db.createObjectStore(MOMENTS_STORE, {
          keyPath: '_id',
        })
        store.createIndex('username', 'username')
        store.createIndex('createdAt', 'createdAt')
      }

      if (!db.objectStoreNames.contains(POSTS_STORE)) {
        const store = db.createObjectStore(POSTS_STORE, {
          keyPath: 'id',
          autoIncrement: true,
        })
        store.createIndex('author', 'author')
        store.createIndex('createdAt', 'createdAt')
        store.createIndex('category', 'category')
      }

      if (!db.objectStoreNames.contains(NEWS_STORE)) {
        const store = db.createObjectStore(NEWS_STORE, {
          keyPath: 'id',
          autoIncrement: true,
        })
        store.createIndex('title', 'title')
        store.createIndex('createdAt', 'createdAt')
      }
      if (!db.objectStoreNames.contains(GIVEAWAY_STORE)) {
        const store = db.createObjectStore(GIVEAWAY_STORE, {
          keyPath: '_id',
          autoIncrement: true,
        })
        store.createIndex('title', 'title')
        store.createIndex('country', 'country')
        store.createIndex('state', 'state')
        store.createIndex('area', 'area')
        store.createIndex('question', 'question')
        store.createIndex('createdAt', 'createdAt')
      }
      if (!db.objectStoreNames.contains(TRACE_POSTS_STORE)) {
        const store = db.createObjectStore(TRACE_POSTS_STORE, {
          keyPath: '_id',
        })
        store.createIndex('username', 'username')
        store.createIndex('createdAt', 'createdAt')
      }
      if (!db.objectStoreNames.contains(PEOPLE_STORE)) {
        const store = db.createObjectStore(PEOPLE_STORE, {
          keyPath: '_id',
        })
        store.createIndex('bioUserUsername', 'bioUserUsername')
        store.createIndex('createdAt', 'createdAt')
      }
      if (!db.objectStoreNames.contains(ACCOUNT_STORE)) {
        const store = db.createObjectStore(ACCOUNT_STORE, {
          keyPath: '_id',
        })
        store.createIndex('username', 'username')
        store.createIndex('createdAt', 'createdAt')
      }
    },
  })
}

export const getPendingMessages = async () => {
  const db = await initDB()
  const tx = db.transaction(MESSAGES_STORE, 'readonly')
  const store = tx.objectStore(MESSAGES_STORE)
  const index = store.index('status')
  const pendingMessages = await index.getAll('pending')
  await tx.done
  return pendingMessages
}

export const updatePendingMessageStatus = async (
  connection: string,
  timeNumber: number,
  newStatus: string
) => {
  const db = await initDB()
  const tx = db.transaction(MESSAGES_STORE, 'readwrite')
  const store = tx.objectStore(MESSAGES_STORE)

  const index = store.index('connection')
  const messages = await index.getAll(connection)

  const targetMessage = messages.find(
    (msg: ChatContent) =>
      msg.timeNumber === timeNumber && msg.connection === connection
  )

  if (!targetMessage) {
    console.warn(`No pending message found for ${connection} @${timeNumber}`)
    await tx.done
    return false
  }

  const updatedMessage = {
    ...targetMessage,
    status: newStatus,
    updatedAt: new Date().toISOString(),
  }

  await store.put(updatedMessage)
  await tx.done

  return true
}

export const updatePendingFriendMessageStatus = async (
  connection: string,
  newStatus: string,
  isFriends: boolean
) => {
  const db = await initDB()
  const tx = db.transaction(FRIENDS_STORE, 'readwrite')
  const store = tx.objectStore(FRIENDS_STORE)

  const friend = await store.get(connection)

  if (!friend) {
    console.warn(`⚠️ No friend found for connection: ${connection}`)
    await tx.done
    return false
  }

  const updatedFriend = {
    ...friend,
    status: newStatus,
    isFriends: isFriends,
    updatedAt: new Date().toISOString(),
  }

  await store.put(updatedFriend)
  await tx.done

  console.log(`✅ Friend '${connection}' updated to '${newStatus}'`)
  return true
}

export const updateMessageStatus = async (uniqueId: string, status: string) => {
  const db = await initDB()
  const tx = db.transaction(MESSAGES_STORE, 'readwrite')
  const store = tx.objectStore(MESSAGES_STORE)
  const msg = await store.get(uniqueId)

  if (msg) {
    msg.status = status
    await store.put(msg)
  }

  await tx.done
}

export const deleteMessageFromDB = async (timeNumber: number) => {
  try {
    const db = await initDB()

    const existing = await db.get(MESSAGES_STORE, timeNumber)
    if (!existing) {
      return false
    }

    await db.delete(MESSAGES_STORE, timeNumber)
    return true
  } catch (error) {
    console.error('❌ Error deleting message:', error)
    return false
  }
}

export const clearTable = async (tableName: string): Promise<void> => {
  const db = await initDB()
  await db.clear(tableName)
}

export const getRecordsFromDB = async <T>(
  table: string,
  limit: number,
  page: number
): Promise<T[]> => {
  const db = await initDB()

  const allItems = await db.getAll(table)

  const start = (page - 1) * limit
  const end = start + limit

  return allItems.slice(start, end) as T[]
}

export const addRecordsToDB = async <T extends { _id: string }>(
  table: string,
  items: T[]
): Promise<void> => {
  const db = await initDB()
  const existingItems: T[] = await db.getAll(table)

  const existingIds = new Set(existingItems.map((i) => i._id))
  const newItems = items.filter((item) => !existingIds.has(item._id))

  for (const item of newItems) {
    await db.put(table, item)
  }
}
