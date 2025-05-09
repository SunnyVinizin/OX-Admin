<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ComponentType, componentSizes, inputTypes, defaultRules, formatterTemplates, eventHandlerTemplates } from '../config/designer-config'
import IconSelect from './IconSelect.vue'
import { ElMessage } from 'element-plus'
import {
  Aim,
  Connection,
  Position,
  Plus,
  InfoFilled,
  Delete,
  Check,
  RefreshRight
} from '@element-plus/icons-vue'

interface ComponentItem {
  id: string
  type: ComponentType
  label: string
  field: string
  props: Record<string, any>
  required?: boolean
  rules?: any[]
  style: Record<string, any>
}

const props = defineProps<{
  component: ComponentItem | null,
  modelValue: boolean
}>()

const emit = defineEmits(['update:component', 'update:modelValue'])

// 抽屉显示状态
const drawerVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 本地组件配置状态
const localComponent = ref<ComponentItem | null>(null)

// 监听外部组件变化
watch(() => props.component, (newVal) => {
  if (newVal) {
    localComponent.value = JSON.parse(JSON.stringify(newVal))
  } else {
    localComponent.value = null
  }
}, { immediate: true, deep: true })

// 监听本地配置变化
watch(localComponent, (newVal) => {
  if (newVal) {
    emit('update:component', newVal)
  }
}, { deep: true })

// 是否为输入框组件
const isInputComponent = computed(() => {
  return localComponent.value?.type === ComponentType.Input
})

// 是否为选择器组件
const isSelectComponent = computed(() => {
  return localComponent.value?.type === ComponentType.Select
})

// 获取规则类型
const getRuleType = (rule: any) => {
  if (rule.type === 'email') return '邮箱验证'
  if (rule.type === 'url') return 'URL验证'
  if (rule.pattern !== undefined) return '手机号验证'
  if (rule.type === 'number') return '数字验证'
  if (rule.required) return '必填验证'
  return '自定义验证'
}

// 添加验证规则
const addRule = (type: string) => {
  if (!localComponent.value) return
  if (!localComponent.value.rules) {
    localComponent.value.rules = []
  }

  // 检查是否已存在相同类型的规则
  const existingRuleIndex = localComponent.value.rules.findIndex(rule => {
    if (type === 'mobile') {
      return rule.pattern !== undefined
    }
    return rule.type === type
  })

  if (existingRuleIndex === -1) {
    // 直接克隆规则对象
    const newRule = { ...defaultRules[type] }

    // 如果是手机号验证，确保正则表达式是字符串
    if (type === 'mobile' && newRule.pattern) {
      newRule.pattern = newRule.pattern.toString()
    }

    localComponent.value.rules.push(newRule)
  } else {
    ElMessage.warning('该类型的验证规则已存在')
  }
}

// 移除验证规则
const removeRule = (index: number) => {
  if (!localComponent.value?.rules) return
  localComponent.value.rules.splice(index, 1)
}

// 重置配置
const resetConfig = () => {
  if (props.component) {
    localComponent.value = JSON.parse(JSON.stringify(props.component))
  }
}

// 应用配置
const applyConfig = () => {
  if (localComponent.value) {
    emit('update:component', localComponent.value)
  }
}

// 图标选择对话框控制
const iconSelectVisible = ref(false)
const currentIconType = ref<'prefix' | 'suffix'>('prefix')

// 打开图标选择器
const openIconSelect = (type: 'prefix' | 'suffix') => {
  currentIconType.value = type
  iconSelectVisible.value = true
}

// 处理图标选择
const handleIconSelect = (iconName: string) => {
  if (!localComponent.value) return

  if (currentIconType.value === 'prefix') {
    localComponent.value.props.prefixIcon = iconName
  } else {
    localComponent.value.props.suffixIcon = iconName
  }
  iconSelectVisible.value = false
}
</script>

<template>
  <el-drawer v-model="drawerVisible" title="配置面板" size="500px" :destroy-on-close="false" :with-header="false">
    <div class="config-panel-content">
      <div class="panel-header">
        <h3 class="panel-title">配置面板</h3>
        <el-space>
          <el-button type="primary" link @click="applyConfig">
            <el-icon>
              <Check />
            </el-icon>
            应用
          </el-button>
          <el-button type="info" link @click="resetConfig">
            <el-icon>
              <RefreshRight />
            </el-icon>
            重置
          </el-button>
        </el-space>
      </div>

      <template v-if="localComponent">
        <el-scrollbar height="calc(100vh - 120px)">
          <el-form label-position="top" size="small">
            <!-- 基础信息配置 -->
            <el-form-item label="字段标识">
              <el-input v-model="localComponent.field" placeholder="请输入字段标识">
                <template #prepend>field</template>
              </el-input>
            </el-form-item>
            <el-form-item label="标签文本">
              <el-input v-model="localComponent.label" placeholder="请输入标签文本">
                <template #prepend>label</template>
              </el-input>
            </el-form-item>
            <el-form-item label="标签宽度">
              <el-input v-model="localComponent.props.labelWidth" placeholder="请输入标签宽度">
                <template #append>px</template>
              </el-input>
              <div class="text-muted">支持输入数字或带单位的值，如：100px</div>
            </el-form-item>

            <el-form-item label="组件宽度">
              <el-radio-group v-model="localComponent.style.width" class="mb-2">
                <el-radio-button label="auto">自适应</el-radio-button>
                <el-radio-button label="custom">自定义</el-radio-button>
              </el-radio-group>

              <template v-if="localComponent.style.width === 'custom'">
                <el-input-number v-model="localComponent.style.customWidth" :min="100" :max="1000" :step="10"
                  class="mt-2">
                  <template #append>px</template>
                </el-input-number>
              </template>
            </el-form-item>

            <!-- 输入框特有配置 -->
            <template v-if="isInputComponent">
              <el-divider content-position="left">基础配置</el-divider>

              <!-- 输入框类型 -->
              <el-form-item label="输入类型">
                <el-select v-model="localComponent.props.type" style="width: 100%">
                  <el-option v-for="item in inputTypes" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>

              <el-form-item label="基础配置">
                <el-space wrap>
                  <el-checkbox v-model="localComponent.props.clearable">显示清除按钮</el-checkbox>
                  <el-checkbox v-if="localComponent.props.type === 'password'"
                    v-model="localComponent.props.showPassword">
                    显示密码图标
                  </el-checkbox>
                  <el-checkbox v-model="localComponent.props.disabled">禁用</el-checkbox>
                  <el-checkbox v-model="localComponent.props.readonly">只读</el-checkbox>
                  <el-checkbox v-model="localComponent.props.autofocus">自动获取焦点</el-checkbox>
                </el-space>
              </el-form-item>

              <el-form-item label="占位文本">
                <el-input v-model="localComponent.props.placeholder" />
              </el-form-item>

              <el-form-item label="组件尺寸">
                <el-radio-group v-model="localComponent.props.size">
                  <el-radio-button v-for="item in componentSizes" :key="item.value" :label="item.value">
                    {{ item.label }}
                  </el-radio-button>
                </el-radio-group>
              </el-form-item>

              <!-- 文本域特有配置 -->
              <template v-if="localComponent.props.type === 'textarea'">
                <el-form-item label="文本域配置">
                  <el-space direction="vertical" style="width: 100%">
                    <el-form-item label="固定行数">
                      <el-input-number v-model="localComponent.props.rows" :min="2" :max="10" />
                    </el-form-item>

                    <el-form-item label="自适应高度">
                      <el-switch v-model="localComponent.props.autosize" />
                      <template v-if="localComponent.props.autosize">
                        <div class="mt-2">
                          <el-row :gutter="16">
                            <el-col :span="12">
                              <el-form-item label="最小行数">
                                <el-input-number v-model="localComponent.props.autosize.minRows" :min="1" :max="10" />
                              </el-form-item>
                            </el-col>
                            <el-col :span="12">
                              <el-form-item label="最大行数">
                                <el-input-number v-model="localComponent.props.autosize.maxRows" :min="1" :max="20" />
                              </el-form-item>
                            </el-col>
                          </el-row>
                        </div>
                      </template>
                    </el-form-item>
                  </el-space>
                </el-form-item>
              </template>

              <!-- 字符限制 -->
              <el-form-item label="字符限制">
                <el-row :gutter="16">
                  <el-col :span="12">
                    <el-form-item label="最小长度">
                      <el-input-number v-model="localComponent.props.minlength" :min="0" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="最大长度">
                      <el-input-number v-model="localComponent.props.maxlength" :min="0" />
                      <el-checkbox v-if="['text', 'textarea'].includes(localComponent.props.type)"
                        v-model="localComponent.props.showWordLimit" class="mt-2">
                        显示字数统计
                      </el-checkbox>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form-item>

              <!-- 图标配置 -->
              <template v-if="localComponent.props.type !== 'textarea'">
                <el-form-item label="图标配置">
                  <el-row :gutter="16">
                    <el-col :span="12">
                      <el-form-item label="前缀图标">
                        <el-input v-model="localComponent.props.prefixIcon" placeholder="选择图标" readonly
                          @click="openIconSelect('prefix')" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="后缀图标">
                        <el-input v-model="localComponent.props.suffixIcon" placeholder="选择图标" readonly
                          @click="openIconSelect('suffix')" />
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-form-item>
              </template>

              <!-- 验证规则 -->
              <el-divider content-position="left">验证规则</el-divider>

              <!-- 必填验证 -->
              <el-form-item>
                <el-alert type="info" :closable="false" show-icon>
                  <template #title>
                    <el-checkbox v-model="localComponent.required">设为必填字段</el-checkbox>
                  </template>
                  <template #default>
                    启用后，表单提交时会验证该字段是否已填写
                  </template>
                </el-alert>
              </el-form-item>

              <!-- 验证规则列表 -->
              <div class="rules-list">
                <div v-for="(rule, index) in localComponent.rules" :key="index" class="rule-item">
                  <el-tag closable @close="removeRule(index)">
                    {{ getRuleType(rule) }}
                  </el-tag>
                </div>
                <el-dropdown @command="addRule">
                  <el-button type="primary" link>
                    添加验证规则
                    <el-icon class="el-icon--right">
                      <Plus />
                    </el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="email">邮箱验证</el-dropdown-item>
                      <el-dropdown-item command="mobile">手机号验证</el-dropdown-item>
                      <el-dropdown-item command="url">URL验证</el-dropdown-item>
                      <el-dropdown-item command="number">数字验证</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>

            <!-- Select 组件配置 -->
            <template v-else-if="isSelectComponent">
              <el-divider content-position="left">基础配置</el-divider>

              <!-- 基础配置 -->
              <el-form-item label="基础配置">
                <el-space wrap>
                  <el-checkbox v-model="localComponent.props.clearable">显示清除按钮</el-checkbox>
                  <el-checkbox v-model="localComponent.props.multiple">多选模式</el-checkbox>
                  <el-checkbox v-model="localComponent.props.disabled">禁用</el-checkbox>
                  <el-checkbox v-model="localComponent.props.filterable">可搜索</el-checkbox>
                </el-space>
              </el-form-item>

              <!-- 多选配置 -->
              <template v-if="localComponent.props.multiple">
                <el-form-item label="多选配置">
                  <el-row :gutter="16">
                    <el-col :span="12">
                      <el-form-item label="最大选择数">
                        <el-input-number v-model="localComponent.props.multipleLimit" :min="0" :step="1" />
                        <div class="text-muted">0 表示不限制</div>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-form-item>
              </template>

              <!-- 高级配置 -->
              <el-divider content-position="left">高级配置</el-divider>

              <el-form-item label="提示文本配置">
                <el-row :gutter="16">
                  <el-col :span="12">
                    <el-form-item label="无数据提示">
                      <el-input v-model="localComponent.props.noDataText" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="无匹配提示">
                      <el-input v-model="localComponent.props.noMatchText" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form-item>

              <el-form-item label="占位文本">
                <el-input v-model="localComponent.props.placeholder" />
              </el-form-item>

              <el-form-item label="组件尺寸">
                <el-radio-group v-model="localComponent.props.size">
                  <el-radio-button v-for="item in componentSizes" :key="item.value" :label="item.value">
                    {{ item.label }}
                  </el-radio-button>
                </el-radio-group>
              </el-form-item>

              <!-- 选项配置 -->
              <el-divider content-position="left">选项配置</el-divider>

              <el-form-item>
                <template #label>
                  <el-space>
                    <span>选项列表</span>
                    <el-tooltip content="配置下拉选项的选项列表" placement="top">
                      <el-icon>
                        <InfoFilled />
                      </el-icon>
                    </el-tooltip>
                  </el-space>
                </template>

                <div v-for="(option, index) in localComponent.props.options" :key="index" class="option-item">
                  <el-row :gutter="16" class="mb-2">
                    <el-col :span="10">
                      <el-input v-model="option.label" placeholder="选项文本">
                        <template #prepend>标签</template>
                      </el-input>
                    </el-col>
                    <el-col :span="10">
                      <el-input v-model="option.value" placeholder="选项值">
                        <template #prepend>值</template>
                      </el-input>
                    </el-col>
                    <el-col :span="4">
                      <el-button type="danger" link @click="localComponent.props.options.splice(index, 1)">
                        <el-icon>
                          <Delete />
                        </el-icon>
                      </el-button>
                    </el-col>
                  </el-row>
                </div>

                <el-button type="primary" link @click="localComponent.props.options.push({ label: '', value: '' })">
                  <el-icon>
                    <Plus />
                  </el-icon>
                  添加选项
                </el-button>
              </el-form-item>

              <template v-if="localComponent.props.remote">
                <el-form-item label="加载状态">
                  <el-switch v-model="localComponent.props.loading" />
                </el-form-item>
              </template>

              <!-- 验证规则 -->
              <el-divider content-position="left">验证规则</el-divider>

              <!-- 必填验证 -->
              <el-form-item>
                <el-alert type="info" :closable="false" show-icon>
                  <template #title>
                    <el-checkbox v-model="localComponent.required">设为必填字段</el-checkbox>
                  </template>
                  <template #default>
                    启用后，表单提交时会验证该字段是否已选择
                  </template>
                </el-alert>
              </el-form-item>
            </template>
          </el-form>
        </el-scrollbar>
      </template>
      <el-empty v-else description="请选择要配置的组件" />
    </div>

    <!-- 图标选择对话框 -->
    <el-dialog v-model="iconSelectVisible" :title="`选择${currentIconType === 'prefix' ? '前缀' : '后缀'}图标`" width="600px"
      destroy-on-close>
      <IconSelect
        :model-value="currentIconType === 'prefix' ? localComponent?.props.prefixIcon : localComponent?.props.suffixIcon"
        @update:model-value="handleIconSelect" />
    </el-dialog>
  </el-drawer>
</template>

<style>
.config-panel-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--el-bg-color);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--el-border-color-light);
  padding: 16px 20px;
  background-color: var(--el-bg-color);
}

.panel-title {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.el-form {
  padding: 20px;
}

.rules-list {
  padding: 16px;
  border: 1px dashed var(--el-border-color);
  border-radius: 4px;
  background-color: var(--el-fill-color-light);
}

.rule-item {
  margin-bottom: 8px;
}

.rule-item:last-child {
  margin-bottom: 16px;
}

.option-item {
  margin-bottom: 12px;
  padding: 12px;
  border: 1px dashed var(--el-border-color-light);
  border-radius: 4px;
  background-color: var(--el-fill-color-light);
}

.option-item:hover {
  border-color: var(--el-color-primary);
}

.option-item:last-child {
  margin-bottom: 16px;
}

:deep(.el-divider__text) {
  font-size: 14px;
  font-weight: 500;
}

.text-muted {
  margin-left: 8px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

:deep(.el-form-item__label) {
  padding-bottom: 4px;
}

.icon-select-input {
  cursor: pointer;
}

.icon-select-input:hover {
  border-color: var(--el-color-primary);
}

:deep(.el-input.is-disabled .el-input__wrapper) {
  cursor: pointer;
  background-color: var(--el-fill-color-blank);
}

.mb-2 {
  margin-bottom: 8px;
}

.mt-2 {
  margin-top: 8px;
}

:deep(.el-drawer__body) {
  padding: 0;
  overflow: hidden;
}
</style>