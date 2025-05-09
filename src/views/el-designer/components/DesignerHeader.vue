<script setup lang="ts">
import { View, Download, Upload } from '@element-plus/icons-vue'

defineEmits(['preview-json', 'import-config', 'export-config'])
</script>

<template>
  <div class="designer-header">
    <div class="toolbar">
      <div class="left-tools">
        <el-button-group>
          <el-button type="primary" :icon="View" @click="$emit('preview-json')">
            预览JSON
          </el-button>
        </el-button-group>
      </div>

      <div class="right-tools">
        <el-button type="success" :icon="Download" plain @click="$emit('export-config')">
          导出
        </el-button>
        <el-button type="warning" :icon="Upload" plain @click="$emit('import-config')">
          导入
        </el-button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.designer-header {
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid var(--el-border-color-light);

  .toolbar {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .left-tools {
      min-width: 100px;

      .el-button-group {
        .el-button {
          border-radius: 4px;
          font-weight: 500;
        }
      }
    }

    .right-tools {
      min-width: 100px;
      display: flex;
      gap: 8px;
      justify-content: flex-end;

      .el-button {
        font-weight: 500;
      }
    }
  }
}
</style>