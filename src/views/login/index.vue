<script setup lang="ts">
import Motion from "./utils/motion";
import { useRouter } from "vue-router";
import { message } from "@/utils/message";
import { loginRules } from "./utils/rule";
import { useNav } from "@/layout/hooks/useNav";
import type { FormInstance } from "element-plus";
import { useLayout } from "@/layout/hooks/useLayout";
import { useUserStoreHook } from "@/store/modules/user";
import { initRouter, getTopMenu } from "@/router/utils";
import { bg, avatar, illustration } from "./utils/static";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { ref, reactive, toRaw, onMounted, onBeforeUnmount } from "vue";
import { useDataThemeChange } from "@/layout/hooks/useDataThemeChange";

import dayIcon from "@/assets/svg/day.svg?component";
import darkIcon from "@/assets/svg/dark.svg?component";
import Lock from "@iconify-icons/ri/lock-fill";
import User from "@iconify-icons/ri/user-3-fill";

import { WebSocketService } from "@/utils/websocket/service";
import { emitter } from "@/utils/mitt";

defineOptions({
  name: "Login"
});
const router = useRouter();
const loading = ref(false);
const ruleFormRef = ref<FormInstance>();

const { initStorage } = useLayout();
initStorage();

const { dataTheme, overallStyle, dataThemeChange } = useDataThemeChange();
dataThemeChange(overallStyle.value);
const { title } = useNav();

const ruleForm = reactive({
  username: "admin",
  password: "123456"
});

const onLogin = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      loading.value = true;
      useUserStoreHook()
        .loginByUsername({ username: ruleForm.username, password: ruleForm.password })
        .then(res => {
          if (res.success) {
            // 获取后端路由
            return initRouter().then(() => {
              router.push(getTopMenu(true).path).then(() => {
                // 登录成功后初始化 WebSocket
                WebSocketService.getInstance().connect();
                emitter.emit("websocketMessage", "登录成功");
                message("登录成功", { type: "success" });
              });
            });
          } else {
            message("登录失败", { type: "error" });
          }
        })
        .finally(() => (loading.value = false));
    }
  });
};

/** 使用公共函数，避免`removeEventListener`失效 */
function onkeypress({ code }: KeyboardEvent) {
  if (["Enter", "NumpadEnter"].includes(code)) {
    onLogin(ruleFormRef.value);
  }
}

onMounted(() => {
  window.document.addEventListener("keypress", onkeypress);
});

onBeforeUnmount(() => {
  window.document.removeEventListener("keypress", onkeypress);
});
</script>

<template>
  <div class="select-none">
    <component :is="bg" class="wave" />
    <div class="flex-c absolute right-5 top-3">
      <!-- 主题 -->
      <el-switch v-model="dataTheme" inline-prompt :active-icon="dayIcon" :inactive-icon="darkIcon"
        @change="dataThemeChange" />
    </div>
    <div class="login-container">
      <div class="img">
        <img :src="illustration" alt="login illustration" />
      </div>
      <div class="login-box">
        <div class="login-form">
          <avatar class="avatar" />
          <Motion>
            <h2 class="outline-none">{{ title }}</h2>
          </Motion>

          <el-form ref="ruleFormRef" :model="ruleForm" :rules="loginRules" size="large">
            <Motion :delay="100">
              <el-form-item :rules="[
                {
                  required: true,
                  message: '请输入账号',
                  trigger: 'blur'
                }
              ]" prop="username">
                <el-input v-model="ruleForm.username" clearable placeholder="账号" :prefix-icon="useRenderIcon(User)" />
              </el-form-item>
            </Motion>

            <Motion :delay="150">
              <el-form-item prop="password">
                <el-input v-model="ruleForm.password" clearable show-password placeholder="密码"
                  :prefix-icon="useRenderIcon(Lock)" />
              </el-form-item>
            </Motion>

            <Motion :delay="250">
              <el-button class="w-full mt-4" size="default" type="primary" :loading="loading"
                @click="onLogin(ruleFormRef)">
                登录
              </el-button>
            </Motion>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url("@/style/login.css");

.wave {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
}

/* logo相关样式 */
.avatar {
  width: 90px;
  height: 90px;
  margin: 0 auto 20px;
  display: block;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
}

/* 输入框样式 */
.el-input {
  --el-input-hover-border-color: var(--el-color-primary);
  --el-input-focus-border-color: var(--el-color-primary);
}

.el-form-item {
  margin-bottom: 1.5rem;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 2px 8px rgba(28, 132, 246, 0.2);
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 2px 8px rgba(28, 132, 246, 0.1);
}

:deep(.el-input-group__append, .el-input-group__prepend) {
  padding: 0;
}
</style>
