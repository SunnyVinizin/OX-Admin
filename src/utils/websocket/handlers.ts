import {readMessage} from "@/api/message";
import {emitter} from "@/utils/mitt";
import {ElNotification} from "element-plus";
import {h} from "vue";
import type {ChatMessage} from "@/layout/components/lay-chat/types";

// 消息类型定义
export interface WebSocketMessage {
  type: string;
  data?: any;
  [key: string]: any;
}

// 消息类型映射
const messageTypeMap: Record<string, {color: string; text: string}> = {
  connected: {color: "success", text: "实时通信连接成功"},
  workflow_create: {color: "warning", text: "新建工作流"},
  workflow_approve: {color: "success", text: "工作流已审批"},
  workflow_reject: {color: "error", text: "工作流已拒绝"},
  workflow_complete: {color: "success", text: "工作流已完成"},
  workflow_transfer: {color: "info", text: "工作流已转派"},
  chat: {color: "primary", text: "新消息"},
  recall_notification: {color: "info", text: "消息撤回提醒"}
};

// 初始化消息处理器
export function setupWebSocketHandlers(): void {
  // 处理 WebSocket 消息
  emitter.on("wsMessage", (message: WebSocketMessage) => {
    console.log("[WebSocket] 收到消息:", message);

    if (message.type === "read_status_update") {
      return;
    }

    // 如果是聊天消息，直接转发给聊天组件处理
    if (
      message.type === "text" ||
      message.type === "image" ||
      message.type === "file"
    ) {
      // 直接转发原始消息
      emitter.emit("chatMessage", message as ChatMessage);
      return;
    }

    // 处理撤回消息通知
    if (message.type === "recall_notification") {
      emitter.emit("recallMessage", {
        fromUserId: message.fromUserId,
        toUserId: message.toUserId,
        id: message.id
      });
      return;
    }

    const typeInfo = messageTypeMap[message.type] || {
      color: "info",
      text: "系统消息"
    };

    const notification = ElNotification({
      title: typeInfo.text,
      message: h("div", {class: "flex flex-col gap-1"}, [
        h("div", {class: "text-[var(--el-text-color-primary)]"}, message.title),
        h(
          "div",
          {class: "text-[var(--el-text-color-regular)] text-[13px]"},
          message.content
        ),
        message.instanceId &&
          h(
            "el-button",
            {
              type: "primary",
              text: true,
              class: "mt-1 !p-0 cursor-pointer",
              onClick: () => {
                // 标记消息为已读
                readMessage({messageId: message.id});
                // 关闭当前通知
                notification.close();

                if (
                  ["workflow_reject", "workflow_complete"].includes(
                    message.type
                  )
                ) {
                  // 跳转到工作流详情页
                  window.location.href = `/engine/instance/index?id=${message.instanceId}`;
                } else {
                  // 跳转到任务详情页
                  window.location.href = `/engine/todo/index?id=${message.instanceId}`;
                }
              }
            },
            "查看详情"
          )
      ]),
      type: typeInfo.color as any,
      duration: 5000,
      position: "top-right",
      offset: 16
    });
  });

  // 处理连接状态变化
  emitter.on("wsConnected", (connected: boolean) => {
    if (connected) {
      console.log("WebSocket连接已建立");
    } else {
      console.log("WebSocket连接已断开");
    }
  });

  // 处理错误
  emitter.on("wsError", (error: string) => {
    ElNotification({
      title: "错误",
      message: error,
      type: "error"
    });
  });
}

// 导出消息类型映射
export function getMessageTypeInfo(type: string) {
  return messageTypeMap[type] || {color: "info", text: "系统消息"};
}
