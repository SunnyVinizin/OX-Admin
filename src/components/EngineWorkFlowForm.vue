<script setup lang="ts">

import { onMounted, reactive, ref, watch } from "vue";
import ReCol from "@/components/ReCol";
import UserSelector from "@/components/UserSelectorTable.vue";
import { WorkflowType, NodeType } from "../views/engine/workflow/utils/types";
import { formRules } from "../views/engine/workflow/utils/rule";
import { workflowTypeOptions } from "../views/engine/workflow/utils/enums";
import { formTemplates, nodeTemplates, ApproveType } from "../views/engine/workflow/utils/templates";
import { deptTreeQuery } from "@/api/dept";
import { roleListQuery } from "@/api/role";
import {
  Select,
  Timer,
  User,
  Plus,
  Close,
  Connection,
  Right,
  SwitchButton,
  Position,
  Check
} from "@element-plus/icons-vue";

defineOptions({
  name: "EngineWorkFlowForm"
});

const props = withDefaults(defineProps<{
  isEdit?: boolean,
  formInline?: {
    name: string;
    code: string;
    description: string;
    type: WorkflowType;
    status: number;
    nodes: any[];
    formConfig: {
      fields: any[];
    };
  };
}>(), {
  isEdit: false,
  formInline: () => ({
    name: "",
    code: "",
    description: "",
    type: WorkflowType.LEAVE,
    status: 1,
    nodes: [],
    formConfig: {
      fields: []
    }
  })
});

const ruleFormRef = ref();
const newFormInline = ref(JSON.parse(JSON.stringify(props.formInline)));
// 部门列表
const deptOptions = ref<any[]>([]);
// 角色列表
const roleOptions = ref<any[]>([]);
// 用户选择器是否显示
const userSelectorVisible = ref(false);
// 当前编辑的节点
const currentEditNode = ref<any>(null);
// 节点用户映射
const nodeUsers = reactive<Record<number, any[]>>({});
// 表单加载状态
const formLoading = ref(false);

// 打开用户选择器
function openUserSelector(nodeNum: number) {
  currentEditNode.value = nodeNum;
  userSelectorVisible.value = true;
}

// 获取节点用户
function getNodeUsers(nodeNum: number) {
  const node = newFormInline.value.nodes.find(n => n.orderNum === nodeNum);
  if (node?.approvers?.approvers?.users) {
    return node.approvers.approvers.users;
  }
  return nodeUsers[nodeNum] || [];
}

// 移除节点用户
function removeNodeUser(nodeNum: number, userId: number) {
  const users = nodeUsers[nodeNum];
  if (users) {
    const index = users.findIndex(u => u.id === userId);
    if (index > -1) {
      users.splice(index, 1);
      updateNodeApprovers(nodeNum, users);
    }
  }
}

// 用户选择确认
function handleUserSelected(users: any[]) {
  if (currentEditNode.value) {
    const nodeNum = currentEditNode.value;
    nodeUsers[nodeNum] = users;
    updateNodeApprovers(nodeNum, users);
  }
}

// 更新节点审批人配置
function updateNodeApprovers(nodeNum?: number, users?: any[]) {
  // 如果传入了具体节点和用户，则更新指定节点
  if (nodeNum !== undefined && users) {
    const node = newFormInline.value.nodes.find(n => n.orderNum === nodeNum);
    if (node && node.approvers?.approvers) {
      // 更新节点的审批人配置
      node.approvers.approvers.userIds = users.map(u => u.id);
      node.approvers.approvers.users = users.map(u => ({
        id: u.id,
        username: u.username,
        nickname: u.nickname,
        avatar: u.avatar,
        departmentName: u.departmentName,
        positionName: u.positionName
      }));
    }
    return;
  }

  // 如果没有传参数，则更新所有审批节点的用户
  newFormInline.value.nodes.forEach(node => {
    if (node.type === NodeType.APPROVE && node.approvers?.approvers) {
      // 获取该节点已保存的用户信息
      const { userIds = [], users = [] } = node.approvers.approvers;

      // 将用户信息保存到 nodeUsers 中
      nodeUsers[node.orderNum] = users.map(user => ({
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
        departmentName: user.departmentName,
        positionName: user.positionName
      }));

      node.approvers = {
        position: null,
        approvers: {
          required: node.approvers.approvers.required ?? true,
          userIds,
          users
        }
      };
    }
  });
}

// 监听工作流类型变化
watch(
  () => newFormInline.value.type,
  (newType) => {
    // 根据类型加载对应模板
    const templateType = newType as any;
    // 加载表单字段配置
    newFormInline.value.formConfig = {
      fields: formTemplates[templateType].fields
    };

    if (!props.isEdit) {
      // 新增模式：直接使用模板
      newFormInline.value.nodes = JSON.parse(
        JSON.stringify(nodeTemplates[templateType])
      );
    } else {
      console.log('newFormInline.value', newFormInline.value);

      // 编辑模式：只在首次加载时处理节点数据
      if (!newFormInline.value.nodes.some(node => node.conditions || node.approvers)) {

        newFormInline.value.nodes.forEach(node => {
          // 处理条件节点
          if (node.type === NodeType.CONDITION && node.settings) {
            try {
              node.conditions = JSON.parse(node.settings);
            } catch { }
          }

          // 处理审批节点
          if (node.type === NodeType.APPROVE && node.settings) {
            try {
              const approverSettings = JSON.parse(node.settings);
              node.approvers = approverSettings;
              // 更新 nodeUsers 映射
              if (approverSettings.users) {
                nodeUsers[node.orderNum] = approverSettings.users;
              }
            } catch { }
          }
        });

        console.log('newFormInline.value222', newFormInline.value);

      }
    }
  },
  { immediate: true }
);


// 获取节点类名
function getNodeClass(type: NodeType): string {
  switch (type) {
    case NodeType.START:
      return "timeline-node-start";
    case NodeType.APPROVE:
      return "timeline-node-approve";
    case NodeType.CONDITION:
      return "timeline-node-condition";
    case NodeType.END:
      return "timeline-node-end";
    default:
      return "";
  }
}

// 获取时间线项类型
function getTimelineItemType(type: NodeType): "primary" | "success" | "warning" | "info" | "danger" {
  switch (type) {
    case NodeType.START:
      return "primary";
    case NodeType.APPROVE:
      return "success";
    case NodeType.CONDITION:
      return "warning";
    case NodeType.END:
      return "info";
    case NodeType.CC:
      return "info";
    default:
      return "primary";
  }
}

// 获取节点图标
function getNodeIcon(type: NodeType) {
  switch (type) {
    case NodeType.START:
      return Position;
    case NodeType.APPROVE:
      return Check;
    default:
      return null;
  }
}

// 获取节点颜色
function getNodeColor(type: NodeType) {
  switch (type) {
    case NodeType.START:
      return "#409EFF";
    case NodeType.APPROVE:
      return "#67C23A";
    case NodeType.CONDITION:
      return "#E6A23C";
    case NodeType.END:
      return "#909399";
    default:
      return "";
  }
}

// 获取节点类型名称
function getNodeTypeName(type: NodeType) {
  switch (type) {
    case NodeType.START:
      return "发起";
    case NodeType.APPROVE:
      return "审批";
    case NodeType.CONDITION:
      return "条件";
    case NodeType.END:
      return "结束";
    default:
      return "";
  }
}

// 获取节点标签类型
function getNodeTagType(type: NodeType): "success" | "primary" | "warning" | "info" | "danger" {
  switch (type) {
    case NodeType.START:
      return "primary";
    case NodeType.APPROVE:
      return "success";
    case NodeType.CONDITION:
      return "warning";
    case NodeType.END:
      return "info";
    case NodeType.CC:
      return "info";
    default:
      return "primary";
  }
}

onMounted(async () => {
  try {
    formLoading.value = true;
    const [deptRes, roleRes]: any = await Promise.all([
      deptTreeQuery(),
      roleListQuery({ page: 1, pageSize: 999 })
    ]);

    deptOptions.value = deptRes.data?.departments || [];
    roleOptions.value = roleRes.data?.list || [];

    // 如果是编辑模式，初始化审批人
    if (props.isEdit) {
      updateNodeApprovers();
    }
  } catch (error) {
    deptOptions.value = [];
    roleOptions.value = [];
  } finally {
    formLoading.value = false;
  }
});

defineExpose({
  getRef: () => ruleFormRef.value,
  getFormData: () => newFormInline.value
});
</script>

<template>
  <el-form ref="ruleFormRef" v-loading="formLoading" :model="newFormInline" :rules="formRules" label-width="100px"
    element-loading-text="加载中...">
    <el-row :gutter="30">
      <re-col>
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>基本信息配置</span>
            </div>
          </template>
          <!-- 基本信息部分保持不变 -->
          <re-col :value="12" :xs="24" :sm="24">
            <el-form-item label="流程名称" prop="name">
              <el-input v-model="newFormInline.name" clearable placeholder="请输入流程名称" />
            </el-form-item>
          </re-col>

          <re-col :value="12" :xs="24" :sm="24">
            <el-form-item label="流程编码" prop="code">
              <el-input v-model="newFormInline.code" clearable placeholder="请输入流程编码" />
            </el-form-item>
          </re-col>

          <re-col :value="12" :xs="24" :sm="24">
            <el-form-item label="流程类型" prop="type">
              <el-select v-model="newFormInline.type" class="w-full" placeholder="请选择流程类型">
                <el-option v-for="item in workflowTypeOptions" :key="item.value" :label="item.label"
                  :value="item.value" />
              </el-select>
            </el-form-item>
          </re-col>

          <re-col>
            <el-form-item label="流程描述">
              <el-input v-model="newFormInline.description" type="textarea" :rows="3" placeholder="请输入流程描述" />
            </el-form-item>
          </re-col>
        </el-card>
      </re-col>
      <!-- 表单配置预览 -->
      <re-col>
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>表单字段配置</span>
            </div>
          </template>
          <el-table :data="newFormInline.formConfig.fields" border style="width: 100%">
            <el-table-column prop="label" label="字段名称" />
            <el-table-column prop="name" label="字段标识" />
            <el-table-column prop="type" label="字段类型" />
            <el-table-column prop="required" label="是否必填">
              <template #default="{ row }">
                <el-tag :type="row.required ? 'success' : 'info'">
                  {{ row.required ? '是' : '否' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </re-col>

      <!-- 节点配置 -->
      <re-col>
        <el-card class="box-card w-full">
          <template #header>
            <div class="card-header">
              <span class="flex items-center gap-2">
                <el-icon>
                  <Connection />
                </el-icon>
                节点配置
              </span>
            </div>
          </template>
          <div class="rounded-lg p-8">
            <el-timeline>
              <el-timeline-item v-for="node in newFormInline.nodes" :key="node.orderNum"
                :type="getTimelineItemType(node.type)" :icon="getNodeIcon(node.type)" :color="getNodeColor(node.type)"
                size="normal" class="!pb-8">
                <!-- 条件节点图标 -->
                <template v-if="node.type === NodeType.CONDITION" #dot>
                  <el-icon class="bg-white rounded-full p-1.5 shadow-md text-yellow-500">
                    <SwitchButton />
                  </el-icon>
                </template>

                <!-- 节点卡片 -->
                <div class="rounded-xl shadow-md transition-all duration-300 hover:shadow-lg" :class="[
                  getNodeClass(node.type),
                  'hover:translate-x-1'
                ]">
                  <!-- 节点头部 -->
                  <div class="flex items-center justify-between p-4 border-b border-gray-100">
                    <div class="flex items-center gap-3">
                      <span class="text-base font-medium">{{ node.name }}</span>
                      <el-tag size="small" :type="getNodeTagType(node.type)" class="rounded-full px-3" effect="light">
                        {{ getNodeTypeName(node.type) }}
                      </el-tag>
                    </div>
                    <span class="text-gray-400 text-sm">节点 {{ node.orderNum }}</span>
                  </div>

                  <!-- 审批节点配置 -->
                  <template v-if="node.type === NodeType.APPROVE">
                    <div class="space-y-6 p-6">
                      <!-- 审批方式 -->
                      <div class="approve-section">
                        <div class="section-title">
                          <el-icon><Select /></el-icon>
                          审批方式
                        </div>
                        <el-radio-group v-model="node.approveType" class="flex gap-6">
                          <el-radio :value="ApproveType.ANY">
                            <div class="flex items-center gap-2 approve-option">
                              <el-icon class="text-blue-500"><Select /></el-icon>
                              <div>
                                <div class="font-medium">任意审批</div>
                                <div class="desc">任意一人审批通过即可</div>
                              </div>
                            </div>
                          </el-radio>
                          <el-radio :value="ApproveType.ALL">
                            <div class="flex items-center gap-2 approve-option">
                              <el-icon class="text-green-500">
                                <Connection />
                              </el-icon>
                              <div>
                                <div class="font-medium">会签</div>
                                <div class="desc">需所有审批人同意才通过</div>
                              </div>
                            </div>
                          </el-radio>
                          <!-- <el-radio :value="ApproveType.ORDER">
                            <div class="flex items-center gap-2 approve-option">
                              <el-icon class="text-green-500">
                                <Sort />
                              </el-icon>
                              <div>
                                <div class="font-medium">按顺序审批</div>
                                <div class="desc">按指定顺序依次审批</div>
                              </div>
                            </div>
                          </el-radio> -->
                        </el-radio-group>
                      </div>

                      <!-- 审批时限 -->
                      <div class="approve-section">
                        <div class="section-title">
                          <el-icon>
                            <Timer />
                          </el-icon>
                          审批时限(小时)
                        </div>
                        <el-input-number v-model="node.timeLimit" :min="1" :max="72" class="!w-44"
                          controls-position="right" />
                      </div>

                      <!-- 审批人选择 -->
                      <div class="approve-section">
                        <div class="section-title">
                          <el-icon>
                            <User />
                          </el-icon>
                          审批人
                        </div>
                        <div class="flex flex-wrap gap-4">
                          <!-- 已选审批人 -->
                          <div v-for="user in getNodeUsers(node.orderNum)" :key="user.id" class="relative group">
                            <div class="approver-card group-hover:shadow-md">
                              <el-avatar :size="44" :src="user.avatar" class="ring-2 ring-offset-2 ring-blue-100">
                                {{ user.avatar ? '' : (user.nickname || user.username).substring(0, 1) }}
                              </el-avatar>
                              <span class="mt-1 text-sm">{{ user.nickname || user.username }}</span>
                              <!-- 删除按钮 -->
                              <el-icon class="delete-btn" @click="removeNodeUser(node.orderNum, user.id)">
                                <Close />
                              </el-icon>
                            </div>
                          </div>

                          <!-- 添加审批人按钮 -->
                          <div class="add-approver-btn" @click="openUserSelector(node.orderNum)">
                            <el-icon>
                              <Plus />
                            </el-icon>
                            <span class="text-sm">添加审批人</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>

                  <!-- 条件节点配置 -->
                  <template v-if="node.type === NodeType.CONDITION">
                    <div class="p-6 space-y-4">
                      <div v-for="(condition, index) in node.conditions?.conditions" :key="index"
                        class="condition-item">
                        <el-input v-model="condition.expression" placeholder="请输入条件表达式" disabled
                          class="condition-input">
                          <template #prepend>
                            <el-icon class="mr-1 text-yellow-500">
                              <Connection />
                            </el-icon>
                            条件 {{ index + 1 }}
                          </template>
                          <template #append>
                            <el-icon class="mr-1">
                              <Right />
                            </el-icon>
                            节点 {{ condition.nextNode }}
                          </template>
                        </el-input>
                      </div>
                    </div>
                  </template>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-card>
      </re-col>
    </el-row>
    <!-- 用户选择器 -->
    <user-selector v-if="deptOptions.length && roleOptions.length" v-model="userSelectorVisible"
      :dept-options="deptOptions" :role-options="roleOptions" @confirm="handleUserSelected" />
  </el-form>
</template>

<style lang="scss" scoped>
.box-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  span {
    font-size: 16px;
    font-weight: 600;
  }
}

.timeline-node-start {
  @apply border-l-4 border-blue-500;
  /* primary -> blue-500 */
}

.timeline-node-approve {
  @apply border-l-4 border-green-500;
  /* success -> green-500 */
}

.timeline-node-condition {
  @apply border-l-4 border-yellow-500;
  /* warning -> yellow-500 */
}

.timeline-node-end {
  @apply border-l-4 border-gray-500;
  /* info -> gray-500 */
}

.approve-section {
  @apply space-y-3;

  .section-title {
    @apply flex items-center gap-2 font-medium mb-2;
  }

  .desc {
    @apply text-xs mt-0.5;
  }
}

.approver-card {
  @apply flex flex-col items-center p-3 rounded-lg;

  .delete-btn {
    @apply absolute -top-1 -right-1 p-1.5 rounded-full bg-red-500 text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-sm hover:bg-red-600;
  }
}

.add-approver-btn {
  @apply flex flex-col items-center justify-center gap-2 w-[76px] h-[76px] rounded-lg border-2 border-dashed cursor-pointer transition-all duration-300 hover:border-blue-500 hover:text-blue-500;
}

.condition-item {
  .condition-input {

    :deep(.el-input-group__prepend),
    :deep(.el-input-group__append) {
      @apply font-medium;
    }
  }
}

// 时间线样式
:deep(.el-timeline) {
  .el-timeline-item__node {
    @apply shadow-sm;
  }

  .el-timeline-item__tail {
    @apply opacity-30;
  }
}
</style>