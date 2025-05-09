<script setup lang="ts">
interface ComponentItem {
  type: string
  label: string
  icon: string
  props: Record<string, any>
}

defineProps<{
  toolItems: ComponentItem[]
}>()

// 拖拽相关方法
const handleDragStart = (e: DragEvent, item: ComponentItem) => {
  e.dataTransfer?.setData('componentType', item.type)
}
</script>

<template>
  <div class="components-panel">
    <h3 class="panel-title">组件</h3>
    <div class="components-list">
      <div v-for="item in toolItems" :key="item.type" class="component-item" draggable="true"
        @dragstart="handleDragStart($event, item)">
        <el-icon>
          <component :is="item.icon" />
        </el-icon>
        <span>{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.components-panel {
  padding: 16px;

  .panel-title {
    margin: 0 0 16px;
    font-size: 16px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  .components-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .component-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 12px;
    border: 1px dashed var(--el-border-color);
    border-radius: 4px;
    cursor: move;
    transition: all 0.3s;

    &:hover {
      border-color: var(--el-color-primary);
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }

    .el-icon {
      font-size: 20px;
    }

    span {
      font-size: 12px;
    }
  }
}
</style>