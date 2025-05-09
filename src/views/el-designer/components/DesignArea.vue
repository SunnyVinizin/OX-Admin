<script setup lang="ts">
import { ref } from 'vue'
import { ComponentType, defaultRules, formatterTemplates } from '../config/designer-config'
import { Delete } from '@element-plus/icons-vue'

interface ComponentItem {
  id: string
  type: ComponentType
  label: string
  field: string
  props: Record<string, any>
  style?: Record<string, string>
  customClass?: string
  rules?: Array<{
    type?: string
    pattern?: string
    message?: string
    trigger?: string
    required?: boolean
  }>
  required?: boolean
}

const props = defineProps<{
  components: ComponentItem[]
}>()

const emit = defineEmits(['select-component', 'drop-component', 'component-event', 'delete-component'])

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  const componentType = e.dataTransfer?.getData('componentType')
  emit('drop-component', componentType)
}

const handleSelectComponent = (component: ComponentItem) => {
  emit('select-component', component)
}

// 处理删除组件
const handleDeleteComponent = (component: ComponentItem, event: Event) => {
  event.stopPropagation() // 阻止事件冒泡，避免触发选择组件
  emit('delete-component', component)
}

// 生成组件样式
const getComponentStyle = (item: ComponentItem) => {
  if (!item.style) return {}

  const style: Record<string, string> = {}

  // 设置宽度
  if (item.style.width === 'custom' && item.style.customWidth) {
    style.width = `${item.style.customWidth}px`
  } else if (item.style.width === 'auto') {
    style.width = '100%'
  }

  // 设置对齐方式
  if (item.style.textAlign) {
    style.textAlign = item.style.textAlign
  }

  // 设置边距
  if (item.style.marginY) {
    style.marginTop = `${item.style.marginY}px`
    style.marginBottom = `${item.style.marginY}px`
  }
  if (item.style.marginX) {
    style.marginLeft = `${item.style.marginX}px`
    style.marginRight = `${item.style.marginX}px`
  }

  // 添加自定义样式
  if (item.style.customStyle) {
    const customStyles = item.style.customStyle.split(';').filter(Boolean)
    customStyles.forEach(style => {
      const [property, value] = style.split(':').map(s => s.trim())
      if (property && value) {
        style[property] = value
      }
    })
  }

  return style
}

// 处理组件验证规则
const getComponentRules = (component: ComponentItem) => {
  const rules = [...(component.rules || [])]

  // 如果设置了必填，添加必填规则
  if (component.required) {
    rules.unshift(defaultRules.required)
  }

  // 处理手机号验证规则的正则表达式
  return rules.map(rule => {
    if (rule.pattern && typeof rule.pattern === 'string') {
      return {
        ...rule,
        pattern: new RegExp(rule.pattern)
      }
    }
    return rule
  })
}

// 获取格式化函数
const getFormatter = (component: ComponentItem) => {
  if (component.props.formatterTemplate) {
    // 使用预设模板
    return formatterTemplates[component.props.formatterTemplate].formatter
  } else if (component.props.customFormatter) {
    // 使用自定义格式化函数
    try {
      return new Function('value', `return ${component.props.customFormatter}`)(component.props.customFormatter)
    } catch (error) {
      console.error('格式化函数解析错误:', error)
      return undefined
    }
  }
  return undefined
}

// 获取解析函数
const getParser = (component: ComponentItem) => {
  if (component.props.formatterTemplate) {
    // 使用预设模板
    return formatterTemplates[component.props.formatterTemplate].parser
  } else if (component.props.customParser) {
    // 使用自定义解析函数
    try {
      return new Function('value', `return ${component.props.customParser}`)(component.props.customParser)
    } catch (error) {
      console.error('解析函数解析错误:', error)
      return undefined
    }
  }
  return undefined
}

// 处理事件
const handleEvent = (component: ComponentItem, eventName: string, ...args: any[]) => {
  const handler = component.props.eventHandlers[eventName]
  if (handler) {
    try {
      const fn = new Function(...args.map((_, i) => `arg${i}`), handler)
      fn(...args)
    } catch (error) {
      console.error(`事件处理器执行错误 (${eventName}):`, error)
    }
  }
  // 触发事件到父组件
  emit('component-event', {
    componentId: component.id,
    eventName,
    args
  })
}
</script>

<template>
  <div class="design-area" @dragover="handleDragOver" @drop="handleDrop">
    <el-form v-if="components.length" label-width="100px">
      <el-form-item v-for="item in components" :key="item.id" :label="item.label" :label-width="item.props.labelWidth"
        @click="handleSelectComponent(item)">
        <!-- 删除按钮 -->
        <div class="component-actions">
          <el-button type="danger" link class="delete-btn" @click="handleDeleteComponent(item, $event)">
            <el-icon>
              <Delete />
            </el-icon>
          </el-button>
        </div>

        <!-- 输入框组件 -->
        <el-input v-if="item.type === ComponentType.Input" v-bind="item.props" :style="getComponentStyle(item)"
          :class="item.style?.customClass" :formatter="getFormatter(item)" :parser="getParser(item)"
          @input="(val) => handleEvent(item, 'input', val)" @change="(val) => handleEvent(item, 'change', val)"
          @focus="(event) => handleEvent(item, 'focus', event)" @blur="(event) => handleEvent(item, 'blur', event)"
          @keydown="(event) => handleEvent(item, 'keydown', event)" @clear="() => handleEvent(item, 'clear')">
          <!-- 插槽内容 -->
          <template v-if="item.props.slots.prefix" #prefix>
            <div v-html="item.props.slots.prefix" />
          </template>
          <template v-if="item.props.slots.suffix" #suffix>
            <div v-html="item.props.slots.suffix" />
          </template>
          <template v-if="item.props.slots.prepend" #prepend>
            <div v-html="item.props.slots.prepend" />
          </template>
          <template v-if="item.props.slots.append" #append>
            <div v-html="item.props.slots.append" />
          </template>
        </el-input>

        <!-- 选择器组件 -->
        <el-select v-else-if="item.type === ComponentType.Select" v-bind="item.props" :style="getComponentStyle(item)"
          :class="item.style?.customClass" @change="(val) => handleEvent(item, 'change', val)"
          @visible-change="(val) => handleEvent(item, 'visible-change', val)"
          @remove-tag="(val) => handleEvent(item, 'remove-tag', val)" @clear="() => handleEvent(item, 'clear')"
          @focus="(event) => handleEvent(item, 'focus', event)" @blur="(event) => handleEvent(item, 'blur', event)">
          <el-option v-for="option in item.props.options" :key="option.value" :label="option.label"
            :value="option.value" />
        </el-select>

        <!-- 日期选择器 -->
        <el-date-picker v-else-if="item.type === ComponentType.DatePicker" v-bind="item.props" />

        <!-- 数字输入框 -->
        <el-input-number v-else-if="item.type === ComponentType.InputNumber" v-bind="item.props" />
      </el-form-item>
    </el-form>

    <!-- 空状态提示 -->
    <div v-else class="empty-tip">
      <el-empty description="从左侧拖入组件开始设计表单" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.design-area {
  background: var(--el-bg-color);
  border-radius: 4px;
  box-shadow: var(--el-box-shadow-light);
  min-height: 400px;
  padding: 20px;

  :deep(.el-select) {
    width: 100%;

    .el-input {
      width: 100%;
    }
  }

  .empty-tip {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .el-form-item {
    margin-bottom: 18px;
    position: relative;
    border: 1px dashed transparent;
    padding: 8px;
    transition: all 0.3s;

    &:hover {
      border-color: var(--el-color-primary);
      cursor: pointer;

      .component-actions {
        opacity: 1;
      }
    }

    &.active {
      border-color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
    }
  }

  .component-actions {
    position: absolute;
    right: 8px;
    top: 8px;
    opacity: 0;
    transition: opacity 0.3s;
    z-index: 1;
  }

  .delete-btn {
    padding: 4px;
    border-radius: 4px;

    &:hover {
      background-color: var(--el-color-danger-light-9);
    }
  }
}
</style>