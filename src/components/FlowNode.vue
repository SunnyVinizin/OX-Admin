<script setup>
import { computed } from 'vue'
import { Position, Handle, useVueFlow } from '@vue-flow/core'
import { Delete } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { useFlowDesignerStore } from '../store/modules/flowDesigner'
import { NodeType, ApproveType } from '../views/engine/workflow/utils/types'

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  data: {
    type: Object,
    required: true
  },
  type: {
    type: String,
    default: 'default'
  }
})

const flowStore = useFlowDesignerStore()
const { removeNodes } = useVueFlow()

// 根据节点类型设置不同的样式类
const nodeClass = computed(() => {
  return {
    'flow-node': true,
    'start-node': props.data.type === NodeType.START,
    'approve-node': props.data.type === NodeType.APPROVE,
    'condition-node': props.data.type === NodeType.CONDITION,
    'end-node': props.data.type === NodeType.END
  }
})

// 处理删除
const handleDelete = async () => {
  // 开始和结束节点不能删除
  if (props.data.type === NodeType.START || props.data.type === NodeType.END) {
    return
  }

  try {
    await ElMessageBox.confirm(
      '确定要删除该节点吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    removeNodes([props.id])
    flowStore.removeNode(props.id)
  } catch { }
}

// 获取节点图标
const getNodeIcon = computed(() => {
  switch (props.data.type) {
    case NodeType.START:
      return 'VideoPlay'
    case NodeType.APPROVE:
      return 'UserFilled'
    case NodeType.CONDITION:
      return 'Switch'
    case NodeType.END:
      return 'CircleClose'
    default:
      return 'Document'
  }
})
</script>

<template>
  <div :class="nodeClass">
    <!-- 节点内容 -->
    <div class="node-content node-drag-handle">
      <!-- 节点图标 -->
      <el-icon class="node-icon">
        <component :is="getNodeIcon" />
      </el-icon>

      <!-- 节点标题 -->
      <div class="node-title">{{ data.label }}</div>

      <!-- 节点配置信息 -->
      <div v-if="data.type === NodeType.APPROVE" class="node-info">
        <div v-if="data.config.approveType === ApproveType.ANY" class="approve-type">
          任意一人审批
        </div>
        <div v-else-if="data.config.approveType === ApproveType.ALL" class="approve-type">
          会签
        </div>
        <!-- <div v-else-if="data.config.approveType === ApproveType.ORDER" class="approve-type">
          按顺序审批
        </div> -->
        <div v-if="data.config.timeLimit" class="time-limit">
          {{ data.config.timeLimit }}小时内
        </div>
        <!-- 添加审批人显示 -->
        <div v-if="data.config.approvers?.users?.length" class="approvers-preview">
          <div class="approvers-count">
            已选择 {{ data.config.approvers.users.length }} 人
          </div>
          <div class="approvers-avatars">
            <el-avatar v-for="user in data.config.approvers.users.slice(0, 3)" :key="user.id" :size="20"
              :src="user.avatar">
              {{ user.nickname?.substring(0, 1) || user.username?.substring(0, 1) }}
            </el-avatar>
            <div v-if="data.config.approvers.users.length > 3" class="more-avatars">
              +{{ data.config.approvers.users.length - 3 }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="data.type === NodeType.CONDITION" class="node-info">
        <div v-for="(condition, index) in data.config.conditions" :key="index" class="condition-item"
          :title="condition.expression">
          {{ condition.expression || '未设置条件' }}
        </div>
      </div>
    </div>

    <!-- 删除按钮 -->
    <div v-if="data.type !== NodeType.START && data.type !== NodeType.END" class="delete-button" title="删除节点"
      @click.stop="handleDelete">
      <el-icon class="delete-icon">
        <Delete />
      </el-icon>
    </div>

    <!-- 连接点 -->
    <Handle v-if="data.type !== NodeType.END" type="source" :position="Position.Right" class="handle handle-right" />
    <Handle v-if="data.type !== NodeType.START" type="target" :position="Position.Left" class="handle handle-left" />
  </div>
</template>

<style scoped>
.flow-node {
  background: var(--el-bg-color);
  color: var(--el-text-color-primary);
  border-radius: 8px;
  width: 180px;
  text-align: center;
  font-size: 12px;
  padding: 16px;
  position: relative;
  box-shadow: var(--el-box-shadow-light);
  transition: all 0.2s ease;
  border: 1px solid var(--el-border-color-light);
}

.flow-node:hover {
  box-shadow: var(--el-box-shadow);
}

.node-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.node-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

/* 开始节点样式 */
.start-node {
  background: var(--el-bg-color);
  border-bottom: 3px solid var(--el-color-success);

  .node-icon {
    color: var(--el-color-success);
  }
}

/* 审批节点样式 */
.approve-node {
  background: var(--el-bg-color);
  border-bottom: 3px solid var(--el-color-primary);

  .node-icon {
    color: var(--el-color-primary);
  }
}

/* 条件节点样式 */
.condition-node {
  background: var(--el-bg-color);
  border-bottom: 3px solid var(--el-color-warning);

  .node-icon {
    color: var(--el-color-warning);
  }
}

/* 结束节点样式 */
.end-node {
  background: var(--el-bg-color);
  border-bottom: 3px solid var(--el-color-danger);

  .node-icon {
    color: var(--el-color-danger);
  }
}

.node-title {
  font-weight: 500;
  font-size: 14px;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.node-info {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.approve-type,
.time-limit,
.condition-item {
  padding: 2px 8px;
  border-radius: 4px;
}

.approve-type,
.time-limit {
  padding: 2px 8px;
  border-radius: 4px;
}

.condition-item {
  padding: 2px 8px;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
  margin-bottom: 4px;
}

.condition-item:last-child {
  margin-bottom: 0;
}

/* 删除按钮样式 */
.delete-button {
  position: absolute;
  right: -8px;
  top: -8px;
  width: 20px;
  height: 20px;
  background: var(--el-color-danger);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  z-index: 10;
  transition: all 0.2s ease;
  box-shadow: var(--el-box-shadow-light);
  opacity: 0;
}

.flow-node:hover .delete-button {
  opacity: 1;
}

.delete-button:hover {
  transform: scale(1.1);
  background: var(--el-color-danger-light-3);
}

.delete-icon {
  font-size: 12px;
}

/* 连接点样式 */
:deep(.handle) {
  width: 8px;
  height: 8px;
  background: var(--el-color-primary);
  border: 2px solid var(--el-bg-color);
  border-radius: 50%;
  box-shadow: var(--el-box-shadow-light);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.flow-node:hover :deep(.handle) {
  opacity: 1;
}

:deep(.handle:hover) {
  background: var(--el-color-primary-light-3);
  transform: scale(1.2);
}

:deep(.handle-left) {
  left: -4px;
}

:deep(.handle-right) {
  right: -4px;
}

.node-drag-handle {
  cursor: move;
  width: 100%;
  height: 100%;
}

.approvers-preview {
  margin-top: 4px;
  padding: 4px 8px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.approvers-count {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.approvers-avatars {
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: center;
}

.more-avatars {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color);
  padding: 2px 4px;
  border-radius: 2px;
}

:deep(.el-avatar) {
  border: 2px solid var(--el-bg-color);
  box-shadow: var(--el-box-shadow-light);

  &:not(:first-child) {
    margin-left: -8px;
  }
}
</style>