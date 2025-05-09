<script setup lang="ts">
import { ref } from 'vue'
import { ElContainer, ElHeader, ElMain, ElAside, ElMessage } from 'element-plus'
import DesignerHeader from './components/DesignerHeader.vue'
import ComponentsPanel from './components/ComponentsPanel.vue'
import DesignArea from './components/DesignArea.vue'
import ConfigPanel from './components/ConfigPanel.vue'
import ViewParams from './ViewParams.vue'
import { formComponents, ComponentType } from './config/designer-config'

// 表单配置数据
const formConfig = ref({
  components: []
})

// 当前选中的组件
const currentComponent = ref(null)

// 配置面板显示控制
const configPanelVisible = ref(false)

// 预览对话框控制
const previewDialogVisible = ref(false)

// 处理组件拖放
const handleDropComponent = (componentType: ComponentType) => {
  const component = formComponents.find(item => item.type === componentType)
  if (component) {
    formConfig.value.components.push({
      ...component,
      id: `${component.type}_${Date.now()}`,
      field: `field_${Date.now()}`
    })
  }
}

// 处理组件选择
const handleSelectComponent = (component: any) => {
  currentComponent.value = component
  configPanelVisible.value = true
}

// 处理删除组件
const handleDeleteComponent = (component: any) => {
  const index = formConfig.value.components.findIndex(item => item.id === component.id)
  if (index !== -1) {
    formConfig.value.components.splice(index, 1)
    // 如果删除的是当前选中的组件，关闭配置面板
    if (currentComponent.value?.id === component.id) {
      currentComponent.value = null
      configPanelVisible.value = false
    }
  }
}

// 更新组件配置
const handleUpdateComponent = (updatedComponent: any) => {
  const index = formConfig.value.components.findIndex(item => item.id === updatedComponent.id)
  if (index !== -1) {
    formConfig.value.components[index] = updatedComponent
  }
}

// 处理预览JSON
const handlePreviewJson = () => {
  previewDialogVisible.value = true
}

// 处理导入配置
const handleImportConfig = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target?.result as string)
          formConfig.value = config
        } catch (error) {
          ElMessage.error('配置文件格式错误')
        }
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

// 处理导出配置
const handleExportConfig = () => {
  const config = {
    components: formConfig.value.components
  }
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'form-config.json'
  a.click()
  URL.revokeObjectURL(url)
}

// 处理组件事件
const handleComponentEvent = ({ componentId, eventName, args }: { componentId: string; eventName: string; args: any[] }) => {
  const component = formConfig.value.components.find(item => item.id === componentId)
  if (!component) return

  // 根据事件类型处理
  switch (eventName) {
    case 'input':
    case 'change':
      // 处理输入值变化
      if (component.props.formatter) {
        // 如果有格式化函数，处理输入值
        const formattedValue = component.props.formatter(args[0])
        // 更新组件值
        component.props.modelValue = formattedValue
      } else {
        component.props.modelValue = args[0]
      }
      break
    case 'focus':
    case 'blur':
      // 处理焦点事件
      console.log(`组件 ${component.field} ${eventName} 事件触发`)
      break
    case 'keydown':
    case 'keyup':
      // 处理键盘事件
      console.log(`组件 ${component.field} ${eventName} 事件触发`, args[0].key)
      break
    case 'enter':
      // 处理回车事件
      console.log(`组件 ${component.field} 回车事件触发`)
      break
  }
}
</script>

<template>
  <ElContainer class="el-designer">
    <ElHeader class="designer-header">
      <DesignerHeader @preview-json="handlePreviewJson" @import-config="handleImportConfig"
        @export-config="handleExportConfig" />
    </ElHeader>

    <ElContainer class="designer-container">
      <!-- 左侧组件面板 -->
      <ElAside width="250px" class="designer-aside">
        <ComponentsPanel :tool-items="formComponents" />
      </ElAside>

      <!-- 中间设计区域 -->
      <ElMain class="designer-main">
        <DesignArea :components="formConfig.components" @select-component="handleSelectComponent"
          @drop-component="handleDropComponent" @component-event="handleComponentEvent"
          @delete-component="handleDeleteComponent" />
      </ElMain>

      <!-- 配置面板 -->
      <ConfigPanel v-model="configPanelVisible" :component="currentComponent"
        @update:component="handleUpdateComponent" />
    </ElContainer>

    <!-- 预览对话框 -->
    <el-dialog v-model="previewDialogVisible" title="配置预览" width="800px" destroy-on-close>
      <ViewParams :form-config="formConfig" />
    </el-dialog>
  </ElContainer>
</template>

<style lang="scss" scoped>
.el-designer {
  height: 100vh;
  background-color: var(--el-bg-color-page);

  .designer-header {
    height: 60px;
    border-bottom: 1px solid var(--el-border-color-light);
    background-color: var(--el-bg-color);
    padding: 0 16px;
  }

  .designer-container {
    height: calc(100vh - 60px);
  }

  .designer-aside {
    border-right: 1px solid var(--el-border-color-light);
    background-color: var(--el-bg-color);
  }

  .designer-main {
    padding: 20px;
    background-color: var(--el-bg-color-page);
  }
}
</style>