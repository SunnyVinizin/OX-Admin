import { message } from "@/utils/message";
import { reactive, ref, onMounted } from "vue";
import { usePublicHooks } from "@/views/system/hooks";
import {
  getWorkflowList,
  deleteWorkflow,
  updateWorkflowStatus
} from "@/api/workflow";
import { ElMessageBox } from "element-plus";
import type { WorkflowFormData } from "./types";

export function useWorkflow() {
  const { tagStyle } = usePublicHooks();
  const loading = ref(true);
  const dataList = ref([]);

  const form = reactive({
    name: "",
    type: "",
    status: null
  });

  const pagination = reactive({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });

  const columns: TableColumnList = [
    {
      label: "流程名称",
      prop: "name",
      minWidth: 120
    },
    {
      label: "流程编码",
      prop: "code",
      minWidth: 120
    },
    {
      label: "流程类型",
      prop: "type",
      minWidth: 100,
      cellRenderer: ({ row }) => (
        <el-tag size="small" type="info">
          {row.type === "leave" ? "请假" :
            row.type === "overtime" ? "加班" :
              row.type === "business" ? "出差" : "报销"}
        </el-tag>
      )
    },
    {
      label: "状态",
      prop: "status",
      minWidth: 100,
      cellRenderer: ({ row }) => (
        <el-switch
          model-value={row.status === 1}
          active-text="启用"
          inactive-text="禁用"
          inline-prompt
          style={tagStyle.value(row.status)}
          onChange={() => handleStatusChange(row)}
        />
      )
    },
    {
      label: "创建时间",
      prop: "createdAt",
      minWidth: 160
    },
    {
      label: "操作",
      fixed: "right",
      width: 180,
      slot: "operation"
    }
  ];

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await getWorkflowList({
        page: pagination.currentPage,
        size: pagination.pageSize,
        ...form
      });
      dataList.value = data.items;
      pagination.total = data.total;
    } finally {
      loading.value = false;
    }
  }

  function resetForm() {
    form.name = "";
    form.type = "";
    form.status = null;
    onSearch();
  }

  async function handleStatusChange(row: WorkflowFormData) {
    const newStatus = row.status === 1 ? -1 : 1;
    try {
      await updateWorkflowStatus(row.id, newStatus);
      message(`状态更新成功`, { type: "success" });
      onSearch();
    } catch (error) {
      message(`状态更新失败`, { type: "error" });
    }
  }


  async function handleDelete(row: WorkflowFormData) {
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
    } catch { }
  }

  function handleSizeChange(val: number) {
    pagination.pageSize = val;
    onSearch();
  }

  function handleCurrentChange(val: number) {
    pagination.currentPage = val;
    onSearch();
  }

  onMounted(() => {
    onSearch();
  });

  return {
    form,
    loading,
    columns,
    dataList,
    pagination,
    onSearch,
    resetForm,
    handleDelete,
    handleSizeChange,
    handleCurrentChange
  };
}