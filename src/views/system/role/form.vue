<!-- src/views/system/role/form.vue -->
<script setup lang="ts">
import { ref, watch } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";
import { usePublicHooks } from "@/views/system/hooks";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    roleName: "",
    roleKey: "",
    status: 1,
    remark: "",
    menuIds: [],
    dataScope: 1,
    deptIds: [],
    deptOptions: []
  })
});

const dataScopeOptions = [
  { label: "全部数据", value: 1 },
  { label: "本部门及以下", value: 2 },
  { label: "本部门", value: 3 },
  { label: "仅本人", value: 4 },
  { label: "自定义部门", value: 5 }
];

const ruleFormRef = ref();
const { switchStyle } = usePublicHooks();
const newFormInline = ref(props.formInline);

function getRef() {
  return ruleFormRef.value;
}

// 监听数据权限变化
watch(
  () => newFormInline.value.dataScope,
  (val) => {
    if (val !== 5) {
      newFormInline.value.deptIds = [];
    }
  }
);

defineExpose({ getRef });
</script>

<template>
  <el-form ref="ruleFormRef" :model="newFormInline" :rules="formRules" label-width="82px">
    <el-row :gutter="30">
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="newFormInline.roleName" clearable placeholder="请输入角色名称" />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="角色标识" prop="roleKey">
          <el-input v-model="newFormInline.roleKey" clearable placeholder="请输入角色标识" />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="数据权限" prop="dataScope">
          <el-select v-model="newFormInline.dataScope" placeholder="请选择数据权限" class="w-full">
            <el-option v-for="item in dataScopeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </re-col>

      <re-col v-if="newFormInline.dataScope === 5" :value="24">
        <el-form-item label="指定部门" prop="deptIds">
          <el-tree-select v-model="newFormInline.deptIds" :data="newFormInline.deptOptions" multiple show-checkbox
            node-key="id" :props="{
              label: 'deptName',
              children: 'children'
            }" placeholder="请选择部门" class="w-full" />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="角色状态">
          <el-switch v-model="newFormInline.status" inline-prompt :active-value="1" :inactive-value="0" active-text="启用"
            inactive-text="停用" :style="switchStyle" />
        </el-form-item>
      </re-col>

      <re-col>
        <el-form-item label="备注">
          <el-input v-model="newFormInline.remark" type="textarea" placeholder="请输入备注信息" />
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>