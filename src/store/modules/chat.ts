import {defineStore} from "pinia";
import type {
  ChatMessage,
  ChatSession
} from "@/layout/components/lay-chat/types";
import { listChatMessages, sendChatMessage } from "@/api/message";

export const useChatStore = defineStore("chat", {
  state: () => ({
    sessions: [] as ChatSession[],
    currentSession: null as ChatSession | null,
    messages: new Map<number, ChatMessage[]>(), // userId -> messages
    unreadTotal: 0
  }),

  actions: {
    // 获取指定会话的消息历史
    async loadMessages(userId: number, limit: number = 10) {
      const res:any = await listChatMessages({userId, limit});
      const messages = res.data;
      // 更新消息列表
      if (!this.messages.has(userId)) {
        this.messages.set(userId, []);
      }
      this.messages.get(userId)?.push(...messages);
    },

    // 发送消息
    async sendMessage(toUserId: number, content: string) {
      const message = await sendChatMessage({toUserId, content});
      // 更新消息列表
      this.addMessage(message);
    },

    // 处理新消息
    handleNewMessage(message: ChatMessage) {
      this.addMessage(message);
      // 更新未读数
      if (message.fromUserId !== this.currentSession?.userId) {
        this.unreadTotal++;
      }
    }
  }
});
