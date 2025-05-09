import {reactive} from "vue";
import type {FormRules} from "element-plus";

export const formRules = reactive(<FormRules>{
  positionName: [
    {required: true, message: "岗位名称为必填项", trigger: "blur"}
  ],
  positionCode: [
    {required: true, message: "岗位编码为必填项", trigger: "blur"}
  ],
  deptId: [{required: true, message: "所属部门为必选项", trigger: "change"}]
});
