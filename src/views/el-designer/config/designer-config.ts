// 组件类型枚举
export enum ComponentType {
  Input = "input",
  InputNumber = "input-number",
  Select = "select",
  DatePicker = "date-picker",
  TimePicker = "time-picker",
  Upload = "upload",
  Radio = "radio",
  Checkbox = "checkbox",
  Switch = "switch",
  Slider = "slider",
  Rate = "rate",
  ColorPicker = "color-picker",
  Transfer = "transfer",
  Table = "table"
}

// 组件基础接口
interface ComponentConfig {
  type: ComponentType;
  label: string;
  icon: string;
  category: "basic" | "advanced" | "layout";
  props: Record<string, any>;
  style?: Record<string, any>;
  defaultValue?: any;
  required?: boolean;
  rules?: any[];
  events?: Record<string, Function>;
}

// 表单字段配置接口
export interface FormFieldConfig {
  name: string;
  label: string;
  type: ComponentType;
  required?: boolean;
  props?: Record<string, any>;
  defaultValue?: any;
  rules?: any[];
  events?: Record<string, Function>;
  calculateType?: string;
  children?: FormFieldConfig[];
}

// 表单组件配置
export const formComponents: ComponentConfig[] = [
  {
    type: ComponentType.Input,
    label: "输入框",
    icon: "Edit",
    category: "basic",
    props: {
      type: "text",
      modelValue: "",
      maxlength: undefined,
      minlength: undefined,
      showWordLimit: false,
      placeholder: "请输入",
      clearable: false,
      showPassword: false,
      disabled: false,
      size: "default",
      prefixIcon: "",
      suffixIcon: "",
      rows: 2,
      autosize: false,
      resize: undefined,
      slots: {
        prefix: "",
        suffix: "",
        prepend: "",
        append: ""
      },
      labelWidth: "100px"
    },
    style: {
      width: "auto",
      customWidth: 200,
      textAlign: "left",
      marginX: 0,
      marginY: 0,
      customClass: "",
      customStyle: ""
    },
    defaultValue: "",
    required: false,
    rules: []
  },
  {
    type: ComponentType.Select,
    label: "下拉选择",
    icon: "Select",
    category: "basic",
    props: {
      modelValue: "",
      placeholder: "请选择",
      clearable: true,
      multiple: false,
      disabled: false,
      size: "default",
      filterable: false,
      options: [],
      remote: false,
      remoteMethod: null,
      loading: false,
      multipleLimit: 0,
      teleported: true,
      persistent: true,
      noDataText: "暂无数据",
      noMatchText: "无匹配数据",
      valueKey: "value",
      labelWidth: "100px"
    },
    style: {
      width: "auto",
      customWidth: 200,
      marginX: 0,
      marginY: 0,
      customClass: "",
      customStyle: ""
    },
    defaultValue: "",
    required: false,
    rules: []
  }
];

// 组件属性分类
export const componentProps = {
  [ComponentType.Input]: {
    base: [
      "type",
      "placeholder",
      "clearable",
      "maxlength",
      "showWordLimit",
      "disabled",
      "size"
    ],
    advanced: ["prefixIcon", "suffixIcon", "rows", "autosize", "readonly"],
    rules: ["required", "pattern", "min", "max"]
  },
  [ComponentType.Select]: {
    base: [
      "placeholder",
      "clearable",
      "multiple",
      "disabled",
      "size",
      "options"
    ],
    advanced: [
      "filterable",
      "allowCreate",
      "defaultFirstOption",
      "remote",
      "remoteMethod",
      "loading"
    ],
    rules: ["required"]
  }
};

// 默认验证规则
export const defaultRules = {
  required: {required: true, message: "该字段为必填项", trigger: "blur"},
  email: {type: "email", message: "请输入正确的邮箱地址", trigger: "blur"},
  mobile: {
    pattern: "^1[3-9]\\d{9}$",
    message: "请输入正确的手机号码",
    trigger: "blur"
  },
  url: {type: "url", message: "请输入正确的URL地址", trigger: "blur"},
  number: {type: "number", message: "请输入数字", trigger: "blur"}
};

// 组件尺寸选项
export const componentSizes = [
  {label: "默认", value: "default"},
  {label: "大号", value: "large"},
  {label: "小号", value: "small"}
];

// 输入框类型选项
export const inputTypes = [
  {label: "文本", value: "text"},
  {label: "密码", value: "password"},
  {label: "文本域", value: "textarea"},
  {label: "邮箱", value: "email"},
  {label: "网址", value: "url"},
  {label: "电话", value: "tel"}
];

// 日期选择器类型选项
export const datePickerTypes = [
  {label: "日期", value: "date"},
  {label: "日期时间", value: "datetime"},
  {label: "年份", value: "year"},
  {label: "月份", value: "month"},
  {label: "周", value: "week"},
  {label: "多日期", value: "dates"},
  {label: "日期范围", value: "daterange"},
  {label: "日期时间范围", value: "datetimerange"}
];

// 表单配置转换器（将设计器配置转换为templates格式）
export const convertToTemplateFormat = (formConfig: any): FormFieldConfig[] => {
  return formConfig.components.map((component: any) => ({
    name: component.field,
    label: component.label,
    type: component.type,
    required: component.required || false,
    props: JSON.stringify(component.props),
    defaultValue: component.defaultValue,
    rules: component.rules,
    events: component.events,
    calculateType: component.calculateType
  }));
};

// 模板配置转换器（将templates格式转换为设计器配置）
export const convertFromTemplateFormat = (fields: FormFieldConfig[]): any => {
  return {
    components: fields.map(field => ({
      id: `${field.type}_${Date.now()}`,
      field: field.name,
      type: field.type,
      label: field.label,
      required: field.required,
      props:
        typeof field.props === "string" ? JSON.parse(field.props) : field.props,
      defaultValue: field.defaultValue,
      rules: field.rules,
      events: field.events,
      calculateType: field.calculateType
    }))
  };
};

// 预设格式化函数模板
export const formatterTemplates = {
  // 数字格式化
  number: {
    label: "数字格式化",
    formatter: (value: string) => {
      if (!value) return value;
      return value.replace(/[^\d]/g, "");
    },
    parser: (value: string) => value
  },
  // 金额格式化
  currency: {
    label: "金额格式化",
    formatter: (value: string) => {
      if (!value) return value;
      // 保留两位小数，添加千分位
      const num = parseFloat(value);
      if (isNaN(num)) return value;
      return num.toLocaleString("zh-CN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    },
    parser: (value: string) => value.replace(/[^\d.]/g, "")
  },
  // 手机号格式化
  phone: {
    label: "手机号格式化",
    formatter: (value: string) => {
      if (!value) return value;
      const phone = value.replace(/[^\d]/g, "");
      if (phone.length >= 11) {
        return `${phone.slice(0, 3)} ${phone.slice(3, 7)} ${phone.slice(7, 11)}`;
      }
      return phone;
    },
    parser: (value: string) => value.replace(/[^\d]/g, "")
  },
  // 身份证格式化
  idCard: {
    label: "身份证格式化",
    formatter: (value: string) => {
      if (!value) return value;
      const id = value.replace(/[^\dXx]/g, "");
      if (id.length >= 18) {
        return `${id.slice(0, 6)} ${id.slice(6, 14)} ${id.slice(14, 18)}`;
      }
      return id;
    },
    parser: (value: string) => value.replace(/[^\dXx]/g, "")
  },
  // 大写转换
  uppercase: {
    label: "大写转换",
    formatter: (value: string) => value?.toUpperCase(),
    parser: (value: string) => value
  },
  // 小写转换
  lowercase: {
    label: "小写转换",
    formatter: (value: string) => value?.toLowerCase(),
    parser: (value: string) => value
  }
};

// 预设事件处理模板
export const eventHandlerTemplates = {
  // 输入事件
  input: {
    label: "输入事件",
    handler: 'function(value) {\n  console.log("输入值:", value)\n}'
  },
  // 值改变事件
  change: {
    label: "值改变事件",
    handler: 'function(value) {\n  console.log("值改变:", value)\n}'
  },
  // 获得焦点事件
  focus: {
    label: "获得焦点",
    handler: 'function(event) {\n  console.log("获得焦点")\n}'
  },
  // 失去焦点事件
  blur: {
    label: "失去焦点",
    handler: 'function(event) {\n  console.log("失去焦点")\n}'
  },
  // 按键事件
  keydown: {
    label: "按键按下",
    handler: 'function(event) {\n  console.log("按键按下:", event.key)\n}'
  },
  // 清除事件
  clear: {
    label: "清除内容",
    handler: 'function() {\n  console.log("内容已清除")\n}'
  }
};
