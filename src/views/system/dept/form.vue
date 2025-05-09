<script setup lang="ts">
import {ref} from "vue";
import ReCol from "@/components/ReCol";
import {formRules} from "./utils/rule";
import {FormProps} from "./utils/types";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    parentId: 0,
    higherDeptOptions: [],
    deptName: "",
    deptCode: "",
    leader: "",
    leaderMobile: "",
    leaderEmail: "",
    rank: 99,
    status: 1,
    remark: ""
  })
});

const ruleFormRef = ref();
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
      <re-col>
        <el-form-item label="上级部门">
          <el-cascader
            v-model="newFormInline.parentId"
            class="w-full"
            :options="newFormInline.higherDeptOptions"
            :props="{
              value: 'id',
              label: 'title',
              emitPath: false,
              checkStrictly: true
            }"
            clearable
            filterable
            placeholder="请选择上级部门"
          >
            <template #default="{node, data}">
              <span>{{ data.title }}</span>
              <span v-if="!node.isLeaf">
                ({{ data.children?.length ?? 0 }})
              </span>
            </template>
          </el-cascader>
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="部门名称" prop="deptName">
          <el-input
            v-model="newFormInline.deptName"
            clearable
            placeholder="请输入部门名称"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="部门编码" prop="deptCode">
          <el-input
            v-model="newFormInline.deptCode"
            clearable
            placeholder="请输入部门编码"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="负责人">
          <el-input
            v-model="newFormInline.leader"
            clearable
            placeholder="请输入负责人"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="联系电话">
          <el-input
            v-model="newFormInline.leaderMobile"
            clearable
            placeholder="请输入联系电话"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="邮箱">
          <el-input
            v-model="newFormInline.leaderEmail"
            clearable
            placeholder="请输入邮箱"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="显示排序">
          <el-input-number
            v-model="newFormInline.rank"
            class="!w-full"
            :min="0"
            :max="9999"
            controls-position="right"
            placeholder="请输入显示排序"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="部门状态" prop="status">
          <el-radio-group v-model="newFormInline.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </re-col>

      <re-col>
        <el-form-item label="备注">
          <el-input
            v-model="newFormInline.remark"
            type="textarea"
            :rows="3"
            clearable
            placeholder="请输入备注"
          />
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>
