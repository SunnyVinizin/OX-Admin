<script setup lang="ts">
import { ref } from "vue";
import { useOperationLog } from "./utils/hook";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { PureTableBar } from "@/components/RePureTableBar";
import ViewParams from "./components/ViewParams.vue";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import View from "@iconify-icons/ep/view";
import Delete from "@iconify-icons/ep/delete";

defineOptions({
  name: "SystemOperationLog"
});

const formRef = ref();
const tableRef = ref();
const detailDialogVisible = ref(false);
const detailParams = ref("");
const {
  form,
  loading,
  columns,
  dataList,
  onSearch,
  resetForm,
  onSelectionCancel,
  handleSelectionChange,
  handleDelete,
  selectedNum,
  pagination,
  handleRowDelete,
  handleSizeChange,
  handleCurrentChange
} = useOperationLog(tableRef);

function onFullscreen() {
  tableRef.value.setAdaptive();
}

function handleViewParams(row) {
  detailDialogVisible.value = true;
  detailParams.value = row.params;
}
</script>

<template>
  <div class="main">
    <el-form ref="formRef" :inline="true" :model="form" class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]">
      <el-form-item label="操作模块：" prop="module">
        <el-input v-model="form.module" placeholder="请输入操作模块" clearable class="!w-[180px]" />
      </el-form-item>
      <el-form-item label="操作状态：" prop="status">
        <el-select v-model="form.status" placeholder="请选择操作状态" clearable class="!w-[180px]">
          <el-option label="成功" :value="1" />
          <el-option label="失败" :value="-1" />
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

    <PureTableBar title="操作日志" :columns="columns" :tableRef="tableRef?.getTableRef()" @refresh="onSearch"
      @fullscreen="onFullscreen">
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
          <el-popconfirm title="是否确认删除?" @confirm="handleDelete">
            <template #reference>
              <el-button type="danger" text class="mr-1"> 批量删除 </el-button>
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
            <el-button class="reset-margin" link type="primary" :size="size" :icon="useRenderIcon(View)"
              @click="handleViewParams(row)">
              查看参数
            </el-button>
            <el-popconfirm :title="`是否确认删除这条数据`" @confirm="handleRowDelete(row)">
              <template #reference>
                <el-button class="reset-margin" link type="primary" :size="size" :icon="useRenderIcon(Delete)">
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </pure-table>
      </template>
    </PureTableBar>

    <el-dialog v-model="detailDialogVisible" title="查看参数" width="60%">
      <ViewParams :params="detailParams" />
    </el-dialog>
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

.view-params {
  padding: 20px;
}
</style>
