// 消息类型定义
export type MessageType = "text" | "image" | "file";

export interface ChatMessage {
  id: number;
  type: MessageType;
  content: string;
  fromUserId: number;
  toUserId: number;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  createdAt: string;
  isRead: boolean;
  isRecalled: boolean;
}

// 会话信息
export interface ChatSession {
  user: any; // 用户信息
  unreadCount: number; // 未读消息数
  lastMessage?: {
    // 最后一条消息
    content: string;
    createdAt: string;
    type: string;
  };
}

// 添加聊天汇总信息类型
export interface ChatSummary {
  unreadCount: number;
  lastMessage?: {
    type: string;
    content: string;
    createdAt: string;
    isRecalled: boolean;
    id: number;
    fromUserId: number;
    toUserId: number;
    isRead: boolean;
    fileUrl?: string;
    fileName?:string
  };
}

export interface ChatSummaryMap {
  [userId: number]: ChatSummary;
}
