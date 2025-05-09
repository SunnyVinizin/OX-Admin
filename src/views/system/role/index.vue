<!-- src/views/system/role/index.vue -->
<script setup lang="ts">
import { ref } from "vue";
import { useRole } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

import Delete from "@iconify-icons/ep/delete";
import EditPen from "@iconify-icons/ep/edit-pen";
import Refresh from "@iconify-icons/ep/refresh";
import AddFill from "@iconify-icons/ri/add-circle-line";
import Menu from "@iconify-icons/ep/menu";
import Lock from "@iconify-icons/ep/lock";
import { hasAuth } from "@/router/utils";

defineOptions({
  name: "SystemRole"
});

const formRef = ref();
const tableRef = ref();

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
  handleMenuPermission,
  handlePermission,
  handleSizeChange,
  handleCurrentChange,
  handleSelectionChange
} = useRole();
</script>

<template>
  <div class="main">
    <el-form ref="formRef" :inline="true" :model="form" class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]">
      <el-form-item label="角色名称：" prop="roleName">
        <el-input v-model="form.roleName" placeholder="请输入角色名称" clearable class="!w-[180px]" />
      </el-form-item>
      <el-form-item label="角色标识：" prop="roleKey">
        <el-input v-model="form.roleKey" placeholder="请输入角色标识" clearable class="!w-[180px]" />
      </el-form-item>
      <el-form-item label="状态：" prop="status">
        <el-select v-model="form.status" placeholder="请选择状态" clearable class="!w-[180px]">
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
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

    <PureTableBar title="角色管理" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button v-if="hasAuth('system:role:add')" type="primary" :icon="useRenderIcon(AddFill)"
          @click="openDialog()">
          新增角色
        </el-button>
      </template>
      <template v-slot="{ size, dynamicColumns }">
        <pure-table ref="tableRef" adaptive :data="dataList" :columns="dynamicColumns" :loading="loading" :size="size"
          :pagination="pagination" @selection-change="handleSelectionChange" @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange">
          <template #operation="{ row }">
            <el-button v-if="hasAuth('system:role:edit')" class="reset-margin" link type="primary" :size="size"
              :icon="useRenderIcon(EditPen)" @click="openDialog('修改', row)">
              修改
            </el-button>
            <el-button v-if="hasAuth('system:role:menu')" class="reset-margin" link type="primary" :size="size"
              :icon="useRenderIcon(Menu)" @click="handleMenuPermission(row)">
              菜单权限
            </el-button>
            <el-button v-if="hasAuth('system:role:data')" class="reset-margin" link type="primary" :size="size"
              :icon="useRenderIcon(Lock)" @click="handlePermission(row)">
              数据权限
            </el-button>
            <el-popconfirm :title="`是否确认删除角色名称为${row.roleName}的这条数据`" @confirm="handleDelete(row)">
              <template #reference>
                <el-button v-if="hasAuth('system:role:delete')" class="reset-margin" link type="primary" :size="size"
                  :icon="useRenderIcon(Delete)">
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
          <template #empty>
            <div class="flex flex-col items-center justify-center py-10">
              <el-empty :image-size="180" description="暂无角色" />
            </div>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
  </div>
</template>

<style lang="scss" scoped>
.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>
