import {reactive} from "vue";
import type {FormRules} from "element-plus";

export const formRules = reactive(<FormRules>{
  menuId: [{required: true, message: "关联菜单为必选项", trigger: "change"}],
  permissionKey: [
    {required: true, message: "权限标识为必填项", trigger: "blur"}
  ],
  permissionName: [
    {required: true, message: "权限名称为必填项", trigger: "blur"}
  ]
});
