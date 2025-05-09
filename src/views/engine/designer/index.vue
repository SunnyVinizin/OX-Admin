<script setup lang="ts">
import { ref, nextTick, watch } from 'vue';
import FlowDesigner from '@/components/FlowDesigner.vue';
import { workflowTypeOptions } from '@/views/engine/workflow/utils/enums';
import { WorkflowType } from '@/views/engine/workflow/utils/types';
import { formTemplates } from "@/views/engine/workflow/utils/templates";

const flowDesigner = ref();
const workflowType = ref<WorkflowType>(WorkflowType.LEAVE);
const workflowName = ref('');
const workflowDescription = ref('');
const workflowCode = ref('');

// 处理详情数据
const handleDetailData = (detail: any) => {
  if (!detail) return;

  // 设置基本信息
  workflowName.value = detail.name;
  workflowCode.value = detail.code;
  workflowDescription.value = detail.description;
  workflowType.value = detail.type;

  // 处理节点数据
  if (detail.nodes && detail.nodes.length) {
    nextTick(() => {
      flowDesigner.value?.loadTemplate(detail.nodes);
    });
  }
}

// 接收编辑数据的props
const props = defineProps<{
  detail?: any;
  isEdit?: boolean;
}>();

// 监听详情数据变化
watch(() => props.detail, (newVal) => {
  if (newVal && props.isEdit) {
    handleDetailData(newVal);
  } else {
    // 重置
    workflowName.value = '';
    workflowCode.value = '';
    workflowDescription.value = '';
    workflowType.value = WorkflowType.LEAVE;
    flowDesigner.value?.reset();
  }
}, { immediate: true });

// 保存流程
const handleSave = async () => {
  try {
    // 获取流程模板 - 直接使用设计器的模板数据，不再进行节点处理
    const template = flowDesigner.value.getTemplate();

    // 添加基本信息
    const flowData = {
      name: workflowName.value,
      type: workflowType.value,
      description: workflowDescription.value,
      code: workflowCode.value,
      status: 1,
      formConfig: {
        fields: formTemplates[workflowType.value].fields
      },
      nodes: template
    }

    return flowData;
  } catch (error) {
    throw error;
  }
}

// 暴露方法给父组件
defineExpose({
  handleSave
});
</script>

<template>
  <div class="workflow-designer">
    <div class="designer-header">
      <el-form :inline="true" class="w-full">
        <div class="flex items-center justify-between w-full">
          <div class="flex-1 flex items-center gap-4">
            <el-form-item label="流程名称" required>
              <el-input v-model="workflowName" placeholder="请输入流程名称" clearable class="!w-[180px]" />
            </el-form-item>
            <el-form-item label="流程编码" required>
              <el-input v-model="workflowCode" placeholder="请输入流程编码" clearable class="!w-[180px]" />
            </el-form-item>
            <el-form-item label="流程类型" required>
              <el-select v-model="workflowType" placeholder="请选择流程类型" clearable class="!w-[180px]">
                <el-option v-for="item in workflowTypeOptions" :key="item.value" :label="item.label"
                  :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="流程说明" class="flex-1">
              <el-input v-model="workflowDescription" type="textarea" :rows="1" placeholder="请输入流程说明" clearable
                class="!w-[300px]" />
            </el-form-item>
          </div>
          <!-- <div class="flex items-center">
            <el-form-item class="!mb-0">
              <el-button type="primary" @click="handleSave">保存流程</el-button>
            </el-form-item>
          </div> -->
        </div>
      </el-form>
    </div>

    <div class="designer-content">
      <FlowDesigner ref="flowDesigner" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.workflow-designer {
  @apply flex flex-col h-full;

  .designer-header {
    @apply p-4 border-b;

    :deep(.el-form-item) {
      @apply mb-0;
    }

    :deep(.el-form-item__label) {
      @apply font-medium;
    }
  }

  .designer-content {
    @apply flex-1;
  }
}
</style>