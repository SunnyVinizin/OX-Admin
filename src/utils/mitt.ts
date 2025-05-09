import type {Emitter} from "mitt";
import mitt from "mitt";
// import type {WebSocketMessage} from "./websocket/handlers";
import type {ChatMessage} from "@/layout/components/lay-chat/types";
/** 全局公共事件需要在此处添加类型 */
type Events = {
  openPanel: string;
  tagViewsChange: string;
  tagViewsShowModel: string;
  logoChange: boolean;
  changLayoutRoute: string;
  websocketMessage: string;
  // WebSocket 相关事件
  wsMessage: {
    id: number;
    type: string;
    content: string;
    fromUserId: number;
    toUserId: number;
    createdAt: string;
    isRead: boolean;
    isRecalled: boolean;
  };
  wsConnected: boolean;
  wsError: string;
  chatMessage: ChatMessage;
  // 消息撤回事件
  recallMessage: {
    fromUserId: number;
    toUserId: number;
    id: number;
  };
  // 添加打开聊天事件类型
  openChat: number;
  openChatWindow: null; // 改为 null 类型，表示无参数事件
};

export const emitter: Emitter<Events> = mitt<Events>();
