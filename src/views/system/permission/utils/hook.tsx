import editForm from "../form.vue";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import { reactive, ref, onMounted, h } from "vue";
import type { FormItemProps } from "./types";
import {
  addPermission,
  deletePermission,
  permissionListQuery,
  updatePermission
} from "@/api/permission";
import { menuListQuery } from "@/api/menu";
import { ElMessageBox } from "element-plus";

export function usePermission() {
  const formRef = ref();
  const dataList = ref([]);
  const loading = ref(true);

  const form = reactive({
    permissionName: "",
    permissionKey: "",
    status: null
  });

  const pagination = reactive({
    total: 0,
    pageSize: 100,
    currentPage: 1,
    background: true
  });

  const columns: TableColumnList = [
    {
      label: "权限名称",
      prop: "permissionName",
      width: 180
    },
    {
      label: "权限标识",
      prop: "permissionKey",
      width: 250
    },
    {
      label: "关联菜单",
      prop: "menuTitle",
      align: "center"
    },
    {
      label: "状态",
      prop: "status",
      align: "center",
      width: 100,
      cellRenderer: ({ row }) => (
        <el-tag
          size="small"
          type={row.status === 1 ? "success" : "danger"}
          effect="plain"
        >
          {row.status === 1 ? "启用" : "禁用"}
        </el-tag>
      )
    },
    {
      label: "创建时间",
      prop: "createdAt",
      align: "center",
      width: 200
    },
    {
      label: "操作",
      fixed: "right",
      align: "center",
      width: 180,
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
    pagination.pageSize = 100;
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
      const res = await permissionListQuery({
        ...form,
        page: pagination.currentPage,
        pageSize: pagination.pageSize
      });
      dataList.value = res?.data?.list ?? [];
      pagination.total = res?.data?.total ?? 0;
    } finally {
      loading.value = false;
    }
  }

  async function getMenuOptions() {
    const res = await menuListQuery({
      page: 1,
      pageSize: 999
    });
    return res?.data?.list ?? [];
  }

  async function openDialog(title = "新增", row?: FormItemProps) {
    addDialog({
      title: `${title}权限`,
      props: {
        formInline: {
          id: row?.id ?? undefined,
          menuId: row?.menuId ?? undefined,
          menuOptions: await getMenuOptions(),
          permissionKey: row?.permissionKey ?? "",
          permissionName: row?.permissionName ?? "",
          status: row?.status ?? 1
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
              await addPermission(curData);
            } else {
              await updatePermission(curData);
            }
            message(`${title}成功`, { type: "success" });
            done(); // 关闭弹框
            onSearch(); // 刷新表格数据
          } catch (error) { }
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
        `确认要删除权限名称为【${row.permissionName}】的这条数据吗?`,
        "提示",
        {
          confirmButtonText: "确认",
          cancelButtonText: "取消",
          type: "warning"
        }
      );
      await deletePermission(row.id);
      message("删除成功", { type: "success" });
      onSearch();
    } catch (error) { }
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
    openDialog,
    handleDelete,
    handleSelectionChange,
    pagination,
    handleSizeChange,
    handleCurrentChange
  };
}
