<script setup lang="ts">
import { useNav } from "@/layout/hooks/useNav";
import LaySearch from "../lay-search/index.vue";
import LayNavMix from "../lay-sidebar/NavMix.vue";
import LaySidebarFullScreen from "../lay-sidebar/components/SidebarFullScreen.vue";
import LaySidebarBreadCrumb from "../lay-sidebar/components/SidebarBreadCrumb.vue";
import LaySidebarTopCollapse from "../lay-sidebar/components/SidebarTopCollapse.vue";

import LogoutCircleRLine from "@iconify-icons/ri/logout-circle-r-line";
import Setting from "@iconify-icons/ri/settings-3-line";
import ChatDotRound from "@iconify-icons/ri/chat-3-line";
import { ref, onMounted, onBeforeUnmount } from 'vue';
import LayChat from '../lay-chat/index.vue';
import { emitter } from "@/utils/mitt";
import type { ChatMessage } from '../lay-chat/types';

const {
  layout,
  device,
  logout,
  onPanel,
  pureApp,
  username,
  userAvatar,
  avatarsStyle,
  toggleSideBar
} = useNav();

const chatVisible = ref(false);
const unreadTotal = ref(0);

// 处理新消息，更新未读数
const handleNewMessage = (message: ChatMessage) => {
  if (!chatVisible.value) {
    unreadTotal.value++;
  }
};

// 打开聊天窗口时重置未读数
const openChat = () => {
  chatVisible.value = true;
  unreadTotal.value = 0;
};

onMounted(() => {
  emitter.on("chatMessage", handleNewMessage);
});

onBeforeUnmount(() => {
  emitter.off("chatMessage", handleNewMessage);
});
</script>

<template>
  <div class="navbar bg-[#fff] shadow-sm shadow-[rgba(0,21,41,0.08)]">
    <LaySidebarTopCollapse v-if="device === 'mobile'" class="hamburger-container" :is-active="pureApp.sidebar.opened"
      @toggleClick="toggleSideBar" />

    <LaySidebarBreadCrumb v-if="layout !== 'mix' && device !== 'mobile'" class="breadcrumb-container" />

    <LayNavMix v-if="layout === 'mix'" />

    <div v-if="layout === 'vertical'" class="vertical-header-right">
      <!-- 菜单搜索 -->
      <LaySearch id="header-search" />
      <!-- 全屏 -->
      <LaySidebarFullScreen id="full-screen" />
      <!-- 消息通知 -->

      <!-- 聊天 -->
      <!-- <div id="header-chat"> -->
      <el-badge :value="unreadTotal" :max="99" :hidden="!unreadTotal" class="badge-adjust">
        <span class="fullscreen-icon navbar-bg-hover" @click="openChat">
          <IconifyIconOffline :icon="ChatDotRound" />
        </span>
      </el-badge>
      <!-- </div> -->
      <!-- 退出登录 -->
      <el-dropdown trigger="click">
        <span class="el-dropdown-link navbar-bg-hover select-none">
          <img :src="userAvatar" :style="avatarsStyle" />
          <p v-if="username" class="dark:text-white">{{ username }}</p>
        </span>
        <template #dropdown>
          <el-dropdown-menu class="logout">
            <el-dropdown-item @click="logout">
              <IconifyIconOffline :icon="LogoutCircleRLine" style="margin: 5px" />
              退出系统
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <span class="set-icon navbar-bg-hover" title="打开系统配置" @click="onPanel">
        <IconifyIconOffline :icon="Setting" />
      </span>
    </div>

    <!-- 聊天窗口 -->
    <el-dialog v-model="chatVisible" title="消息" :width="1000" :destroy-on-close="false" :close-on-click-modal="false"
      draggable>
      <LayChat />
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.navbar {
  width: 100%;
  height: 48px;
  overflow: hidden;

  .hamburger-container {
    float: left;
    height: 100%;
    line-height: 48px;
    cursor: pointer;
  }

  .vertical-header-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    min-width: 280px;
    height: 48px;
    color: #000000d9;

    #header-chat {
      display: flex;
      align-items: center;
      height: 48px;
      padding: 0 10px;
      cursor: pointer;
    }

    .el-dropdown-link {
      display: flex;
      align-items: center;
      justify-content: space-around;
      height: 48px;
      padding: 10px;
      color: #000000d9;
      cursor: pointer;

      p {
        font-size: 14px;
      }

      img {
        width: 22px;
        height: 22px;
        border-radius: 50%;
      }
    }
  }

  .breadcrumb-container {
    float: left;
    margin-left: 16px;
  }
}

.logout {
  width: 120px;

  ::v-deep(.el-dropdown-menu__item) {
    display: inline-flex;
    flex-wrap: wrap;
    min-width: 100%;
  }
}

.badge-adjust {
  :deep(.el-badge__content) {
    top: 5px;
    /* 调整上下位置 */
    right: 5px;
    /* 调整左右位置 */
  }
}
</style>
