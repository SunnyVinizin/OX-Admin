import editForm from "../form.vue";
import { message } from "@/utils/message";
import { addDialog } from "@/components/ReDialog";
import { reactive, ref, onMounted, h } from "vue";
import { usePublicHooks } from "@/views/system/hooks";
import { deptTreeQuery } from "@/api/dept";
import type { FormItemProps } from "./types";
import {
  addPosition,
  deletePosition,
  positionListQuery,
  updatePosition
} from "@/api/position";

export function usePosition() {
  const { tagStyle } = usePublicHooks();
  const formRef = ref();
  const loading = ref(true);
  const dataList = ref([]);

  const form = reactive({
    keyword: "",
    deptId: null,
    status: null,
    deptOptions: []
  });

  const pagination = reactive({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });

  const columns: TableColumnList = [
    {
      label: "岗位名称",
      prop: "positionName",
      minWidth: 120
    },
    {
      label: "岗位编码",
      prop: "positionCode",
      minWidth: 120
    },
    {
      label: "所属部门",
      prop: "deptName",
      minWidth: 120
    },
    {
      label: "排序",
      prop: "rank",
      minWidth: 80
    },
    {
      label: "状态",
      prop: "status",
      minWidth: 100,
      cellRenderer: ({ row }) => (
        <el-tag size="small" style={tagStyle.value(row.status)}>
          {row.status === 1 ? "启用" : "停用"}
        </el-tag>
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
      width: 160,
      slot: "operation"
    }
  ];

  async function getDeptTree() {
    try {
      const res = await deptTreeQuery();
      if (res?.data?.departments) {
        form.deptOptions = res.data.departments;
      }
    } catch (error) {
      console.error("获取部门数据失败:", error);
    }
  }

  async function onSearch() {
    loading.value = true;
    try {
      const { data } = await positionListQuery({
        pageNum: pagination.currentPage,
        pageSize: pagination.pageSize,
        keyword: form.keyword,
        deptId: form.deptId,
        status: form.status
      });
      dataList.value = data.list;
      pagination.total = data.total;
    } finally {
      loading.value = false;
    }
  }

  function resetForm() {
    form.keyword = "";
    form.deptId = null;
    form.status = null;
    onSearch();
  }

  function openDialog(title: string, row?: Partial<FormItemProps>) {
    addDialog({
      title: `${title}岗位`,
      props: {
        formInline: {
          ...row,
          deptOptions: form.deptOptions
        }
      },
      width: "686px",
      draggable: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef }),
      beforeSure: async (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;

        async function chores() {
          try {
            if (title === "新增") {
              await addPosition(curData);
            } else {
              await updatePosition(curData);
            }
            message(`${title}成功`, { type: "success" });
            done();
            onSearch();
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

  async function handleDelete(row: FormItemProps) {
    try {
      await deletePosition(row.id);
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

  function handleSelectionChange(val) {
    console.log("选中的数据", val);
  }

  onMounted(() => {
    getDeptTree();
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
    openDialog,
    handleDelete,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange
  };
} 