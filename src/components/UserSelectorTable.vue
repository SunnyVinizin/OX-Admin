<template>
  <el-dialog v-model="visible" title="选择审批人" width="70%" destroy-on-close>
    <!-- 搜索表单 -->
    <el-form :inline="true" :model="queryParams" @submit.prevent>
      <el-form-item label="关键词">
        <el-input v-model="queryParams.keyword" placeholder="用户名/昵称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="部门">
        <el-cascader v-model="queryParams.deptId" class="w-full" :options="deptOptions" :props="{
          value: 'id',
          label: 'deptName',
          emitPath: false,
          checkStrictly: true
        }" clearable filterable placeholder="请选择部门">
          <template #default="{ node, data }">
            <span>{{ data.deptName }}</span>
            <span v-if="!node.isLeaf">
              ({{ data.children?.length ?? 0 }})
            </span>
          </template>
        </el-cascader>
      </el-form-item>
      <el-form-item label="角色">
        <el-select v-model="queryParams.roleId" style="width:200px;" placeholder="请选择角色" clearable>
          <el-option v-for="role in roleOptions" :key="role.id" :label="role.roleName" :value="role.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 用户表格 -->
    <el-table v-loading="loading" :data="userList" border stripe @selection-change="handleSelectionChange"
      @row-dblclick="handleRowDblClick">
      <!-- 多选模式显示复选框 -->
      <el-table-column v-if="multiple" type="selection" width="55" />
      <!-- 单选模式显示高亮选中行 -->
      <el-table-column v-else width="100" align="center">
        <template #default="{}">
          <el-button type="text">
            双击选择
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="用户名" prop="username" />
      <el-table-column label="姓名" prop="nickname" />
      <el-table-column label="部门" prop="departmentName" />
      <el-table-column label="岗位" prop="positionName" />
    </el-table>

    <!-- 分页 -->
    <div class="mt-4 text-right">
      <el-pagination v-model:current-page="queryParams.page" v-model:page-size="queryParams.pageSize" :total="total"
        :page-sizes="[10, 20, 30, 50]" size="small" background layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from "vue";
import { getUserSelector } from "@/api/user";

const props = withDefaults(defineProps<{
  modelValue: boolean;
  deptOptions: any[];
  roleOptions: any[];
  multiple?: boolean;  // 多选模式
}>(), {
  modelValue: false,
  deptOptions: () => [],
  roleOptions: () => [],
  multiple: true
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "confirm", users: any[]): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
});

// 查询参数
const queryParams = reactive({
  keyword: "",
  deptId: undefined as number | undefined,
  roleId: undefined as number | undefined,
  page: 1,
  pageSize: 10
});

const loading = ref(false);
const total = ref(0);
const userList = ref<any[]>([]);

// 选中的用户
const selectedUsers = ref<any[]>([]);

// 判断行是否被选中（单选模式使用）
const isSelected = (row: any) => {
  return selectedUsers.value.some(user => user.id === row.id);
};

// 处理双击行事件（单选模式）
const handleRowDblClick = (row: any) => {
  if (!props.multiple) {
    selectedUsers.value = [row];
    handleConfirm();  // 双击直接确认选择
  }
};

// 处理多选变更（多选模式）
const handleSelectionChange = (selection: any[]) => {
  if (props.multiple) {
    selectedUsers.value = selection;
  }
};

// 加载用户列表
async function loadUserList() {
  loading.value = true;
  try {
    const res = await getUserSelector(queryParams);
    userList.value = res.data.list;
    total.value = res.data.total;
  } finally {
    loading.value = false;
  }
}

// 查询
function handleQuery() {
  queryParams.page = 1;
  loadUserList();
}

// 重置
function resetQuery() {
  queryParams.keyword = "";
  queryParams.deptId = undefined;
  queryParams.roleId = undefined;
  handleQuery();
}

// 分页大小变更
function handleSizeChange(val: number) {
  queryParams.pageSize = val;
  loadUserList();
}

// 页码变更
function handleCurrentChange(val: number) {
  queryParams.page = val;
  loadUserList();
}

// 确认选择
function handleConfirm() {
  emit("confirm", selectedUsers.value);
  visible.value = false;
}

// 重置选择
const resetSelection = () => {
  selectedUsers.value = [];
};

// 监听对话框关闭
watch(() => visible.value, (val) => {
  if (!val) {
    resetSelection();
  }
});

onMounted(() => {
  loadUserList();
});
</script>

<style lang="scss" scoped>
.el-table {
  :deep(.el-table__row) {
    cursor: pointer;

    &:hover {
      background-color: var(--el-table-row-hover-bg-color);
    }
  }
}

// 添加选中图标的样式
:deep(.text-primary) {
  color: var(--el-color-primary);
}
</style>