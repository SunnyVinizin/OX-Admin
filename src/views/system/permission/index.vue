<script setup lang="ts">
import { computed, ref } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

import Delete from "@iconify-icons/ep/delete";
import EditPen from "@iconify-icons/ep/edit-pen";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import AddFill from "@iconify-icons/ri/add-circle-line";
import Folder from "@iconify-icons/ep/folder";
import { usePermission } from "./utils/hook";

defineOptions({
  name: "SystemPermission"
});

const formRef = ref();
const {
  form,
  loading,
  columns,
  dataList,
  pagination,
  onSearch,
  resetForm,
  openDialog,
  handleDelete,
  handleSizeChange,
  handleCurrentChange
} = usePermission();

const groupedPermissions = computed(() => {
  return dataList.value.reduce(
    (acc, curr) => {
      if (!acc[curr.menuTitle]) {
        acc[curr.menuTitle] = [];
      }
      acc[curr.menuTitle].push(curr);
      return acc;
    },
    {} as Record<string, any[]>
  );
});
</script>

<template>
  <div class="main">
    <el-form ref="formRef" :inline="true" :model="form" class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]">
      <el-form-item label="权限名称:" prop="permissionName">
        <el-input v-model="form.permissionName" placeholder="请输入权限名称" clearable @keyup.enter="onSearch" />
      </el-form-item>
      <el-form-item label="权限标识:" prop="permissionKey">
        <el-input v-model="form.permissionKey" placeholder="请输入权限标识" clearable @keyup.enter="onSearch" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="useRenderIcon(Search)" @click="onSearch">
          搜索
        </el-button>
        <el-button :icon="useRenderIcon(Refresh)" @click="resetForm(formRef)">
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <PureTableBar title="权限管理" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button type="primary" :icon="useRenderIcon(AddFill)" @click="openDialog()">
          新增权限
        </el-button>
      </template>
      <template v-slot="{}">
        <div v-loading="loading" class="permission-list">
          <el-empty v-if="!dataList.length" description="暂无数据" />
          <el-collapse v-else accordion>
            <el-collapse-item v-for="(group, menuTitle) in groupedPermissions" :key="menuTitle">
              <template #title>
                <div class="flex items-center">
                  <el-icon class="mr-2">
                    <component :is="useRenderIcon(Folder)" />
                  </el-icon>
                  <span>{{ menuTitle }}</span>
                  <el-tag class="ml-2" size="small" type="info">
                    {{ group.length }}个权限
                  </el-tag>
                </div>
              </template>

              <div class="permission-grid">
                <el-card v-for="item in group" :key="item.id" class="permission-item" shadow="hover">
                  <template #header>
                    <div class="flex items-center justify-between">
                      <span class="font-bold">{{ item.permissionName }}</span>
                      <div class="flex gap-2">
                        <el-button link type="primary" :icon="useRenderIcon(EditPen)"
                          @click.stop="openDialog('修改', item)">
                          修改
                        </el-button>
                        <el-popconfirm :title="`是否确认删除权限【${item.permissionName}】?`" @confirm="handleDelete(item)">
                          <template #reference>
                            <el-button link type="danger" :icon="useRenderIcon(Delete)">
                              删除
                            </el-button>
                          </template>
                        </el-popconfirm>
                      </div>
                    </div>
                  </template>

                  <div class="permission-content">
                    <div class="mb-2">
                      <span class="text-gray-500">权限标识：</span>
                      <el-tag size="small">{{ item.permissionKey }}</el-tag>
                    </div>
                    <div class="flex justify-between items-center">
                      <div>
                        <span class="text-gray-500">状态：</span>
                        <el-tag :type="item.status === 1 ? 'success' : 'danger'" size="small">
                          {{ item.status === 1 ? "启用" : "禁用" }}
                        </el-tag>
                      </div>
                      <div class="text-gray-400 text-sm">
                        {{ item.updatedAt }}
                      </div>
                    </div>
                  </div>
                </el-card>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </template>
      <template #empty>
        <div class="flex flex-col items-center justify-center py-10">
          <el-empty :image-size="180" description="暂无权限" />
        </div>
      </template>
    </PureTableBar>

    <el-pagination v-model:current-page="pagination.currentPage" v-model:page-size="pagination.pageSize"
      class="float-right mt-4" :total="pagination.total" :page-sizes="[10, 20, 50, 100]" small background
      layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
      @current-change="handleCurrentChange" />
  </div>
</template>

<style lang="scss" scoped>
.permission-list {
  margin: 16px;

  .permission-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
    padding: 16px;
  }

  .permission-item {
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
    }

    :deep(.el-card__header) {
      padding: 12px;
    }

    .permission-content {
      font-size: 14px;
    }
  }
}

:deep(.el-collapse-item__header) {
  font-size: 16px;
  font-weight: bold;
}

:deep(.el-collapse) {
  border: none;

  .el-collapse-item__wrap {
    background-color: var(--el-bg-color);
  }
}
</style>
