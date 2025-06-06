<script setup lang="ts">
import { computed, ref } from "vue";
import tree from "./tree.vue";
import { useUser } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

import Upload from "@iconify-icons/ri/upload-line";
import Role from "@iconify-icons/ri/admin-line";
import Password from "@iconify-icons/ri/lock-password-line";
import More from "@iconify-icons/ep/more-filled";
import Delete from "@iconify-icons/ep/delete";
import EditPen from "@iconify-icons/ep/edit-pen";
import Refresh from "@iconify-icons/ep/refresh";
import AddFill from "@iconify-icons/ri/add-circle-line";
import { hasAuth } from "@/router/utils";
defineOptions({
  name: "SystemUser"
});

const treeRef = ref();
const formRef = ref();
const tableRef = ref();

const {
  form,
  loading,
  columns,
  dataList,
  treeData,
  treeLoading,
  selectedNum,
  pagination,
  buttonClass,
  deviceDetection,
  onSearch,
  resetForm,
  onbatchDel,
  openDialog,
  onTreeSelect,
  handleUpdate,
  handleDelete,
  handleUpload,
  handleReset,
  handleRole,
  handleSizeChange,
  onSelectionCancel,
  handleCurrentChange,
  handleSelectionChange
} = useUser(tableRef, treeRef);

// // 获取用户角色并判断是否包含admin
// const userRoles = computed(() => {
//   return useUserStoreHook()?.roles
// });

// // 判断是否包含admin角色
// const hasAdminRole = computed(() => {
//   return userRoles.value?.includes("admin") ?? false;
// });
</script>

<template>
  <div :class="['flex', 'justify-between', deviceDetection() && 'flex-wrap']">
    <tree ref="treeRef" :class="['mr-2', deviceDetection() ? 'w-full' : 'min-w-[260px]']" :treeData="treeData"
      :treeLoading="treeLoading" @tree-select="onTreeSelect" />
    <div :class="[deviceDetection() ? ['w-full', 'mt-2'] : 'w-[calc(100%-260px)]']">
      <el-form ref="formRef" :inline="true" :model="form"
        class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px] overflow-auto">
        <el-form-item label="用户名称：" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名称" clearable class="!w-[180px]" />
        </el-form-item>
        <el-form-item label="用户昵称：" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入用户昵称" clearable class="!w-[180px]" />
        </el-form-item>
        <el-form-item label="手机号码：" prop="mobile">
          <el-input v-model="form.mobile" placeholder="请输入手机号码" clearable class="!w-[180px]" />
        </el-form-item>
        <el-form-item label="状态：" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">已启用</el-radio>
            <el-radio :label="0">已停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="useRenderIcon('ri:search-line')" :loading="loading" @click="onSearch">
            搜索
          </el-button>
          <el-button :icon="useRenderIcon(Refresh)" @click="resetForm(formRef)">
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <PureTableBar title="用户管理" :columns="columns" @refresh="onSearch">
        <template #buttons>
          <el-button v-if="hasAuth('system:user:add')" type="primary" :icon="useRenderIcon(AddFill)"
            @click="openDialog()">
            新增用户
          </el-button>
        </template>
        <template v-slot="{ size, dynamicColumns }">
          <div v-if="selectedNum > 0" v-motion-fade
            class="bg-[var(--el-fill-color-light)] w-full h-[46px] mb-2 pl-4 flex items-center">
            <div class="flex-auto">
              <span style="font-size: var(--el-font-size-base)"
                class="text-[rgba(42,46,54,0.5)] dark:text-[rgba(220,220,242,0.5)]">
                已选 {{ selectedNum }} 项
              </span>
              <el-button type="primary" text @click="onSelectionCancel">
                取消选择
              </el-button>
            </div>
            <el-popconfirm title="是否确认删除?" @confirm="onbatchDel">
              <template #reference>
                <el-button type="danger" text class="mr-1">
                  批量删除
                </el-button>
              </template>
            </el-popconfirm>
          </div>
          <pure-table ref="tableRef" row-key="id" adaptive :adaptiveConfig="{ offsetBottom: 108 }" align-whole="center"
            table-layout="auto" :loading="loading" :size="size" :data="dataList" :columns="dynamicColumns"
            :pagination="{ ...pagination, size }" :header-cell-style="{
              background: 'var(--el-fill-color-light)',
              color: 'var(--el-text-color-primary)'
            }" @selection-change="handleSelectionChange" @page-size-change="handleSizeChange"
            @page-current-change="handleCurrentChange">
            <template #operation="{ row }">
              <el-button v-if="hasAuth('system:user:edit')" class="reset-margin" link type="primary" :size="size"
                :icon="useRenderIcon(EditPen)" @click="openDialog('修改', row)">
                修改
              </el-button>
              <el-popconfirm :title="`是否确认删除用户编号为${row.id}的这条数据`" @confirm="handleDelete(row)">
                <template #reference>
                  <el-button v-if="hasAuth('system:user:delete')" class="reset-margin" link type="primary" :size="size"
                    :icon="useRenderIcon(Delete)">
                    删除
                  </el-button>
                </template>
              </el-popconfirm>
              <el-dropdown>
                <el-button class="ml-3 mt-[2px]" link type="primary" :size="size" :icon="useRenderIcon(More)"
                  @click="handleUpdate(row)" />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item>
                      <el-button v-if="hasAuth('system:user:upload')" :class="buttonClass" link type="primary"
                        :size="size" :icon="useRenderIcon(Upload)" @click="handleUpload(row)">
                        上传头像
                      </el-button>
                    </el-dropdown-item>
                    <el-dropdown-item>
                      <el-button v-if="hasAuth('system:user:reset')" :class="buttonClass" link type="primary"
                        :size="size" :icon="useRenderIcon(Password)" @click="handleReset(row)">
                        重置密码
                      </el-button>
                    </el-dropdown-item>
                    <el-dropdown-item>
                      <el-button v-if="hasAuth('system:user:role')" :class="buttonClass" link type="primary"
                        :size="size" :icon="useRenderIcon(Role)" @click="handleRole(row)">
                        分配角色
                      </el-button>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
            <template #empty>
              <div class="flex flex-col items-center justify-center py-10">
                <el-empty :image-size="180" description="暂无用户" />
              </div>
            </template>
          </pure-table>
        </template>
      </PureTableBar>
    </div>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}

:deep(.el-button:focus-visible) {
  outline: none;
}

.main-content {
  margin: 24px 24px 0 !important;
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>
