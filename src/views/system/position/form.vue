<script setup lang="ts">
import { ref } from "vue";
import ReCol from "@/components/ReCol";
import { usePublicHooks } from "@/views/system/hooks";
import { FormProps } from "@/views/system/position/utils/types";
import { formRules } from "@/views/system/position/utils/rule";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    positionName: "",
    positionCode: "",
    deptId: undefined,
    deptOptions: [],
    rank: 99,
    status: 1,
    remark: ""
  })
});

const ruleFormRef = ref();
const { switchStyle } = usePublicHooks();
const newFormInline = ref(props.formInline);

function getRef() {
  return ruleFormRef.value;
}

defineExpose({ getRef });
</script>

<template>
  <el-form ref="ruleFormRef" :model="newFormInline" :rules="formRules" label-width="82px">
    <el-row :gutter="30">
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="岗位名称" prop="positionName">
          <el-input v-model="newFormInline.positionName" clearable placeholder="请输入岗位名称" />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="岗位编码" prop="positionCode">
          <el-input v-model="newFormInline.positionCode" clearable placeholder="请输入岗位编码" />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="所属部门" prop="deptId">
          <el-cascader v-model="newFormInline.deptId" :options="newFormInline.deptOptions" :props="{
            value: 'id',
            label: 'deptName',
            emitPath: false,
            checkStrictly: true
          }" clearable placeholder="请选择所属部门" />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="岗位排序" prop="rank">
          <el-input-number v-model="newFormInline.rank" :min="0" :max="999" controls-position="right" class="w-full"
            placeholder="请输入排序号" />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="岗位状态">
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