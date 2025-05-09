<script setup lang="ts">
import { ref } from "vue";
import ReCol from "@/components/ReCol";
import { usePublicHooks } from "@/views/system/hooks";
import { ItemFormProps } from "./utils/types";
import { itemFormRules } from "./utils/rule";
import { FormInstance } from "element-plus";

const props = withDefaults(defineProps<ItemFormProps>(), {
  formInline: () => ({
    dictId: undefined,
    label: "",
    value: "",
    sort: 0,
    status: 1,
    remark: ""
  })
});

const ruleFormRef = ref<FormInstance>();
const { switchStyle } = usePublicHooks();
const newFormInline = ref(props.formInline);

defineExpose({
  validate: (callback: (valid: boolean) => void) => {
    return ruleFormRef.value?.validate(callback);
  }
});
</script>

<template>
  <el-form ref="ruleFormRef" :model="newFormInline" :rules="itemFormRules" label-width="100px">
    <el-row :gutter="30">
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="字典标签" prop="label">
          <el-input v-model="newFormInline.label" clearable placeholder="请输入字典标签" />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="字典值" prop="value">
          <el-input v-model="newFormInline.value" clearable placeholder="请输入字典值" />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="排序号" prop="sort">
          <el-input-number v-model="newFormInline.sort" :min="0" :max="999" controls-position="right" class="w-full"
            placeholder="请输入排序号" />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="状态">
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