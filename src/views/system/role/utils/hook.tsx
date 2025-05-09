// src/views/system/role/utils/hook.tsx
import editForm from "../form.vue";
import menuForm from "../menu.vue";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import { reactive, ref, onMounted, h } from "vue";
import type { FormItemProps } from "./types";
import {
  addRole,
  deleteRole,
  getMenuPermissionTree,
  getRoleMenu,
  getRolePermissions,
  roleListQuery,
  updateRole,
  updateRoleMenu,
  updateRolePermissions
} from "@/api/role";
import { menuListQuery } from "@/api/menu";
import { handleTree } from "@/utils/tree";
import permissionForm from "../permission.vue";
import { deptTreeQuery } from "@/api/dept";

export function useRole() {
  const formRef = ref();
  const loading = ref(true);
  const dataList = ref([]);
  const menuOptions = ref([]);

  const form = reactive({
    roleName: "",
    roleKey: "",
    status: null
  });

  const pagination = reactive({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });

  async function getMenuOptions() {
    const menuRes: any = await menuListQuery({
      page: 1,
      pageSize: 999
    });

    menuOptions.value = handleTree(menuRes?.data?.list || []);
  }

  const columns: TableColumnList = [
    {
      label: "角色名称",
      prop: "roleName",
      minWidth: 120,
      align: "center"
    },
    {
      label: "角色标识",
      prop: "roleKey",
      minWidth: 120,
      align: "center"
    },
    {
      label: "状态",
      prop: "status",
      align: "center",
      minWidth: 100,
      cellRenderer: ({ row }) => (
        <el-tag type={row.status === 1 ? "success" : "danger"} size="small">
          {row.status === 1 ? "启用" : "停用"}
        </el-tag>
      )
    },
    {
      label: "创建时间",
      prop: "createdAt",
      align: "center",
      minWidth: 180
    },
    {
      label: "备注",
      align: "left",
      prop: "remark",
      minWidth: 180
    },
    {
      label: "操作",
      align: "center",
      fixed: "right",
      width: 350,
      slot: "operation"
    }
  ];

  async function onSearch() {
    loading.value = true;
    const res = await roleListQuery({
      ...form,
      page: pagination.currentPage,
      pageSize: pagination.pageSize
    });
    dataList.value = res.data.list;
    pagination.total = res.data.total;
    loading.value = false;
  }

  function resetForm(formEl) {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  }

  async function openDialog(title = "新增", row?: FormItemProps) {
    // 获取部门树数据
    const deptTree: any = await deptTreeQuery();

    addDialog({
      title: `${title}角色`,
      props: {
        formInline: {
          roleName: row?.roleName ?? "",
          roleKey: row?.roleKey ?? "",
          status: row?.status ?? 1,
          remark: row?.remark ?? "",
          menuIds: row?.menuIds ?? [],
          dataScope: row?.dataScope ?? 1,
          deptIds: row?.deptIds ?? [],
          deptOptions: deptTree?.data?.departments ?? []
        }
      },
      width: "686px",
      draggable: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef, formInline: null }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;

        console.log("curData", curData);

        FormRef.validate(async valid => {
          if (valid) {
            if (title === "新增") {
              await addRole(curData);
            } else {
              await updateRole({
                ...curData,
                id: row.id
              });
            }
            message(`${title}成功`, { type: "success" });
            done(); // 关闭弹框
            onSearch(); // 刷新表格数据
          }
        });
      }
    });
  }

  async function handleMenuPermission(row) {
    // 获取角色当前拥有的菜单数据，便于回显表单中的菜单勾选
    const roleMenuRes: any = await getRoleMenu(row.id);

    const menuFormRef = ref();

    addDialog({
      title: "分配权限",
      props: {
        id: row.id,
        roleName: row.roleName,
        menuIds: roleMenuRes?.data || [],
        menuOptions: menuOptions.value
      },
      width: "686px",
      draggable: true,
      closeOnClickModal: false,
      contentRenderer: () => h(menuForm, { ref: menuFormRef } as any),
      beforeSure: async (done, { options }) => {
        const menuIds = menuFormRef.value?.getMenuIds() || [];

        await updateRoleMenu({
          id: options.props.id,
          menuIds: menuIds
        });

        message("分配权限成功", { type: "success" });
        done();
        onSearch();
      }
    });
  }

  /** 打开权限分配弹窗 */
  async function handlePermission(row) {
    try {
      // 获取菜单-权限树
      const res: any = await getMenuPermissionTree();
      // 获取角色已有的权限ID列表
      const rolePermissionRes: any = await getRolePermissions(row.id);
      const permissionFormRef = ref();

      addDialog({
        title: "分配权限",
        props: {
          id: row.id,
          roleName: row.roleName,
          permissionIds: rolePermissionRes?.data || [],
          treeData: res.data
        },
        width: "600px",
        draggable: true,
        closeOnClickModal: false,
        contentRenderer: () =>
          h(permissionForm, {
            ref: permissionFormRef,
            roleName: row.roleName,
            permissionIds: rolePermissionRes?.data || [],
            treeData: res.data,
            id: row.id
          }),
        beforeSure: async done => {
          const permissionIds = permissionFormRef.value?.getPermissionIds();

          try {
            await updateRolePermissions({
              id: row.id,
              permissionIds
            });
            message("分配权限成功", { type: "success" });
            done();
            onSearch();
          } catch (error) { }
        }
      });
    } catch (error) { }
  }

  async function handleDelete(row) {
    await deleteRole(row.id);
    message("删除成功", { type: "success" });
    onSearch();
  }

  function handleSizeChange(val: number) {
    pagination.pageSize = val;
    onSearch();
  }

  function handleCurrentChange(val: number) {
    pagination.currentPage = val;
    onSearch();
  }

  function handleSelectionChange(val) {
    console.log("选中的数据", val);
  }

  onMounted(() => {
    onSearch();
    getMenuOptions();
  });

  return {
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
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange,
    handlePermission
  };
}
