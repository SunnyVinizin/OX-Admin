import {reactive} from "vue";
import type {FormRules} from "element-plus";

export const formRules = reactive(<FormRules>{
  name: [{required: true, message: "流程名称为必填项", trigger: "blur"}],
  code: [{required: true, message: "流程编码为必填项", trigger: "blur"}],
  type: [{required: true, message: "流程类型为必填项", trigger: "change"}]
});
