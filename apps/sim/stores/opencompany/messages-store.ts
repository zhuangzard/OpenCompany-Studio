import { create } from 'zustand'

export interface MessageState {
  id: string
  senderId: string
  receiverId: string
  type: string
  content: string
  priority: string
  createdAt: string
}

interface MessagesStore {
  messages: MessageState[]
  addMessage: (message: MessageState) => void
  setMessages: (messages: MessageState[]) => void
  clear: () => void
}

const MAX_MESSAGES = 500

export const useMessagesStore = create<MessagesStore>((set) => ({
  messages: [],
  addMessage: (message) =>
    set((state) => ({
      messages: [message, ...state.messages].slice(0, MAX_MESSAGES),
    })),
  setMessages: (messages) => set({ messages }),
  clear: () => set({ messages: [] }),
}))
