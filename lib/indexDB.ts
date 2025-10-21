import { ChatContent } from '@/src/zustand/chat/Chat'
import { openDB } from 'idb'

const DB_NAME = 'chatDB'
const DB_VERSION = 4
const MESSAGES_STORE = 'messages'
const FRIENDS_STORE = 'friends'

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // ✅ Create messages store if missing
      if (!db.objectStoreNames.contains(MESSAGES_STORE)) {
        const store = db.createObjectStore(MESSAGES_STORE, {
          keyPath: 'uniqueId',
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
  newStatus: 'delivered' | 'read' | 'sent'
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

  console.log(`✅ Message ${connection} updated to '${newStatus}'`)
  return true
}

export const updatePendingFriendMessageStatus = async (
  connection: string,
  newStatus: 'delivered' | 'read' | 'sent'
) => {
  const db = await initDB()
  const tx = db.transaction(FRIENDS_STORE, 'readwrite')
  const store = tx.objectStore(FRIENDS_STORE)

  const index = store.index('connection')
  const messages = await index.getAll(connection)

  if (!messages.length) {
    await tx.done
    return false
  }

  console.log(messages)

  for (const msg of messages) {
    const updatedMessage = {
      ...msg,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    }
    await store.put(updatedMessage)
  }

  await tx.done
  console.log(
    `✅ Updated ${messages.length} messages for '${connection}' to '${newStatus}'`
  )
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
