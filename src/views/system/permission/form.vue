<script setup lang="ts">
import {ref} from "vue";
import ReCol from "@/components/ReCol";
import {usePublicHooks} from "@/views/system/hooks";
import {FormProps} from "./utils/types";
import {formRules} from "./utils/rule";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    menuId: undefined,
    menuOptions: [],
    permissionKey: "",
    permissionName: "",
    status: 1
  })
});

const ruleFormRef = ref();
const {switchStyle} = usePublicHooks();
const newFormInline = ref(props.formInline);

function getRef() {
  return ruleFormRef.value;
}

defineExpose({getRef});
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="formRules"
    label-width="82px"
  >
    <el-row :gutter="30">
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="关联菜单" prop="menuId">
          <el-select
            v-model="newFormInline.menuId"
            class="w-full"
            placeholder="请选择关联菜单"
          >
            <el-option
              v-for="item in newFormInline.menuOptions"
              :key="item.id"
              :label="item.title"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="权限名称" prop="permissionName">
          <el-input
            v-model="newFormInline.permissionName"
            clearable
            placeholder="请输入权限名称"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="权限标识" prop="permissionKey">
          <el-input
            v-model="newFormInline.permissionKey"
            clearable
            placeholder="请输入权限标识"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="权限状态">
          <el-switch
            v-model="newFormInline.status"
            inline-prompt
            :active-value="1"
            :inactive-value="0"
            active-text="启用"
            inactive-text="停用"
            :style="switchStyle"
          />
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>
