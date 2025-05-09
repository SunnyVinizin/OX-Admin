import {reactive} from "vue";
import type {FormRules} from "element-plus";

export const formRules = reactive(<FormRules>{
  deptName: [{required: true, message: "部门名称为必填项", trigger: "blur"}],
  deptCode: [{required: true, message: "部门编码为必填项", trigger: "blur"}],
  status: [{required: true, message: "状态为必填项", trigger: "change"}]
});
