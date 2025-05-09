import { reactive, ref, onMounted, type Ref } from "vue";
import { usePublicHooks } from "@/views/system/hooks";
import { message } from "@/utils/message";
import type { PaginationProps } from "@pureadmin/table";
import { deleteLoginLog, logsLoginListQuery } from "@/api/logLogin";

export function useLoginLog(tableRef: Ref) {
  const { tagStyle } = usePublicHooks();
  const dataList = ref([]);
  const loading = ref(true);

  const form = reactive({
    username: "",
    status: null
  });

  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });

  const selectedNum = ref(0);

  const columns: TableColumnList = [
    {
      type: "selection",
      width: 55,
      align: "left",
      fixed: "left"
    },
    {
      label: "用户名",
      prop: "user.username",
      width: 120
    },
    {
      label: "电话",
      prop: "user.mobile",
      width: 120
    },
    {
      label: "浏览器",
      prop: "browser",
      width: 200,
      showOverflowTooltip: true
    },
    {
      label: "状态",
      prop: "status",
      width: 100,
      cellRenderer: ({ row }) => (
        <el-tag style={tagStyle.value(row.status)}>
          {row.status === 1 ? "成功" : "失败"}
        </el-tag>
      )
    },
    {
      label: "登录结果",
      prop: "msg",
      width: 150,
      showOverflowTooltip: true
    },
    {
      label: "操作系统",
      prop: "os",
      width: 150
    },
    {
      label: "IP地址",
      prop: "ip",
      width: 150
    },
    {
      label: "地理位置",
      prop: "location",
      width: 150
    },
    {
      label: "操作时间",
      prop: "createdAt",
      width: 180
    },
    {
      label: "操作",
      fixed: "right",
      slot: "operation"
    }
  ];

  function handleSizeChange(val: number) {
    pagination.pageSize = val;
    onSearch();
  }

  function handleCurrentChange(val: number) {
    pagination.currentPage = val;
    onSearch();
  }

  /** 当CheckBox选择项发生变化时会触发该事件 */
  function handleSelectionChange(val) {
    selectedNum.value = val.length;
    // 重置表格高度
    tableRef.value.setAdaptive();
  }

  /** 取消选择 */
  function onSelectionCancel() {
    selectedNum.value = 0;
    // 用于多选表格，清空用户的选择
    tableRef.value.getTableRef().clearSelection();
  }

  async function handleDelete() {
    const ids = tableRef.value
      .getTableRef()
      .getSelectionRows()
      .map(item => item.id);
    console.log("ids", ids);
    // 调用接口删除
    await deleteLoginLog(ids);
    message("删除成功", {
      type: "success"
    });
    tableRef.value.getTableRef().clearSelection();
    onSearch();
  }

  function handleRowDelete(row) {
    console.log("handleRowDelete", row);
  }

  function resetForm(formEl) {
    if (!formEl) return;
    formEl.resetFields();
    pagination.currentPage = 1;
    pagination.pageSize = 10;
    onSearch();
  }

  async function onSearch() {
    loading.value = true;
    try {
      const res = await logsLoginListQuery({
        ...form,
        page: pagination.currentPage,
        pageSize: pagination.pageSize
      });
      dataList.value = res?.data?.list ?? [];
      pagination.total = res.data.total;
    } finally {
      loading.value = false;
    }
  }

  onMounted(() => {
    onSearch();
  });

  return {
    form,
    loading,
    columns,
    dataList,
    onSearch,
    resetForm,
    handleSelectionChange,
    onSelectionCancel,
    handleDelete,
    selectedNum,
    pagination,
    handleRowDelete,
    handleSizeChange,
    handleCurrentChange
  };
}
