import {http} from "@/utils/http";

// 发送测试消息
export const sendTestMessage = data => {
  return http.request("post", "/messages/test", {data});
};

// 已读消息
export const readMessage = data => {
  return http.request("put", `/messages/read`, {data});
};

// 获取未读消息数量
export const getUnreadMessageCount = () => {
  return http.request("get", `/messages/unread/count`);
};

// 获取聊天消息列表
export const listChatMessages = (data: {
  toUserId: number; // 接收者ID
  limit: number; // 每页条数
  beforeId?: number;
}) => {
  return http.request("post", `/messages/chat/list`, {data});
};

// 发送聊天消息
export const sendChatMessage = data => {
  return http.request("post", `/messages/chat`, {data});
};
// 撤回消息
export const recallMessage = data => {
  return http.request("put", `/messages/chat/recall`, {data});
};

// 聊天消息已读
export const readChatMessage = data => {
  return http.request("put", `/messages/chat/read`, {data});
};

// 获取聊天汇总信息
export const getChatSummary = () => {
  return http.request("get", "/messages/chat/summary");
};

// 标记所有消息为已读
export const markAllMessagesAsRead = (data: {fromUserId: number}) => {
  return http.request("put", "/messages/chat/read/all", {data});
};
