// src/views/system/role/utils/rule.ts
import {reactive} from "vue";
import type {FormRules} from "element-plus";

export const formRules = reactive(<FormRules>{
  roleName: [{required: true, message: "角色名称为必填项", trigger: "blur"}],
  roleKey: [{required: true, message: "角色标识为必填项", trigger: "blur"}],
  dataScope: [{required: true, message: "请选择数据权限", trigger: "change"}]
});
