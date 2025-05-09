<script setup lang="ts">
import { ref } from "vue";
import ReCol from "@/components/ReCol";
import { usePublicHooks } from "@/views/system/hooks";
import { FormProps } from "./utils/types";
import { formRules } from "./utils/rule";
import type { FormInstance } from "element-plus";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    dictName: "",
    dictType: "",
    status: 1,
    remark: ""
  })
});

const formRef = ref<FormInstance>();
const { switchStyle } = usePublicHooks();
const newFormInline = ref(props.formInline);

// 暴露验证方法
defineExpose({
  validate: (callback: (valid: boolean) => void) => {
    return formRef.value?.validate(callback);
  }
});
</script>

<template>
  <el-form ref="formRef" :model="newFormInline" :rules="formRules" label-width="100px" @submit.prevent>
    <el-row :gutter="30">
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="字典名称" prop="dictName">
          <el-input v-model="newFormInline.dictName" clearable placeholder="请输入字典名称" />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="字典类型" prop="dictType">
          <el-input v-model="newFormInline.dictType" clearable placeholder="请输入字典类型" />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="字典状态">
          <el-switch v-model="newFormInline.status" inline-prompt :active-value="1" :inactive-value="-1"
            active-text="启用" inactive-text="停用" :style="switchStyle" />
        </el-form-item>
      </re-col>

      <re-col>
        <el-form-item label="备注">
          <el-input v-model="newFormInline.remark" type="textarea" :rows="3" placeholder="请输入备注信息" />
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>