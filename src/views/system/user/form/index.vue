<script setup lang="ts">
import { computed, ref, watch } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "../utils/rule";
import { FormProps } from "../utils/types";
import { usePublicHooks } from "../../hooks";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    title: "新增",
    higherDeptOptions: [],
    positions: [], // 所有岗位列表
    primaryPositionId: undefined, // 主岗位ID
    positionIds: [], // 副岗位ID列表
    deptIds: [],
    roleIds: [],
    nickname: "",
    username: "",
    password: "",
    mobile: "",
    email: "",
    avatar: "",
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


// 根据选择的部门过滤岗位
const filteredPositions = computed(() => {
  if (!newFormInline.value?.deptIds?.length) return [];
  if (!newFormInline.value?.positions) return [];

  return newFormInline.value.positions.filter(position =>
    newFormInline.value.deptIds.includes(position.deptId)
  );
});

// 排除主岗位的可选副岗位列表
const filteredPositionsExcludePrimary = computed(() => {
  return filteredPositions.value.filter(
    position => position.id !== newFormInline.value.primaryPositionId
  );
});

// 监听主岗位变化
watch(() => newFormInline.value.primaryPositionId, (newVal) => {
  // 如果新的主岗位在副岗位中已选，则从副岗位中移除
  if (newVal && newFormInline.value.positionIds.includes(newVal)) {
    newFormInline.value.positionIds = newFormInline.value.positionIds
      .filter(id => id !== newVal);
  }
});

// 部门变更时处理岗位选择
const handleDeptChange = (deptIds: number[]) => {
  // 清空已选岗位
  newFormInline.value.primaryPositionId = undefined;
  newFormInline.value.positionIds = [];
};

defineExpose({ getRef });
</script>

<template>
  <el-form ref="ruleFormRef" :model="newFormInline" :rules="formRules" label-width="82px">
    <el-row :gutter="30">
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="用户名称" prop="username">
          <el-input v-model="newFormInline.username" clearable placeholder="请输入用户名称"
            :disabled="newFormInline.title !== '新增'" />
        </el-form-item>
      </re-col>

      <re-col v-if="newFormInline.title === '新增'" :value="12" :xs="24" :sm="24">
        <el-form-item label="用户密码" prop="password">
          <el-input v-model="newFormInline.password" clearable type="password" show-password placeholder="请输入用户密码" />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="用户昵称" prop="nickname">
          <el-input v-model="newFormInline.nickname" clearable placeholder="请输入用户昵称" />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="newFormInline.mobile" clearable placeholder="请输入手机号" />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="newFormInline.email" clearable placeholder="请输入邮箱" />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="归属部门" prop="deptIds">
          <el-cascader v-model="newFormInline.deptIds" class="w-full" :options="newFormInline.higherDeptOptions" :props="{
            value: 'id',
            label: 'deptName',
            children: 'children',
            multiple: true,
            emitPath: false,
            checkStrictly: true
          }" clearable filterable placeholder="请选择归属部门" @change="handleDeptChange">
            <template #default="{ node, data }">
              <span>{{ data.deptName }}</span>
              <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
            </template>
          </el-cascader>
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="主岗位" prop="primaryPositionId">
          <el-select v-model="newFormInline.primaryPositionId" class="w-full" clearable
            :disabled="!newFormInline.deptIds?.length" placeholder="请选择主岗位">
            <el-option v-for="item in filteredPositions" :key="item.id" :label="item.positionName" :value="item.id" />
          </el-select>
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="副岗位" prop="positionIds">
          <el-select v-model="newFormInline.positionIds" class="w-full" multiple clearable
            :disabled="!newFormInline.deptIds?.length" placeholder="请选择副岗位">
            <el-option v-for="item in filteredPositionsExcludePrimary" :key="item.id" :label="item.positionName"
              :value="item.id" />
          </el-select>
        </el-form-item>
      </re-col>

      <re-col v-if="newFormInline.title === '新增'" :value="12" :xs="24" :sm="24">
        <el-form-item label="用户状态">
          <el-switch v-model="newFormInline.status" inline-prompt :active-value="1" :inactive-value="0" active-text="启用"
            inactive-text="停用" :style="switchStyle" />
        </el-form-item>
      </re-col>

      <re-col>
        <el-form-item label="备注">
          <el-input v-model="newFormInline.remark" placeholder="请输入备注信息" type="textarea" />
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>
