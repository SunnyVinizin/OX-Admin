<script setup lang="ts">
import { ref, computed } from "vue";
import { usePosition } from "@/views/system/position/utils/hook";
import type { GroupedPositions, FormItemProps } from "./utils/types";
import { ElMessageBox } from "element-plus";
import { Edit, Delete, Search, RefreshRight, Plus, OfficeBuilding, More } from '@element-plus/icons-vue'
import { hasAuth } from "@/router/utils";

defineOptions({
  name: "SystemPosition"
});

const formRef = ref();
const {
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
} = usePosition();

// 按部门分组的岗位数据
const groupedPositions = computed<GroupedPositions>(() => {
  const groups: GroupedPositions = {};
  dataList.value.forEach(position => {
    if (!groups[position.deptId]) {
      const dept = form.deptOptions.find(d => d.id === position.deptId);
      groups[position.deptId] = {
        deptInfo: dept || { deptName: position.deptName },
        positions: []
      };
    }
    groups[position.deptId].positions.push(position);
  });
  return groups;
});

// 创建新岗位的默认值
const createDefaultPosition = (deptId: number): Partial<FormItemProps> => ({
  deptId,
  positionName: "",
  positionCode: "",
  rank: 99,
  status: 1,
  remark: "",
  deptOptions: form.deptOptions
});

// 获取部门的完整路径名
const getDeptFullPath = (deptId: number): string => {
  const findDeptPath = (depts: any[], targetId: number, path: string[] = []): string[] | null => {
    for (const dept of depts) {
      if (dept.id === targetId) {
        return [...path, dept.deptName];
      }
      if (dept.children) {
        const result = findDeptPath(dept.children, targetId, [...path, dept.deptName]);
        if (result) return result;
      }
    }
    return null;
  };

  const path = findDeptPath(form.deptOptions, deptId);
  return path ? path.join(' / ') : '';
};

// 处理下拉菜单命令
const handleCommand = async (command: string, position: FormItemProps) => {
  if (command === 'edit') {
    openDialog('修改', position);
  } else if (command === 'delete') {
    try {
      await ElMessageBox.confirm(
        `确认要删除岗位【${position.positionName}】吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      );
      handleDelete(position);
    } catch { }
  }
};
</script>

<template>
  <div class="main">
    <el-form ref="formRef" :inline="true" :model="form" class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]">
      <el-form-item label="岗位名称：" prop="keyword">
        <el-input v-model="form.keyword" placeholder="请输入岗位名称" clearable class="!w-[180px]" />
      </el-form-item>

      <el-form-item label="状态：" prop="status">
        <el-select v-model="form.status" placeholder="请选择状态" clearable class="!w-[180px]">
          <el-option label="启用" :value="1" />
          <el-option label="停用" :value="-1" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :icon="Search" @click="onSearch">
          搜索
        </el-button>
        <el-button :icon="RefreshRight" @click="resetForm">
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <div class="position-cards p-4">
      <el-row :gutter="16">
        <el-col v-for="(group, deptId) in groupedPositions" :key="deptId" :span="24" class="mb-4">
          <el-card class="dept-card" shadow="hover">
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <el-icon class="mr-2">
                    <office-building />
                  </el-icon>
                  <span class="font-bold text-[var(--el-text-color-primary)]">{{ getDeptFullPath(Number(deptId))
                    }}</span>
                  <el-tag size="small" class="ml-2" type="info" effect="plain">{{ group.positions.length }}个岗位</el-tag>
                </div>
                <el-button v-if="hasAuth('system:position:add')" type="primary" link :icon="Plus"
                  @click="openDialog('新增', createDefaultPosition(Number(deptId)))">
                  新增岗位
                </el-button>
              </div>
            </template>

            <div class="position-list">
              <el-row :gutter="12">
                <el-col v-for="position in group.positions" :key="position.id" :xs="24" :sm="12" :md="8" :lg="6" :xl="4"
                  class="mb-3">
                  <el-card shadow="hover" class="position-item h-[140px] !border-[var(--el-border-color-light)]">
                    <div class="flex flex-col h-full">
                      <div class="flex justify-between items-start mb-2">
                        <h3 class="text-[15px] font-bold text-[var(--el-text-color-primary)] truncate max-w-[70%]"
                          :title="position.positionName">
                          {{ position.positionName }}
                        </h3>
                        <el-dropdown trigger="hover" @command="(command) => handleCommand(command, position)">
                          <el-button type="primary" link :icon="More" />
                          <template #dropdown>
                            <el-dropdown-menu>
                              <el-dropdown-item command="edit">
                                <el-icon v-if="hasAuth('system:position:edit')">
                                  <Edit />
                                </el-icon>修改
                              </el-dropdown-item>
                              <el-dropdown-item command="delete" divided>
                                <el-icon v-if="hasAuth('system:position:delete')">
                                  <Delete />
                                </el-icon>删除
                              </el-dropdown-item>
                            </el-dropdown-menu>
                          </template>
                        </el-dropdown>
                      </div>
                      <div class="flex-1 flex flex-col justify-between">
                        <div class="text-[13px] text-[var(--el-text-color-secondary)]">
                          <div class="mb-1 flex items-center">
                            <span class="inline-block w-14">编码：</span>
                            <span class="truncate" :title="position.positionCode">{{ position.positionCode }}</span>
                          </div>
                          <div class="mb-1 flex items-center">
                            <span class="inline-block w-14">排序：</span>
                            <span>{{ position.rank }}</span>
                          </div>
                        </div>
                        <div class="flex items-center justify-between">
                          <el-tag size="small" :type="position.status === 1 ? 'success' : 'danger'" effect="light">
                            {{ position.status === 1 ? '启用' : '停用' }}
                          </el-tag>
                          <span class="text-xs text-[var(--el-text-color-secondary)]">
                            {{ new Date(position.createdAt).toLocaleDateString() }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </el-card>
                </el-col>
              </el-row>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 分页 -->
      <div class="flex justify-end mt-4">
        <el-pagination v-model:current-page="pagination.currentPage" v-model:page-size="pagination.pageSize"
          :total="pagination.total" :page-sizes="[10, 20, 30, 50]" small background
          layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}

.position-cards {
  .dept-card {
    :deep(.el-card__header) {
      padding: 12px 20px;
      border-bottom: 1px solid var(--el-border-color-light);
      background-color: var(--el-fill-color-light);
    }
  }

  .position-item {
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    }

    :deep(.el-card__body) {
      padding: 12px;
    }
  }
}
</style>