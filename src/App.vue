<template>
  <el-config-provider :locale="currentLocale">
    <router-view />
    <ReDialog />
  </el-config-provider>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, onMounted } from "vue";
import { ElConfigProvider } from "element-plus";
import { ReDialog } from "@/components/ReDialog";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import { WebSocketService } from "@/utils/websocket/service";
import { getToken } from "./utils/auth";

export default defineComponent({
  name: "app",
  components: {
    [ElConfigProvider.name]: ElConfigProvider,
    ReDialog
  },
  setup() {
    onMounted(() => {
      // 如果已登录，确保WebSocket连接
      const token = getToken();
      if (token?.accessToken) {
        WebSocketService.getInstance().connect();
      }
    });

    onBeforeUnmount(() => {
      // 组件销毁时清理WebSocket
      WebSocketService.getInstance().destroy();
    });
  },
  computed: {
    currentLocale() {
      return zhCn;
    }
  }
});
</script>

<style lang="scss">
@import 'https://cdn.jsdelivr.net/npm/@vue-flow/core@1.42.0/dist/style.css';
@import 'https://cdn.jsdelivr.net/npm/@vue-flow/core@1.42.0/dist/theme-default.css';
@import 'https://cdn.jsdelivr.net/npm/@vue-flow/controls@latest/dist/style.css';
@import 'https://cdn.jsdelivr.net/npm/@vue-flow/minimap@latest/dist/style.css';
@import 'https://cdn.jsdelivr.net/npm/@vue-flow/node-resizer@latest/dist/style.css';

.vue-flow__minimap {
  transform: scale(75%);
  transform-origin: bottom right;
}
</style>
