<template>
  <div class="chat-container">
    <!-- 用户列表 -->
    <div class="user-list">
      <div class="search-bar">
        <el-input v-model="nickname" placeholder="搜索用户" prefix-icon="Search" clearable @input="handleSearch" />
      </div>
      <el-scrollbar>
        <div v-for="user in userList" :key="user.id" class="user-item" :class="{ active: currentUser?.id === user.id }"
          @click="handleSelectUser(user)">
          <div class="avatar-wrapper">
            <el-avatar :size="40" :src="user.avatar">
              {{ user.nickname?.[0] || user.username?.[0] }}
            </el-avatar>
            <el-badge v-if="chatSummary[user.id]?.unreadCount" :value="chatSummary[user.id].unreadCount" :max="99"
              class="unread-badge" />
          </div>
          <div class="user-info">
            <div class="name-wrapper">
              <span class="name">{{ user.nickname || user.username }}</span>
              <span v-if="chatSummary[user.id]?.lastMessage" class="time">
                {{ formatTime(chatSummary[user.id].lastMessage.createdAt) }}
              </span>
            </div>
            <div class="meta-wrapper">
              <span class="meta">{{ user.departments[0].deptName }} · {{ user.primaryPosition.positionName }}</span>
              <span v-if="chatSummary[user.id]?.lastMessage" class="last-message">
                {{ chatSummary[user.id].lastMessage.isRecalled ? '对方已撤回消息' :
                  formatLastMessage(chatSummary[user.id].lastMessage) }}
              </span>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </div>

    <!-- 聊天区域 -->
    <div class="chat-area">
      <template v-if="currentUser">
        <div class="chat-header">
          <span>{{ currentUser.nickname || currentUser.username }}</span>
        </div>
        <div ref="messageListRef" class="message-list">
          <template v-if="messageList.length > 0">
            <el-scrollbar ref="scrollbarRef" @scroll="handleScroll">
              <div class="message-wrapper">
                <div v-if="hasMore" class="load-more" :class="{ loading: isLoadingMore }">
                  {{ isLoadingMore ? '加载中...' : '下拉加载更多' }}
                </div>

                <div class="virtual-list-wrapper">
                  <div v-for="msg in computedMessageList" :key="msg.id" class="message-item"
                    :class="{ self: msg.fromUserId === currentUserId }" @contextmenu="handleContextMenu($event, msg)">
                    <el-avatar :size="36"
                      :src="msg.fromUserId === currentUserId ? userInfo.avatar : currentUser.avatar" />
                    <div class="message-content">
                      <div class="message-text" :class="{ 'recalled': msg.isRecalled }">
                        <template v-if="msg.isRecalled">
                          此消息已撤回
                        </template>
                        <template v-else>
                          <!-- 纯文本消息 -->
                          <template v-if="msg.type === 'text' && !msg.fileUrl">
                            {{ msg.content }}
                          </template>
                          <!-- 图片消息 -->
                          <template v-else-if="msg.fileUrl && isImageFile(msg.fileName || msg.content)">
                            <el-image :src="msg.fileUrl" :preview-src-list="[msg.fileUrl]" class="message-image"
                              fit="cover" />
                          </template>
                          <!-- 文件消息 -->
                          <template v-else-if="msg.fileUrl">
                            <div class="file-message" @click="downloadFile(msg)">
                              <el-icon>
                                <Document />
                              </el-icon>
                              <div class="file-info">
                                <div class="file-name">{{ msg.fileName || msg.content }}</div>
                                <div class="file-size">{{ formatFileSize(msg.fileSize) }}</div>
                              </div>
                              <el-icon>
                                <Download />
                              </el-icon>
                            </div>
                          </template>
                        </template>
                      </div>
                      <div class="message-time">{{ msg.createdAt }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </el-scrollbar>
          </template>
        </div>
        <div class="message-input">
          <div class="toolbar">
            <el-popover v-model:visible="showEmoji" trigger="click" :width="360" placement="top-start">
              <template #reference>
                <div class="toolbar-btn">
                  <Icon :icon="emotion" width="22" />
                </div>
              </template>
              <div class="emoji-panel">
                <div class="emoji-tabs">
                  <el-tabs>
                    <el-tab-pane label="常用表情">
                      <el-scrollbar height="240px">
                        <div class="emoji-list">
                          <span v-for="emoji in emojiList" :key="emoji" class="emoji-item" :title="emoji"
                            @click="insertEmoji(emoji)">
                            {{ emoji }}
                          </span>
                        </div>
                      </el-scrollbar>
                    </el-tab-pane>
                  </el-tabs>
                </div>
              </div>
            </el-popover>

            <el-upload ref="uploadRef" :show-file-list="false" :auto-upload="true" :http-request="customUpload">
              <div class="toolbar-btn">
                <Icon :icon="attachment" width="22" />
              </div>
            </el-upload>
          </div>
          <el-input v-model="messageInputState.content" type="textarea" :rows="3" placeholder="请输入消息"
            @keyup.enter.prevent="handleSendMessage" />
          <el-button type="primary" @click="handleSendMessage">发送</el-button>
        </div>
      </template>
      <div v-else class="no-chat">
        <el-empty description="选择一个联系人开始聊天" />
      </div>
    </div>

    <!-- 添加右键菜单 -->
    <div v-if="showContextMenu" class="context-menu" :style="{
      left: contextMenuPosition.x + 'px',
      top: contextMenuPosition.y + 'px'
    }">
      <div class="context-menu-item" @click="handleRecallMessage">
        撤回消息
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, reactive, computed } from 'vue';
import { userListQuery } from '@/api/user';
import { listChatMessages, sendChatMessage, recallMessage, getChatSummary, markAllMessagesAsRead } from '@/api/message';
import type { ChatMessage, ChatSummary, ChatSummaryMap } from './types';
import { useUserStore } from '@/store/modules/user';
import { DataInfo, userKey } from '@/utils/auth';
import { storageLocal } from "@pureadmin/utils";
import { emitter } from "@/utils/mitt";
import { ElMessage, UploadRequestOptions } from 'element-plus';
import dayjs from 'dayjs';
import emotion from '@iconify-icons/ri/emotion-laugh-line';
import { Icon } from '@iconify/vue';
import { Document, Download } from '@element-plus/icons-vue';
import attachment from '@iconify-icons/ri/attachment-2';
import { downloadByUrl } from "@pureadmin/utils";
import { http } from '@/utils/http';

const userStore = useUserStore();
const currentUserId = userStore.id;
const userInfo: any = storageLocal().getItem<DataInfo<number>>(userKey) ?? {};

const userList = ref<any[]>([]);
const currentUser = ref<any | null>(null);
const messageList = ref<ChatMessage[]>([]);
const messageInputState = reactive({
  content: ''
});
const nickname = ref('');
const loading = ref(false);

// 聊天汇总信息状态
const chatSummary = ref<ChatSummaryMap>({});

// 计算属性来确保消息列表的响应性
const computedMessageList = computed(() => {
  return Array.isArray(messageList.value) ? messageList.value : [];
});

// 加载用户列表
const loadUsers = async () => {
  try {
    loading.value = true;
    const res: any = await userListQuery({
      page: 1,
      pageSize: 20,
      nickname: nickname.value
    });
    if (res.success) {
      userList.value = res.data.list || [];
    }
  } catch (error) {
  } finally {
    loading.value = false;
  }
};

// 使用 ref 来获取滚动容器
const scrollbarRef = ref();
const scrollToBottom = () => {
  nextTick(() => {
    if (scrollbarRef.value) {
      const scrollbar = scrollbarRef.value.$el.querySelector('.el-scrollbar__wrap');
      if (scrollbar) {
        scrollbar.scrollTop = scrollbar.scrollHeight;
      }
    }
  });
};

// 添加新的状态变量，使用时间戳替代消息ID
const isLoadingMore = ref(false);
const hasMore = ref(true);
const firstMessageId = ref<number | null>(null);

// 添加消息去重函数
const deduplicateMessages = (messages: ChatMessage[]) => {
  const seen = new Set<number>();
  return messages.filter(msg => {
    if (seen.has(msg.id)) {
      return false;
    }
    seen.add(msg.id);
    return true;
  });
};

// 添加节流函数
const throttle = (fn: Function, delay: number) => {
  let lastTime = 0;
  return function (...args: any[]) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
};

// 添加加载状态锁
const isScrollLoading = ref(false);

// 修改滚动处理函数
const handleScroll = throttle(async (args: { scrollTop: number; scrollLeft: number }) => {
  try {
    if (!currentUser.value || isLoadingMore.value || !hasMore.value || isScrollLoading.value) return;

    const { scrollTop } = args;
    const scrollThreshold = 50; // 增加触发阈值

    if (scrollTop < scrollThreshold) {
      isScrollLoading.value = true;
      await loadMessages(currentUser.value.id, firstMessageId.value!);
      // 添加短暂延时，防止快速重复触发
      setTimeout(() => {
        isScrollLoading.value = false;
      }, 500);
    }
  } catch (error) {
    console.error('Scroll handler error:', error);
    isScrollLoading.value = false;
  }
}, 300); // 300ms的节流时间

// 修改loadMessages函数，保持滚动位置
const loadMessages = async (userId: number, beforeId?: number) => {
  try {
    if (!beforeId) {
      messageList.value = [];
      hasMore.value = true;
      firstMessageId.value = null;
    }

    if (isLoadingMore.value || !hasMore.value) return;

    isLoadingMore.value = true;

    // 记录当前滚动位置和内容高度
    let scrollbar;
    let oldScrollHeight = 0;
    let oldScrollTop = 0;

    if (beforeId && scrollbarRef.value) {
      scrollbar = scrollbarRef.value.$el.querySelector('.el-scrollbar__wrap');
      if (scrollbar) {
        oldScrollHeight = scrollbar.scrollHeight;
        oldScrollTop = scrollbar.scrollTop;
      }
    }

    const res: any = await listChatMessages({
      toUserId: userId,
      limit: 20,
      beforeId: beforeId
    });

    if (res.success) {
      const messages = Array.isArray(res.data) ? res.data : [];
      hasMore.value = messages.length === 20;

      if (beforeId) {
        const mergedMessages = [...messages, ...messageList.value];
        messageList.value = deduplicateMessages(mergedMessages);

        // 在下一个tick恢复滚动位置
        nextTick(() => {
          if (scrollbar) {
            const newScrollHeight = scrollbar.scrollHeight;
            const heightDiff = newScrollHeight - oldScrollHeight;
            scrollbar.scrollTop = oldScrollTop + heightDiff;
          }
        });
      } else {
        messageList.value = messages;
        scrollToBottom();
      }

      if (messages.length > 0 && !firstMessageId.value) {
        firstMessageId.value = messages[0].id;
      }
    }
  } catch (error) {
    console.error('Failed to load messages:', error);
    if (!beforeId) {
      messageList.value = [];
    }
  } finally {
    isLoadingMore.value = false;
  }
};

// 选择用户
const handleSelectUser = async (user: any) => {
  currentUser.value = user;
  await loadMessages(user.id);

  // 标记该用户的所有消息为已读
  try {
    await markAllMessagesAsRead({ fromUserId: user.id });
    // 更新聊天汇总信息中的未读数
    if (chatSummary.value[user.id]) {
      chatSummary.value[user.id].unreadCount = 0;
    }
  } catch (error) {
    console.error('Failed to mark messages as read:', error);
  }
};

// 发送消息
const handleSendMessage = async () => {
  const content = messageInputState.content.trim();
  if (!content || !currentUser.value) return;

  const tempContent = content;
  messageInputState.content = '';

  try {
    const res: any = await sendChatMessage({
      type: "text",
      toUserId: currentUser.value.id,
      content: tempContent
    });
    if (res.success) {
      const message: ChatMessage = {
        id: res.data.id,
        type: "text",
        content: tempContent,
        fromUserId: currentUserId,
        toUserId: currentUser.value.id,
        createdAt: res.data.createdAt,
        isRead: false,
        isRecalled: false
      };

      if (!Array.isArray(messageList.value)) {
        messageList.value = [];
      }
      messageList.value = [...messageList.value, message];
      scrollToBottom();
    }
  } catch (error) {
    messageInputState.content = tempContent;
  }
};

// 搜索用户
const handleSearch = () => {
  loadUsers();
};

// 处理新消息
const handleNewMessage = (message: ChatMessage) => {
  if (!Array.isArray(messageList.value)) {
    messageList.value = [];
  }

  if (message.fromUserId === currentUserId || message.toUserId === currentUserId) {
    if (!currentUser.value) {
      const otherUserId = message.fromUserId === currentUserId ? message.toUserId : message.fromUserId;
      const otherUser = userList.value.find(u => u.id === otherUserId);
      if (otherUser) {
        currentUser.value = otherUser;
      }
    }

    if (currentUser.value &&
      (currentUser.value.id === message.fromUserId ||
        currentUser.value.id === message.toUserId)) {
      // 添加新消息前先检查是否存在
      if (!messageList.value.some(msg => msg.id === message.id)) {
        messageList.value = [...messageList.value, message];
        scrollToBottom();
      }
    }
  }

  // 更新聊天汇总信息
  const otherUserId = message.fromUserId === currentUserId ? message.toUserId : message.fromUserId;
  if (!chatSummary.value[otherUserId]) {
    chatSummary.value[otherUserId] = {
      unreadCount: 0,
      lastMessage: null
    };
  }

  // 如果不是当前聊天窗口，增加未读数
  if (!currentUser.value || currentUser.value.id !== otherUserId) {
    chatSummary.value[otherUserId].unreadCount++;
  }

  // 更新最后一条消息
  chatSummary.value[otherUserId].lastMessage = {
    type: message.type,
    content: message.type === 'text' ? message.content :
      message.type === 'image' ? '[图片]' : '[文件]',
    createdAt: message.createdAt,
    isRecalled: message.isRecalled,
    id: message.id,
    fromUserId: message.fromUserId,
    toUserId: message.toUserId,
    isRead: message.isRead
  };
};

const messageListRef = ref<HTMLElement | null>(null);

// 右键菜单相关的状态
const showContextMenu = ref(false);
const contextMenuPosition = reactive({
  x: 0,
  y: 0
});
const selectedMessage = ref<ChatMessage | null>(null);

// 处理右键菜单
const handleContextMenu = (event: MouseEvent, message: ChatMessage) => {
  // 只有自己发送的消息才能撤回
  if (message.fromUserId !== currentUserId) return;

  event.preventDefault();
  showContextMenu.value = true;
  contextMenuPosition.x = event.clientX;
  contextMenuPosition.y = event.clientY;
  selectedMessage.value = message;
};

// 关闭右键菜单
const closeContextMenu = () => {
  showContextMenu.value = false;
  selectedMessage.value = null;
};

// 撤回消息
const handleRecallMessage = async () => {
  if (!selectedMessage.value) return;

  // 保存消息ID，防止selectedMessage被清空
  const messageToRecall = {
    id: selectedMessage.value.id,
    createdAt: selectedMessage.value.createdAt
  };

  // 检查消息是否在2分钟内
  const messageTime = new Date(messageToRecall.createdAt).getTime();
  const now = new Date().getTime();
  const twoMinutes = 2 * 60 * 1000; // 2分钟的毫秒数

  if (now - messageTime > twoMinutes) {
    ElMessage.warning('只能撤回2分钟内的消息');
    closeContextMenu();
    return;
  }

  try {
    const res: any = await recallMessage({
      messageId: messageToRecall.id
    });

    if (res) {
      // 手动触发撤回消息的处理，确保发送方也能看到撤回效果
      handleRecallNotification({
        fromUserId: currentUserId,
        toUserId: currentUser.value!.id,
        id: messageToRecall.id
      });

      ElMessage.success('消息已撤回');
    }
  } catch (error) {
    ElMessage.error('撤回失败');
  } finally {
    closeContextMenu();
  }
};

// 处理撤回消息通知
const handleRecallNotification = (data: { fromUserId: number, toUserId: number, id: number }) => {
  let targetUserId = data.fromUserId === currentUserId ? data.toUserId : data.fromUserId;
  // 检查当前用户是否是消息的发送方或接收方
  if ((data.fromUserId === currentUserId || data.toUserId === currentUserId) &&
    currentUser.value &&
    (currentUser.value.id === data.fromUserId || currentUser.value.id === data.toUserId)) {

    // 查找并更新被撤回的消息
    const index = messageList.value.findIndex(msg => msg.id === data.id);
    if (index !== -1) {
      // 更新消息列表中的消息状态
      messageList.value[index].isRecalled = true;
      messageList.value = [...messageList.value];

      // 如果这条消息是用户列表中显示的最后一条消息，则更新其状态
      if (chatSummary.value[targetUserId]?.lastMessage?.id === data.id) {
        chatSummary.value[targetUserId].lastMessage = {
          ...chatSummary.value[targetUserId].lastMessage!,
          isRecalled: true
        };
      }

      // 如果不是自己撤回的消息，显示提示
      if (data.fromUserId !== currentUserId) {
        ElMessage.info('对方撤回了一条消息');
      }
    }
  } else {
    // 不是当前用户，但是可以更新列表的最后一条消息
    if (chatSummary.value[targetUserId]?.lastMessage?.id === data.id) {
      chatSummary.value[targetUserId].lastMessage = {
        ...chatSummary.value[targetUserId].lastMessage!,
        isRecalled: true
      };
    }
  }
};

// 加载聊天汇总信息
const loadChatSummary = async () => {
  try {
    const res: any = await getChatSummary();
    if (res.success) {
      chatSummary.value = res.data || {};
    }
  } catch { }
};

// 格式化最后一条消息
const formatLastMessage = (message: ChatSummary['lastMessage']) => {
  if (!message) return '';
  if (message.type === 'text' && !message.fileUrl) {
    return message.content;
  }
  if (message.fileUrl && isImageFile(message.fileName || message.content)) {
    return '[图片]';
  }
  return '[文件]';
};

// 格式化时间
const formatTime = (time: string) => {
  const messageDate = dayjs(time);
  const now = dayjs();

  if (messageDate.isSame(now, 'day')) {
    return messageDate.format('HH:mm');
  } else if (messageDate.isSame(now.subtract(1, 'day'), 'day')) {
    return '昨天';
  } else if (messageDate.isSame(now, 'year')) {
    return messageDate.format('MM-DD');
  }
  return messageDate.format('YYYY-MM-DD');
};

// 表情相关
const showEmoji = ref(false)
const emojiList = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
  '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
  '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
  '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
  '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠',
  '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨'
]

// 插入表情的方法
const insertEmoji = (emoji: string) => {
  messageInputState.content += emoji
  showEmoji.value = false
}

// 文件上传相关
const uploadRef = ref();

// 自定义上传方法
const customUpload = async (options: UploadRequestOptions) => {
  const { file } = options;
  if (!file) return;

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("directory", "chat");

    const { success, data: fileUrl } = await http.request<any>("post", "/upload/file", {
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (success) {
      // 判断文件类型
      const isImage = file.type.startsWith('image/');

      // 发送消息
      const res: any = await sendChatMessage({
        toUserId: currentUser.value!.id,
        type: isImage ? 'image' : 'file',
        content: file.name,
        fileUrl: fileUrl,
        fileName: file.name,
        fileSize: file.size
      });

      if (res.success) {
        const message: ChatMessage = {
          id: res.data.id,
          type: isImage ? 'image' : 'file',
          content: file.name,
          fromUserId: currentUserId,
          toUserId: currentUser.value!.id,
          fileUrl: fileUrl,
          fileName: file.name,
          fileSize: file.size,
          createdAt: res.data.createdAt,
          isRead: false,
          isRecalled: false
        };

        messageList.value = [...messageList.value, message];
        scrollToBottom();
      }
    }
  } catch (error) {
  }
};

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

// 下载文件
const downloadFile = (message: ChatMessage) => {
  if (message.fileUrl && message.fileName) {
    downloadByUrl(message.fileUrl, message.fileName);
  }
};

// 判断是否为图片文件
const isImageFile = (filename: string) => {
  if (!filename) return false;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
  return imageExtensions.some(ext =>
    filename.toLowerCase().endsWith(ext)
  );
};

// 添加打开指定用户聊天的方法
const openChatWithUser = async (userId: number) => {
  console.log('openChatWithUser called', userId);
  try {
    // 如果用户列表为空，先加载用户列表
    if (userList.value.length === 0) {
      await loadUsers();
    }

    // 查找指定用户
    const targetUser = userList.value.find(user => user.id === userId);
    if (targetUser) {
      console.log('Found target user', targetUser);
      // 选择该用户并加载消息
      await handleSelectUser(targetUser);
    } else {
      console.warn('Target user not found', userId);
    }
  } catch (error) {
    console.error('Failed to open chat with user:', error);
  }
};

onMounted(() => {
  loadUsers();
  loadChatSummary();
  emitter.on("chatMessage", handleNewMessage);
  emitter.on("recallMessage", handleRecallNotification);
  emitter.on("openChat", openChatWithUser);
  document.addEventListener('click', closeContextMenu);
});

onBeforeUnmount(() => {
  emitter.off("chatMessage", handleNewMessage);
  emitter.off("recallMessage", handleRecallNotification);
  emitter.off("openChat", openChatWithUser);
  document.removeEventListener('click', closeContextMenu);
});
</script>

<style lang="scss" scoped>
.chat-container {
  display: flex;
  height: 600px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;

  .user-list {
    width: 280px;
    border-right: 1px solid var(--el-border-color-light);
    display: flex;
    flex-direction: column;

    .search-bar {
      padding: 12px;
      border-bottom: 1px solid var(--el-border-color-light);
    }

    .user-item {
      display: flex;
      padding: 12px;
      cursor: pointer;

      &:hover {
        background-color: var(--el-fill-color-light);
      }

      &.active {
        background-color: var(--el-fill-color);
      }

      .avatar-wrapper {
        position: relative;

        .unread-badge {
          position: absolute;
          top: -8px;
          right: -8px;
        }
      }

      .user-info {
        margin-left: 12px;

        .name-wrapper {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .time {
            font-size: 12px;
            color: var(--el-text-color-secondary);
          }
        }

        .meta-wrapper {
          display: flex;
          flex-direction: column;
          margin-top: 4px;

          .last-message {
            font-size: 12px;
            color: var(--el-text-color-secondary);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 180px;
          }
        }
      }
    }
  }

  .chat-area {
    flex: 1;
    display: flex;
    flex-direction: column;

    .chat-header {
      padding: 12px;
      border-bottom: 1px solid var(--el-border-color-light);
      font-weight: 500;
    }

    .message-list {
      flex: 1;
      position: relative;
      overflow: hidden;

      .message-wrapper {
        padding: 20px;
        min-height: 100%;
      }

      .el-scrollbar {
        height: 100%;

        :deep(.el-scrollbar__wrap) {
          height: 100%;
        }
      }

      .message-item {
        display: flex;
        margin-bottom: 20px;

        &.self {
          flex-direction: row-reverse;

          .message-content {
            margin: 0 12px 0 0;
            align-items: flex-end;
          }
        }

        .message-content {
          margin-left: 12px;
          display: flex;
          flex-direction: column;

          .message-text {
            background: var(--el-fill-color-light);
            padding: 8px 12px;
            border-radius: 4px;
            max-width: 400px;

            &.recalled {
              color: var(--el-text-color-secondary);
              font-style: italic;
              background: var(--el-fill-color);
            }
          }

          .message-time {
            font-size: 12px;
            color: var(--el-text-color-secondary);
            margin-top: 4px;
          }
        }
      }
    }

    .message-input {
      padding: 12px;
      border-top: 1px solid var(--el-border-color-light);

      .el-button {
        margin-top: 8px;
        width: 100%;
      }
    }

    .no-chat {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

.context-menu {
  position: fixed;
  background: white;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  padding: 4px 0;
  min-width: 100px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 9999;

  .context-menu-item {
    padding: 8px 16px;
    cursor: pointer;
    font-size: 14px;
    color: var(--el-text-color-primary);

    &:hover {
      background-color: var(--el-fill-color-light);
    }
  }
}

.message-item {
  user-select: none; // 防止文本选中影响右键菜单

  .message-text {
    &.recalled {
      color: var(--el-text-color-secondary);
      font-style: italic;
      background: var(--el-fill-color);
    }
  }
}

.message-input {
  .toolbar {
    padding: 8px 12px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    display: flex;
    align-items: center;
    gap: 8px;

    .toolbar-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 4px;
      cursor: pointer;
      color: var(--el-text-color-regular);
      transition: all 0.2s;

      &:hover {
        background-color: var(--el-fill-color-light);
        color: var(--el-color-primary);
      }
    }
  }
}

.emoji-panel {
  .el-tabs {
    :deep(.el-tabs__header) {
      margin-bottom: 12px;
    }

    :deep(.el-tabs__content) {
      overflow: visible;
    }
  }

  .emoji-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 0 8px 8px;

    .emoji-item {
      cursor: pointer;
      font-size: 24px;
      height: 40px;
      width: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: all 0.2s;

      &:hover {
        background-color: var(--el-fill-color-light);
        transform: scale(1.15);
      }
    }
  }
}

// 优化消息气泡中表情的显示
.message-text {
  font-size: 15px;
  line-height: 1.6;
  padding: 10px 14px;
  border-radius: 4px;
  max-width: 400px;
  word-break: break-word;

  .emoji-item {
    font-size: 20px;
    vertical-align: middle;
    margin: 0 1px;
  }
}

.load-more {
  text-align: center;
  color: var(--el-text-color-secondary);
  font-size: 14px;
  padding: 10px 0;

  &.loading {
    opacity: 0.6;
  }
}

.virtual-list-wrapper {
  min-height: 100%;
  padding: 10px 0;
}

.message-wrapper {
  padding: 20px;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.file-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--el-fill-color);
  }

  .file-info {
    flex: 1;
    min-width: 0;

    .file-name {
      font-size: 14px;
      color: var(--el-text-color-primary);
      margin-bottom: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .file-size {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }
}

.message-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 4px;
  cursor: pointer;
  display: block; // 确保图片正确显示
  margin: 4px 0;
}

.toolbar {
  .toolbar-btn {
    // ... 原有样式 ...

    .el-icon {
      font-size: 22px;
    }
  }
}
</style>