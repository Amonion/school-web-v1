// store/aiStore.ts
import apiRequest from '@/lib/axios'
import { create } from 'zustand'

type Message = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface FetchResponse {
  message: string
  count: number
  page_size: number
}

type AIState = {
  messages: Message[]
  loadingAI: boolean
  addMessage: (msg: Message) => void
  sendMessage: (content: string) => Promise<void>
  postAIMessage: (url: string, content: string) => Promise<void>
}

export const AIStore = create<AIState>((set, get) => ({
  loadingAI: false,
  messages: [{ role: 'system', content: 'You are a helpful assistant.' }],

  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),

  sendMessage: async (content: string) => {
    const userMsg: Message = { role: 'user', content }
    set((state) => ({ messages: [...state.messages, userMsg] }))

    try {
      const res = await fetch('/api/deepseek', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [...get().messages, userMsg],
          temperature: 0.7,
          max_tokens: 300,
        }),
      })

      const data = await res.json()
      const aiResponse = data.choices?.[0]?.message?.content ?? 'No response'

      set((state) => ({
        messages: [
          ...state.messages,
          { role: 'assistant', content: aiResponse },
        ],
      }))
    } catch (err) {
      console.error('AI request failed', err)
      set((state) => ({
        messages: [
          ...state.messages,
          { role: 'assistant', content: '⚠️ Error contacting AI.' },
        ],
      }))
    }
  },

  postAIMessage: async (url, content) => {
    const userMsg: Message = { role: 'user', content }
    set((state) => ({ messages: [...state.messages, userMsg] }))
    set({ loadingAI: true })

    console.log(get().messages, userMsg)
    // const form = new FormData()
    // form.append('model', 'deepseek-chat')
    // form.append('messages', [...get().messages, userMsg])
    // form.append('temperature', 0.7)

    const response = await apiRequest<FetchResponse>(url, {
      method: 'POST',
      body: {
        model: 'deepseek-chat',
        messages: [...get().messages, userMsg], // ✅ Include full conversation
        temperature: 0.7,
        max_tokens: 300,
      },
    })

    console.log(response)

    // const aiResponse =
    //   response?.data?.result ??
    //   response?.data?.choices?.[0]?.message?.content ??
    //   'No response'

    // set((state) => ({
    //   messages: [...state.messages, { role: 'assistant', content: aiResponse }],
    //   loadingAI: false,
    // }))
  },

  //   postAIMessage: async (url, content) => {
  //     const userMsg: Message = { role: 'user', content }
  //     set((state) => ({ messages: [...state.messages, userMsg] }))
  //     set({ loadingAI: true })
  //     const response = await apiRequest<FetchResponse>(url, {
  //       method: 'POST',
  //       body: JSON.stringify({
  //         model: 'deepseek-chat',
  //         messages: [...get().messages, userMsg],
  //         temperature: 0.7,
  //         max_tokens: 300,
  //       }),
  //     })

  //     const data = response?.data
  //     const aiResponse = data.choices?.[0]?.message?.content ?? 'No response'
  //     console.log(response)

  //     set((state) => ({
  //       messages: [...state.messages, { role: 'assistant', content: aiResponse }],
  //     }))
  //   },
}))
