<script setup lang="ts">
import { ref } from "vue";
import { useDepartment } from "./utils/hook";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { PureTableBar } from "@/components/RePureTableBar";

import Delete from "@iconify-icons/ep/delete";
import EditPen from "@iconify-icons/ep/edit-pen";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import AddFill from "@iconify-icons/ri/add-circle-line";

defineOptions({
  name: "SystemDepartment"
});

const formRef = ref();
const tableRef = ref();
const {
  form,
  loading,
  columns,
  dataList,
  onSearch,
  resetForm,
  openDialog,
  handleDelete,
  handleSelectionChange,
  pagination,
  handleSizeChange,
  handleCurrentChange
} = useDepartment();

function onFullscreen() {
  tableRef.value.setAdaptive();
}
</script>

<template>
  <div class="main">
    <el-form ref="formRef" :inline="true" :model="form" class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]">
      <el-form-item label="部门名称：" prop="deptName">
        <el-input v-model="form.deptName" placeholder="请输入部门名称" clearable class="!w-[180px]" />
      </el-form-item>
      <el-form-item label="状态：" prop="status">
        <el-select v-model="form.status" placeholder="请选择状态" clearable class="!w-[180px]">
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="useRenderIcon(Search)" :loading="loading" @click="onSearch">
          搜索
        </el-button>
        <el-button :icon="useRenderIcon(Refresh)" @click="resetForm(formRef)">
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <PureTableBar title="部门管理" :columns="columns" :tableRef="tableRef?.getTableRef()" @refresh="onSearch"
      @fullscreen="onFullscreen">
      <template #buttons>
        <el-button type="primary" :icon="useRenderIcon(AddFill)" @click="openDialog()">
          新增部门
        </el-button>
      </template>
      <template v-slot="{ size, dynamicColumns }">
        <pure-table ref="tableRef" adaptive row-key="id" :loading="loading" :size="size" :data="dataList"
          :columns="dynamicColumns" :header-cell-style="{
            background: 'var(--el-fill-color-light)',
            color: 'var(--el-text-color-primary)'
          }" @selection-change="handleSelectionChange">
          <template #operation="{ row }">
            <el-button class="reset-margin" link type="primary" :size="size" :icon="useRenderIcon(EditPen)"
              @click="openDialog('修改', row)">
              修改
            </el-button>
            <el-button class="reset-margin" link type="primary" :size="size" :icon="useRenderIcon(AddFill)"
              @click="openDialog('新增', { parentId: row.id } as any)">
              新增
            </el-button>
            <el-button class="reset-margin" link type="primary" :size="size" :icon="useRenderIcon(Delete)"
              @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </pure-table>
      </template>
      <template #empty>
        <div class="flex flex-col items-center justify-center py-10">
          <el-empty :image-size="180" description="暂无部门" />
        </div>
      </template>
    </PureTableBar>

    <el-pagination v-model:current-page="pagination.currentPage" v-model:page-size="pagination.pageSize"
      class="float-right mt-4" :total="pagination.total" :page-sizes="[10, 20, 50, 100]" size="default" background
      layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
      @current-change="handleCurrentChange" />
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-table__inner-wrapper::before) {
  height: 0;
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>
