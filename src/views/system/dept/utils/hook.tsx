import editForm from "../form.vue";
import { message } from "@/utils/message";
import { handleTree } from "@/utils/tree";
import { addDialog } from "@/components/ReDialog";
import { reactive, ref, onMounted, h } from "vue";
import type { FormItemProps } from "./types";
import { usePublicHooks } from "@/views/system/hooks";
import { addDept, deleteDept, deptListQuery, updateDept } from "@/api/dept";
import { ElMessageBox } from "element-plus";
import { cloneDeep } from "@pureadmin/utils";

export function useDepartment() {
  const { tagStyle } = usePublicHooks();
  const formRef = ref();
  const dataList = ref([]);
  const loading = ref(true);
  const total = ref(0);

  const form = reactive({
    deptName: "",
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
      label: "部门名称",
      prop: "deptName",
      width: 180,
      align: "left"
    },
    {
      label: "部门编码",
      prop: "deptCode",
      align: "center",
      width: 180
    },
    {
      label: "负责人",
      align: "left",
      prop: "leader"
    },
    {
      label: "联系电话",
      align: "left",
      prop: "leaderMobile"
    },
    {
      label: "邮箱",
      align: "left",
      prop: "leaderEmail"
    },
    {
      label: "排序",
      prop: "rank",
      align: "center",
      width: 80
    },
    {
      label: "状态",
      prop: "status",
      align: "center",
      width: 100,
      cellRenderer: ({ row }) => (
        <el-tag style={tagStyle.value(row.status)}>
          {row.status === 1 ? "启用" : "禁用"}
        </el-tag>
      )
    },
    {
      label: "创建时间",
      prop: "createdAt",
      align: "center",
      width: 180
    },
    {
      label: "操作",
      align: "center",
      fixed: "right",
      width: 200,
      slot: "operation"
    }
  ];

  function handleSelectionChange(val) {
    console.log("handleSelectionChange", val);
  }

  function resetForm(formEl) {
    if (!formEl) return;
    formEl.resetFields();
    pagination.currentPage = 1;
    pagination.pageSize = 10;
    onSearch();
  }

  function handleSizeChange(val) {
    pagination.pageSize = val;
    onSearch();
  }

  function handleCurrentChange(val) {
    pagination.currentPage = val;
    onSearch();
  }

  async function onSearch() {
    loading.value = true;
    try {
      const res = await deptListQuery({
        ...form,
        page: pagination.currentPage,
        pageSize: pagination.pageSize
      });
      dataList.value = handleTree(res?.data?.list ?? []); // 处理成树结构
      pagination.total = res?.data?.total ?? 0;
    } finally {
      loading.value = false;
    }
  }

  function formatHigherDeptOptions(treeList) {
    if (!treeList || !treeList.length) return;
    const newTreeList = [];
    for (let i = 0; i < treeList.length; i++) {
      treeList[i].title = treeList[i].deptName;
      formatHigherDeptOptions(treeList[i].children);
      newTreeList.push(treeList[i]);
    }
    return newTreeList;
  }

  function openDialog(title = "新增", row?: FormItemProps) {
    addDialog({
      title: `${title}部门`,
      props: {
        formInline: {
          id: row?.id ?? undefined,
          parentId: row?.parentId ?? 0,
          higherDeptOptions: formatHigherDeptOptions(cloneDeep(dataList.value)),
          deptName: row?.deptName ?? "",
          deptCode: row?.deptCode ?? "",
          leader: row?.leader ?? "",
          leaderMobile: row?.leaderMobile ?? "",
          leaderEmail: row?.leaderEmail ?? "",
          rank: row?.rank ?? 99,
          status: row?.status ?? 1,
          remark: row?.remark ?? ""
        }
      },
      width: "686px",
      draggable: true,
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef }),
      beforeSure: async (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;

        async function chores() {
          try {
            if (title === "新增") {
              await addDept(curData);
            } else {
              await updateDept(curData);
            }
            message(`${title}成功`, { type: "success" });
            done(); // 关闭弹框
            onSearch(); // 刷新表格数据
          } catch (error) {
            message(`${title}失败`, { type: "error" });
          }
        }

        FormRef.validate(valid => {
          if (valid) {
            chores();
          }
        });
      }
    });
  }

  async function handleDelete(row) {
    try {
      await ElMessageBox.confirm(
        `确认要删除部门名称为【${row.deptName}】的这条数据吗?`,
        "提示",
        {
          confirmButtonText: "确认",
          cancelButtonText: "取消",
          type: "warning"
        }
      );
      await deleteDept(row.id);
      message("删除成功", { type: "success" });
      onSearch();
    } catch { }
  }

  onMounted(() => {
    onSearch();
  });

  return {
    form,
    loading,
    columns,
    dataList,
    total,
    onSearch,
    resetForm,
    openDialog,
    handleDelete,
    handleSelectionChange,
    pagination,
    handleSizeChange,
    handleCurrentChange
  };
}
