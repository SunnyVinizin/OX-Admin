<script setup lang="ts">
import { ref, reactive, h, onMounted, nextTick } from "vue";
import { message } from "@/utils/message";
import { WorkflowType } from "./utils/types";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { workflowTypeOptions } from "./utils/enums";
import FlowDesigner from '@/views/engine/designer/index.vue';
import {
  getWorkflowList,
  addWorkflow,
  updateWorkflow,
  deleteWorkflow,
  updateWorkflowStatus,
  getWorkflowDetail
} from "@/api/workflow";
import { ElMessageBox } from "element-plus";
import { hasAuth } from "@/router/utils";
import { useFlowDesignerStore } from "@/store/modules/flowDesigner";

defineOptions({
  name: "EngineWorkFlow"
});

// refs
const formRef = ref();
const loading = ref(true);
const dataList = ref([]);
const dialogVisible = ref(false);
const dialogTitle = ref("新增工作流");
const currentRow = ref<any>(null);
const isEdit = ref(false)//是否为编辑模式
const drawerLoading = ref(false);
const designerRef = ref(); // 添加流程设计器ref

const form = reactive({
  name: "",
  type: "",
  status: 1
});

const pagination = reactive({
  total: 0,
  pageSize: 10,
  currentPage: 1,
  background: true
});

// 搜索
async function onSearch() {
  loading.value = true;
  try {
    const res: any = await getWorkflowList({
      page: pagination.currentPage,
      size: pagination.pageSize,
      ...form
    });
    dataList.value = res.data.list;
    pagination.total = res.data.total;
  } finally {
    loading.value = false;
  }
}

// 重置表单
function resetForm() {
  form.name = "";
  form.type = "";
  form.status = null;
  onSearch();
}

// 状态变更
async function handleStatusChange(row: any) {
  const newStatus = row.status === 1 ? -1 : 1;
  try {
    await updateWorkflowStatus(row.id, newStatus);
    message(`状态更新成功`, { type: "success" });
    onSearch();
  } catch (error) {
  }
}

// 打开弹窗
async function openDialog(title = "新增", row?: any) {
  dialogTitle.value = `${title}工作流`;
  drawerLoading.value = true;
  try {
    if (row) {
      isEdit.value = true;
      const res: any = await getWorkflowDetail(row.id);
      currentRow.value = res.data;
    } else {
      // 新增时重置所有数据
      isEdit.value = false;
      currentRow.value = null;
      // 重置 flowStore 数据
      const flowStore = useFlowDesignerStore();
      flowStore.clearAll();
      // 添加默认的开始节点
      flowStore.addNode({
        id: "start",
        type: "custom",
        data: {
          label: "开始",
          type: "start",
          orderNum: 1,
          config: {
            name: "",
            description: ""
          }
        },
        position: { x: 100, y: 100 },
        dragHandle: '.node-drag-handle'
      });

      // 确保设计器组件也被重置
      nextTick(() => {
        if (designerRef.value) {
          designerRef.value.workflowName = '';
          designerRef.value.workflowCode = '';
          designerRef.value.workflowDescription = '';
          designerRef.value.workflowType = 1; // 默认设置为请假类型
        }
      });
    }
  } catch { } finally {
    drawerLoading.value = false;
    dialogVisible.value = true;
  }
}

// 确认提交
async function handleSubmit() {
  if (!designerRef.value) return;

  try {
    const flowData = await designerRef.value.handleSave();
    if (!currentRow.value?.id) {
      await addWorkflow(flowData);
      message("新增成功", { type: "success" });
    } else {
      await updateWorkflow(currentRow.value.id, flowData);
      message("修改成功", { type: "success" });
    }
    dialogVisible.value = false;
    onSearch();
  } catch { }
}

// 删除
async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm(
      `确认要删除工作流【${row.name}】吗?`,
      "提示",
      {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning"
      }
    );
    await deleteWorkflow(row.id);
    message("删除成功", { type: "success" });
    onSearch();
  } catch (error) {
  }
}

// 分页大小变更
function handleSizeChange(val: number) {
  pagination.pageSize = val;
  onSearch();
}

// 当前页变更
function handleCurrentChange(val: number) {
  pagination.currentPage = val;
  onSearch();
}

// 初始化
onMounted(() => {
  onSearch();
});
</script>

<template>
  <div class="main h-full">
    <el-form ref="formRef" :inline="true" :model="form" class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]">
      <el-form-item label="流程名称：" prop="name">
        <el-input v-model="form.name" placeholder="请输入流程名称" clearable class="!w-[180px]" />
      </el-form-item>
      <el-form-item label="流程类型：" prop="type">
        <el-select v-model="form.type" placeholder="请选择流程类型" clearable class="!w-[180px]">
          <el-option v-for="item in workflowTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="useRenderIcon('ri:search-line')" :loading="loading" @click="onSearch">
          搜索
        </el-button>
        <el-button :icon="useRenderIcon('ri:refresh-line')" @click="resetForm()">
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <PureTableBar title="工作流列表" @refresh="onSearch">
      <template #buttons>
        <el-button v-if="hasAuth('engine:workflow:add')" type="primary" :icon="useRenderIcon('ri:add-circle-line')"
          @click="openDialog()">
          新增工作流
        </el-button>
      </template>
      <el-table v-loading="loading" :data="dataList" style="width: 100%">
        <el-table-column label="流程名称" prop="name" min-width="120" align="center" />
        <el-table-column label="流程编码" prop="code" min-width="120" align="center" />
        <el-table-column label="流程类型" prop="type" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="info">
              {{
                row.type === WorkflowType.LEAVE ? '请假' :
                  row.type === WorkflowType.OVERTIME ? '加班' :
                    row.type === WorkflowType.BUSINESS ? '外出' : '报销'
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="status" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" effect="plain" :type="row.status === 1 ? 'success' : 'danger'"
              @click="handleStatusChange(row)">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createdAt" min-width="160" align="center" />
        <el-table-column label="操作" fixed="right" width="180" align="center">
          <template #default="{ row }">
            <el-button v-if="hasAuth('engine:workflow:edit')" class="reset-margin" link type="primary"
              :icon="useRenderIcon('ri:edit-line')" @click="openDialog('修改', row)">
              修改
            </el-button>
            <el-button v-if="hasAuth('engine:workflow:delete')" class="reset-margin" link type="primary"
              :icon="useRenderIcon('ri:delete-bin-line')" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
        <template #empty>
          <div class="flex flex-col items-center justify-center py-10">
            <el-empty :image-size="180" description="暂无工作流" />
          </div>
        </template>
      </el-table>
      <!-- 分页组件 -->
      <div class="flex justify-end mt-4">
        <el-pagination v-model:current-page="pagination.currentPage" v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]" :background="pagination.background"
          layout="total, sizes, prev, pager, next, jumper" :total="pagination.total" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </PureTableBar>

    <el-drawer v-model="dialogVisible" :title="dialogTitle" size="95%" :close-on-click-modal="false" destroy-on-close
      class="workflow-drawer">
      <div class="h-full">
        <el-skeleton :loading="drawerLoading" animated :rows="10" :throttle="500">
          <template #default>
            <FlowDesigner ref="designerRef" :detail="currentRow" :isEdit="isEdit" class="h-full" />
          </template>
        </el-skeleton>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<style lang="scss" scoped>
.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}

.main {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.workflow-drawer) {
  .el-drawer__header {
    @apply mb-0 border-b;
    padding: 16px 20px;
    margin-right: 0;
  }

  .el-drawer__body {
    height: calc(100% - 120px);
    padding: 0;
    overflow: hidden;
  }

  .el-drawer__footer {
    @apply border-t py-3 px-4;
  }
}
</style>