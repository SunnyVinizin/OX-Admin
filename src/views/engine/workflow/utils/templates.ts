import {message} from "@/utils/message";
import {FormTemplateType, NodeType} from "./types";

// 计算类型枚举
export enum CalculateType {
  LEAVE_DAYS = "leaveDays", // 请假天数
  OVERTIME_HOURS = "overtimeHours", // 加班时长
  BUSINESS_DAYS = "businessDays", // 出差天数
  WORK_HOURS = "workHours" // 工作时长
}

// 预设的表单模板
export const formTemplates = {
  [FormTemplateType.LEAVE]: {
    fields: [
      {
        name: "leaveType",
        label: "请假类型",
        type: "el-select",
        required: true,
        props: JSON.stringify({
          options: [
            {label: "年假", value: "annual"},
            {label: "事假", value: "personal"},
            {label: "病假", value: "sick"}
          ]
        })
      },
      {
        name: "dateRange",
        label: "请假时间",
        type: "el-date-picker",
        required: false,
        calculateType: CalculateType.LEAVE_DAYS,
        props: JSON.stringify({
          type: "daterange",
          startPlaceholder: "开始日期",
          endPlaceholder: "结束日期",
          valueFormat: "YYYY-MM-DD"
        })
      },
      {
        name: "duration",
        label: "请假天数",
        type: "el-input-number",
        required: true,
        props: JSON.stringify({
          min: 0.1, // 最小值改为 0.1
          max: 30,
          step: 0.1, // 步进值改为 0.1
          precision: 1, // 添加精度限制，只保留一位小数
          disabled: true,
          controls: false // 可选：隐藏上下调节按钮
        })
      },
      {
        name: "reason",
        label: "请假原因",
        type: "el-input",
        required: true,
        props: JSON.stringify({
          type: "textarea",
          maxlength: 200,
          showWordLimit: true
        })
      },
      {
        name: "attachments",
        label: "附件",
        type: "el-upload",
        required: false,
        props: JSON.stringify({
          action: "/api/upload/file", // 上传接口地址
          multiple: true, // 支持多文件
          limit: 5, // 最多5个文件
          accept: ".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar", // 支持的文件类型
          headers: {
            "Content-Type": "multipart/form-data"
          },
          // 上传前的钩子
          beforeUpload: (file: File) => {
            // 文件大小限制(10MB)
            const isLt10M = file.size / 1024 / 1024 < 10;
            if (!isLt10M) {
              message("文件大小不能超过 10MB!", {type: "error"});
              return false;
            }
            return true;
          },
          // 上传成功的回调
          onSuccess: (response: any) => {
            if (response.success) {
              message("上传成功", {type: "success"});
            }
          },
          // 上传失败的回调
          onError: () => {
            message("上传失败", {type: "error"});
          },
          tip: "支持常用办公文件格式，单个文件不超过10MB，最多上传5个文件"
        })
      }
    ]
  },
  [FormTemplateType.OVERTIME]: {
    fields: [
      {
        name: "dateTime",
        label: "加班时间",
        type: "el-date-picker",
        required: true,
        calculateType: CalculateType.OVERTIME_HOURS,
        props: JSON.stringify({
          type: "datetimerange", // 使用日期时间范围选择器
          startPlaceholder: "开始时间",
          endPlaceholder: "结束时间",
          valueFormat: "YYYY-MM-DD HH:mm:ss", // 设置日期时间格式
          defaultTime: ["09:00:00", "18:00:00"], // 默认时间
          disabledDate: time => {
            return time.getTime() < Date.now() - 24 * 60 * 60 * 1000; // 只能选择今天和未来的日期
          }
        })
      },
      {
        name: "duration",
        label: "加班时长(小时)",
        type: "el-input-number",
        required: true,
        props: JSON.stringify({
          min: 0.5,
          max: 24,
          step: 0.5,
          precision: 1,
          disabled: true,
          controls: false
        })
      },
      {
        name: "reason",
        label: "加班事由",
        type: "el-input",
        required: true,
        props: JSON.stringify({
          type: "textarea",
          maxlength: 200,
          showWordLimit: true
        })
      },
      {
        name: "attachments",
        label: "附件",
        type: "el-upload",
        required: false,
        props: JSON.stringify({
          action: "/api/upload/file", // 上传接口地址
          multiple: true, // 支持多文件
          limit: 5, // 最多5个文件
          accept: ".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar", // 支持的文件类型
          headers: {
            "Content-Type": "multipart/form-data"
          },
          // 上传前的钩子
          beforeUpload: (file: File) => {
            // 文件大小限制(10MB)
            const isLt10M = file.size / 1024 / 1024 < 10;
            if (!isLt10M) {
              message("文件大小不能超过 10MB!", {type: "error"});
              return false;
            }
            return true;
          },
          // 上传成功的回调
          onSuccess: (response: any) => {
            if (response.success) {
              message("上传成功", {type: "success"});
            }
          },
          // 上传失败的回调
          onError: () => {
            message("上传失败", {type: "error"});
          },
          tip: "支持常用办公文件格式，单个文件不超过10MB，最多上传5个文件"
        })
      }
    ]
  },
  [FormTemplateType.BUSINESS]: {
    fields: [
      {
        name: "dateRange",
        label: "外出时间",
        type: "el-date-picker",
        required: true,
        calculateType: CalculateType.LEAVE_DAYS, // 复用请假天数的计算类型
        props: JSON.stringify({
          type: "daterange",
          startPlaceholder: "开始日期",
          endPlaceholder: "结束日期",
          valueFormat: "YYYY-MM-DD"
        })
      },
      {
        name: "duration",
        label: "外出天数",
        type: "el-input-number",
        required: true,
        props: JSON.stringify({
          min: 0.5,
          max: 30,
          step: 0.5,
          precision: 1,
          disabled: true,
          controls: false
        })
      },
      {
        name: "reason",
        label: "外出事由", // 修改标签文本
        type: "el-input",
        required: true,
        props: JSON.stringify({
          type: "textarea",
          maxlength: 200,
          showWordLimit: true
        })
      },
      {
        name: "location",
        label: "外出地点", // 修改标签文本
        type: "el-input",
        required: true,
        props: JSON.stringify({
          type: "text",
          maxlength: 100
        })
      },
      {
        name: "contactInfo", // 新增联系方式字段
        label: "紧急联系方式",
        type: "el-input",
        required: true,
        props: JSON.stringify({
          type: "text",
          maxlength: 20,
          placeholder: "请输入紧急联系电话"
        })
      },
      {
        name: "attachments",
        label: "附件",
        type: "el-upload",
        required: false,
        props: JSON.stringify({
          action: "/api/upload/file",
          multiple: true,
          limit: 5,
          accept: ".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar",
          headers: {
            "Content-Type": "multipart/form-data"
          },
          beforeUpload: (file: File) => {
            const isLt10M = file.size / 1024 / 1024 < 10;
            if (!isLt10M) {
              message("文件大小不能超过 10MB!", {type: "error"});
              return false;
            }
            return true;
          },
          onSuccess: (response: any) => {
            if (response.success) {
              message("上传成功", {type: "success"});
            }
          },
          onError: () => {
            message("上传失败", {type: "error"});
          },
          tip: "支持常用办公文件格式，单个文件不超过10MB，最多上传5个文件"
        })
      }
    ]
  },
  [FormTemplateType.EXPENSE]: {
    fields: [
      {
        name: "expenseType",
        label: "费用类型",
        type: "el-select",
        required: true,
        props: JSON.stringify({
          options: [
            {label: "机票", value: "air_ticket"},
            {label: "火车票", value: "train_ticket"},
            {label: "的士费", value: "taxi"},
            {label: "住宿费", value: "hotel"},
            {label: "餐饮费", value: "meals"},
            {label: "礼品费", value: "gift"},
            {label: "活动费", value: "activity"},
            {label: "通讯费", value: "communication"},
            {label: "补助", value: "allowance"},
            {label: "其他", value: "others"}
          ]
        })
      },
      {
        name: "amount",
        label: "报销金额",
        type: "el-input-number",
        required: true,
        props: JSON.stringify({
          min: 0,
          precision: 2,
          step: 100,
          placeholder: "请输入报销金额"
        })
      },
      {
        name: "expenseDate",
        label: "费用发生日期",
        type: "el-date-picker",
        required: true,
        disablePast: false, // 报销单可以选择过去的日期
        props: JSON.stringify({
          type: "date",
          placeholder: "选择日期",
          valueFormat: "YYYY-MM-DD"
        })
      },
      {
        name: "reason",
        label: "报销事由",
        type: "el-input",
        required: true,
        props: JSON.stringify({
          type: "textarea",
          maxlength: 200,
          showWordLimit: true,
          placeholder: "请输入报销事由"
        })
      },
      {
        name: "attachments",
        label: "附件",
        type: "el-upload",
        required: false,
        props: JSON.stringify({
          action: "/api/upload/file", // 上传接口地址
          multiple: true, // 支持多文件
          limit: 5, // 最多5个文件
          accept: ".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar", // 支持的文件类型
          headers: {
            "Content-Type": "multipart/form-data"
          },
          // 上传前的钩子
          beforeUpload: (file: File) => {
            // 文件大小限制(10MB)
            const isLt10M = file.size / 1024 / 1024 < 10;
            if (!isLt10M) {
              message("文件大小不能超过 10MB!", {type: "error"});
              return false;
            }
            return true;
          },
          // 上传成功的回调
          onSuccess: (response: any) => {
            if (response.success) {
              message("上传成功", {type: "success"});
            }
          },
          // 上传失败的回调
          onError: () => {
            message("上传失败", {type: "error"});
          },
          tip: "支持常用办公文件格式，单个文件不超过10MB，最多上传5个文件"
        })
      }
    ]
  },
  [FormTemplateType.PURCHASE]: {
    fields: [
      {
        name: "purchaseType",
        label: "采购类型",
        type: "el-select",
        required: true,
        props: JSON.stringify({
          options: [
            {label: "办公用品", value: "office"},
            {label: "电子设备", value: "electronics"},
            {label: "软件服务", value: "software"},
            {label: "生产物料", value: "materials"},
            {label: "其他", value: "others"}
          ],
          placeholder: "请选择采购类型"
        })
      },
      {
        name: "budgetNo",
        label: "预算编号",
        type: "el-input",
        required: false,
        props: JSON.stringify({
          placeholder: "请输入预算编号(如有)",
          maxlength: 50
        })
      },
      {
        name: "itemList",
        label: "采购清单",
        type: "el-table",
        required: true,
        props: JSON.stringify({
          columns: [
            {
              label: "物品名称",
              prop: "name",
              required: true,
              type: "input",
              width: "180px",
              placeholder: "请输入物品名称"
            },
            {
              label: "规格型号",
              prop: "spec",
              type: "input",
              width: "150px",
              placeholder: "请输入规格型号"
            },
            {
              label: "单位",
              prop: "unit",
              required: true,
              type: "select",
              width: "100px",
              options: [
                {label: "个", value: "piece"},
                {label: "套", value: "set"},
                {label: "箱", value: "box"},
                {label: "台", value: "unit"},
                {label: "件", value: "item"},
                {label: "其他", value: "other"}
              ]
            },
            {
              label: "数量",
              prop: "quantity",
              required: true,
              type: "number",
              width: "100px",
              min: 1,
              precision: 0
            },
            {
              label: "预估单价",
              prop: "price",
              required: true,
              type: "number",
              width: "120px",
              min: 0,
              precision: 2,
              prefix: "¥"
            },
            {
              label: "预估总价",
              prop: "total",
              width: "120px",
              compute: "quantity * price",
              disabled: true,
              prefix: "¥"
            },
            {
              label: "备注",
              prop: "remark",
              type: "input",
              width: "150px",
              placeholder: "选填"
            }
          ],
          addable: true,
          removable: true,
          showSummary: true,
          summaryMethod: (param: any) => {
            const {columns, data} = param;
            const sums: string[] = [];
            columns.forEach((column: any, index: number) => {
              if (index === 0) {
                sums[index] = "总计";
                return;
              }
              if (column.prop === "total") {
                const values = data.map((item: any) => Number(item.total));
                sums[index] =
                  "¥" +
                  values
                    .reduce((prev: number, curr: number) => prev + curr, 0)
                    .toFixed(2);
              } else {
                sums[index] = "";
              }
            });
            return sums;
          }
        })
      },
      {
        name: "totalAmount",
        label: "采购总金额",
        type: "el-input-number",
        required: true,
        props: JSON.stringify({
          min: 0,
          precision: 2,
          step: 100,
          disabled: true,
          controls: false,
          prefix: "¥"
        })
      },
      {
        name: "deliveryDateRange",
        label: "期望到货日期",
        type: "el-date-picker",
        required: true,
        props: JSON.stringify({
          type: "daterange",
          startPlaceholder: "最早日期",
          endPlaceholder: "最晚日期",
          valueFormat: "YYYY-MM-DD",
          disabledDate: (time: Date) => {
            return time.getTime() < Date.now() - 24 * 60 * 60 * 1000;
          }
        })
      },
      {
        name: "purpose",
        label: "采购用途",
        type: "el-input",
        required: true,
        props: JSON.stringify({
          type: "textarea",
          maxlength: 200,
          showWordLimit: true,
          placeholder: "请说明采购用途及必要性"
        })
      },
      {
        name: "supplierInfo",
        label: "供应商信息",
        type: "el-input",
        required: false,
        props: JSON.stringify({
          type: "textarea",
          maxlength: 500,
          rows: 3,
          showWordLimit: true,
          placeholder: "请填写推荐供应商的名称、联系方式等信息(选填)"
        })
      },
      {
        name: "attachments",
        label: "附件",
        type: "el-upload",
        required: false,
        props: JSON.stringify({
          action: "/api/upload/file",
          multiple: true,
          limit: 5,
          accept: ".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar",
          headers: {
            "Content-Type": "multipart/form-data"
          },
          beforeUpload: (file: File) => {
            const isLt10M = file.size / 1024 / 1024 < 10;
            if (!isLt10M) {
              message("文件大小不能超过 10MB!", {type: "error"});
              return false;
            }
            return true;
          },
          onSuccess: (response: any) => {
            if (response.success) {
              message("上传成功", {type: "success"});
            }
          },
          onError: () => {
            message("上传失败", {type: "error"});
          },
          tip: "支持常用办公文件格式，如报价单、物品说明书等(单个文件不超过10MB)"
        })
      }
    ]
  },
  [FormTemplateType.DAILY_REPORT]: {
    fields: [
      {
        name: "reportDate",
        label: "日报日期",
        type: "el-date-picker",
        required: true,
        props: JSON.stringify({
          type: "date",
          placeholder: "选择日期",
          valueFormat: "YYYY-MM-DD",
          disabledDate: time => {
            return time.getTime() > Date.now();
          }
        })
      },
      {
        name: "todaySummary",
        label: "今日总结",
        type: "el-input",
        required: true,
        props: JSON.stringify({
          type: "textarea",
          maxlength: 2000,
          showWordLimit: true,
          rows: 8,
          placeholder: "请总结今日完成的工作内容、遇到的问题及解决方案等"
        })
      },
      {
        name: "tomorrowPlan",
        label: "明日计划",
        type: "el-input",
        required: true,
        props: JSON.stringify({
          type: "textarea",
          maxlength: 1000,
          showWordLimit: true,
          rows: 6,
          placeholder: "请列出明日的工作计划"
        })
      }
    ]
  }
};

// 审批方式
export enum ApproveType {
  ANY = 1, // 任意一人审批
  ALL = 2, // 会签(需所有人审批通过)
  ORDER = 3 // 按顺序审批
}

// 预设的节点模板
export const nodeTemplates = {
  // 请假
  [FormTemplateType.LEAVE]: [
    {
      name: "发起申请",
      type: NodeType.START,
      orderNum: 1
    },
    {
      name: "部门主管审批",
      type: NodeType.APPROVE,
      orderNum: 2,
      approveType: ApproveType.ANY,
      timeLimit: 24,
      approvers: {
        userIds: [],
        required: true
      }
    },
    {
      name: "人事审批",
      type: NodeType.APPROVE,
      orderNum: 3,
      approveType: ApproveType.ORDER,
      timeLimit: 24,
      approvers: {
        userIds: [],
        required: true
      }
    },
    {
      name: "请假天数判断",
      type: NodeType.CONDITION,
      orderNum: 4,
      conditions: [
        {
          expression: "duration >= 5",
          nextNode: 5
        },
        {
          expression: "duration < 5",
          nextNode: 6
        }
      ]
    },
    {
      name: "总经理审批",
      type: NodeType.APPROVE,
      orderNum: 5,
      approveType: ApproveType.ANY,
      timeLimit: 24,
      approvers: {
        userIds: [],
        required: true
      }
    },
    {
      name: "结束",
      type: NodeType.END,
      orderNum: 6
    }
  ],

  // 加班
  [FormTemplateType.OVERTIME]: [
    {
      name: "发起申请",
      type: NodeType.START,
      orderNum: 1
    },
    {
      name: "部门主管审批",
      type: NodeType.APPROVE,
      orderNum: 2,
      approveType: ApproveType.ANY,
      timeLimit: 24,
      approvers: {
        userIds: [],
        required: true
      }
    },
    {
      name: "结束",
      type: NodeType.END,
      orderNum: 3
    }
  ],

  // 出差
  [FormTemplateType.BUSINESS]: [
    {
      name: "发起申请",
      type: NodeType.START,
      orderNum: 1
    },
    {
      name: "部门主管审批",
      type: NodeType.APPROVE,
      orderNum: 2,
      approveType: ApproveType.ANY,
      timeLimit: 24,
      approvers: {
        userIds: [], // 前端选择部门经理
        required: true
      }
    },
    {
      name: "人事审批",
      type: NodeType.APPROVE,
      orderNum: 3,
      approveType: ApproveType.ORDER,
      timeLimit: 24,
      approvers: {
        userIds: [],
        required: true
      }
    },
    {
      name: "出差条件判断",
      type: NodeType.CONDITION,
      orderNum: 4,
      conditions: [
        {
          expression: "duration > 5",
          nextNode: 5
        },
        {
          expression: "duration <= 5",
          nextNode: 6
        }
      ]
    },
    {
      name: "总经理审批",
      type: NodeType.APPROVE,
      orderNum: 5,
      approveType: ApproveType.ANY,
      timeLimit: 24,
      approvers: {
        userIds: [],
        required: true
      }
    },
    {
      name: "结束",
      type: NodeType.END,
      orderNum: 6
    }
  ],

  // 报销
  [FormTemplateType.EXPENSE]: [
    {
      name: "发起申请",
      type: NodeType.START,
      orderNum: 1
    },
    {
      name: "金额判断",
      type: NodeType.CONDITION,
      orderNum: 2,
      conditions: [
        {
          expression: "amount > 200",
          nextNode: 3
        },
        {
          expression: "amount <= 200",
          nextNode: 4
        }
      ]
    },
    {
      name: "总经理审批",
      type: NodeType.APPROVE,
      orderNum: 3,
      approveType: ApproveType.ANY,
      timeLimit: 24,
      approvers: {
        userIds: [],
        required: true
      }
    },
    {
      name: "分管领导审批",
      type: NodeType.APPROVE,
      orderNum: 4,
      approveType: ApproveType.ANY,
      timeLimit: 24,
      approvers: {
        userIds: [],
        required: true
      }
    },
    {
      name: "财务审批",
      type: NodeType.APPROVE,
      orderNum: 5,
      approveType: ApproveType.ANY,
      timeLimit: 24,
      approvers: {
        userIds: [],
        required: true
      }
    },
    {
      name: "出纳付款",
      type: NodeType.APPROVE,
      orderNum: 6,
      approveType: ApproveType.ANY,
      timeLimit: 24,
      approvers: {
        userIds: [], // 出纳人员
        required: true
      }
    },
    {
      name: "结束",
      type: NodeType.END,
      orderNum: 7
    }
  ],

  // 采购
  [FormTemplateType.PURCHASE]: [
    {
      name: "发起申请",
      type: NodeType.START,
      orderNum: 1
    },
    {
      name: "部门主管审批",
      type: NodeType.APPROVE,
      orderNum: 2,
      approveType: ApproveType.ANY,
      timeLimit: 24,
      approvers: {
        userIds: [],
        required: true
      }
    },
    {
      name: "金额判断",
      type: NodeType.CONDITION,
      orderNum: 3,
      conditions: [
        {
          expression: "totalAmount >= 50000", // 5万以上需要总经理审批
          nextNode: 4
        },
        {
          expression: "totalAmount >= 10000 && totalAmount < 50000", // 1-5万需要分管领导审批
          nextNode: 5
        },
        {
          expression: "totalAmount < 10000", // 1万以下直接到采购部
          nextNode: 6
        }
      ]
    },
    {
      name: "总经理审批",
      type: NodeType.APPROVE,
      orderNum: 4,
      approveType: ApproveType.ANY,
      timeLimit: 48,
      approvers: {
        userIds: [],
        required: true
      }
    },
    {
      name: "分管领导审批",
      type: NodeType.APPROVE,
      orderNum: 5,
      approveType: ApproveType.ANY,
      timeLimit: 24,
      approvers: {
        userIds: [],
        required: true
      }
    },
    {
      name: "采购部审核",
      type: NodeType.APPROVE,
      orderNum: 6,
      approveType: ApproveType.ORDER,
      timeLimit: 24,
      approvers: {
        userIds: [],
        required: true
      }
    },
    {
      name: "财务审批",
      type: NodeType.APPROVE,
      orderNum: 7,
      approveType: ApproveType.ANY,
      timeLimit: 24,
      approvers: {
        userIds: [],
        required: true
      }
    },
    {
      name: "结束",
      type: NodeType.END,
      orderNum: 8
    }
  ],

  // 日报
  [FormTemplateType.DAILY_REPORT]: [
    {
      name: "发起申请",
      type: NodeType.START,
      orderNum: 1
    },
    {
      name: "部门主管审批",
      type: NodeType.APPROVE,
      orderNum: 2,
      approveType: ApproveType.ANY,
      timeLimit: 24,
      approvers: {
        userIds: [],
        required: true
      }
    },
    {
      name: "结束",
      type: NodeType.END,
      orderNum: 3
    }
  ]
};

// 模板名称映射
export const templateOptions = [
  {
    type: "请假流程",
    value: "leave"
  },
  {
    type: "加班流程",
    value: "overtime"
  },
  {
    type: "出差流程",
    value: "business"
  },
  {
    type: "报销流程",
    value: "expense"
  },
  {
    type: "采购流程",
    value: "purchase"
  },
  {
    type: "日报流程",
    value: "daily_report"
  }
];
