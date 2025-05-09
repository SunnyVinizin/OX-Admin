<!-- src/views/system/menu/permission-drawer.vue -->
<script setup lang="ts">
import {ref, computed} from "vue";

interface Permission {
  id: number;
  permission_key: string;
  permission_name: string;
  status: number;
  created_at: string;
  updated_at: string;
}

const props = defineProps<{
  modelValue: boolean;
  menuTitle: string;
  permissions: Permission[];
}>();

const emit = defineEmits(["update:modelValue"]);

// 使用计算属性来处理 v-model
const visible = computed({
  get: () => props.modelValue,
  set: val => emit("update:modelValue", val)
});
</script>

<template>
  <el-drawer
    v-model="visible"
    :title="`${menuTitle} - 权限列表`"
    size="500px"
    :destroy-on-close="true"
  >
    <div class="p-4">
      <el-empty v-if="!permissions?.length" description="暂无权限数据" />

      <template v-else>
        <div class="permission-list">
          <el-card
            v-for="item in permissions"
            :key="item.id"
            class="mb-4 permission-card"
            shadow="hover"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <h4 class="font-medium mb-2">{{ item.permission_name }}</h4>
                <div class="text-gray-500 text-sm">
                  <p class="mb-1">权限标识: {{ item.permission_key }}</p>
                  <p class="mb-0">
                    <el-tag
                      :type="item.status === 1 ? 'success' : 'danger'"
                      size="small"
                    >
                      {{ item.status === 1 ? "启用" : "禁用" }}
                    </el-tag>
                  </p>
                </div>
              </div>
              <div class="text-gray-400 text-xs">
                <p class="mb-1">创建时间: {{ item.created_at }}</p>
                <p class="mb-0">更新时间: {{ item.updated_at }}</p>
              </div>
            </div>
          </el-card>
        </div>
      </template>
    </div>
  </el-drawer>
</template>

<style scoped>
.permission-card :deep(.el-card__body) {
  padding: 15px;
}

.permission-list {
  max-height: calc(100vh - 150px);
  overflow-y: auto;
}
</style>
