import type {FormRules} from "element-plus";

/** 字典类型表单校验规则 */
export const formRules: FormRules = {
  dictName: [
    {required: true, message: "字典名称不能为空", trigger: "blur"},
    {min: 2, max: 100, message: "长度在 2 到 100 个字符", trigger: "blur"}
  ],
  dictType: [
    {required: true, message: "字典类型不能为空", trigger: "blur"},
    {min: 2, max: 100, message: "长度在 2 到 100 个字符", trigger: "blur"},
    {
      pattern: /^[a-z][a-z0-9_]*$/,
      message: "只能包含小写字母、数字和下划线，且必须以字母开头",
      trigger: "blur"
    }
  ]
};

/** 字典项表单校验规则 */
export const itemFormRules: FormRules = {
  label: [
    {required: true, message: "字典标签不能为空", trigger: "blur"},
    {min: 1, max: 100, message: "长度在 1 到 100 个字符", trigger: "blur"}
  ],
  value: [
    {required: true, message: "字典值不能为空", trigger: "blur"},
    {min: 1, max: 100, message: "长度在 1 到 100 个字符", trigger: "blur"}
  ],
  sort: [{required: true, message: "排序号不能为空", trigger: "blur"}]
};
