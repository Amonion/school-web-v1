import { openDB } from 'idb'
const DB_NAME = 'chatDB'
const DB_VERSION = 3
const MESSAGES_STORE = 'messages'
const FRIENDS_STORE = 'friends'

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create messages store if missing
      if (!db.objectStoreNames.contains(MESSAGES_STORE)) {
        const store = db.createObjectStore(MESSAGES_STORE, {
          keyPath: 'uniqueId',
        })
        store.createIndex('connection', 'connection')
        store.createIndex('sender', 'username')
        store.createIndex('receiver', 'receiverUsername')
      }

      // ✅ Recreate friends store if missing
      if (!db.objectStoreNames.contains(FRIENDS_STORE)) {
        db.createObjectStore(FRIENDS_STORE, { keyPath: 'connection' })
      }
    },
  })
}
