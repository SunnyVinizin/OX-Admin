// 工作流类型
export enum WorkflowType {
  LEAVE = "leave", // 请假
  OVERTIME = "overtime", // 加班
  BUSINESS = "business", // 出差
  EXPENSE = "expense", // 报销
  PURCHASE = "purchase" // 采购
}

// 节点类型
export enum NodeType {
  START = "start", // 发起节点
  APPROVE = "approve", // 审批节点
  CC = "cc", // 抄送节点
  CONDITION = "condition", // 条件节点
  END = "end" // 结束节点
}

// 审批方式
export enum ApproveType {
  ANY = 1, // 任意一人
  ALL = 2, // 所有人
  ORDER = 3, // 按顺序
  COUNTER = 4 // 会签
}

// 审批人配置
export interface ApproverConfig {
  userIds: number[]; // 指定用户ID列表
  required: boolean; // 是否必须审批
}

// 工作流表单项
export interface WorkflowFormData {
  id?: number;
  name: string;
  code: string;
  description: string;
  type: WorkflowType;
  status: number;
  formConfig: FormConfig;
  nodes: WorkflowNode[];
}

// 条件配置接口
export interface Condition {
  expression: string;
  nextNode: number;
}

// 工作流节点
export interface WorkflowNode {
  id?: number;
  name: string;
  type: NodeType;
  orderNum: number;
  approveType?: ApproveType;
  timeLimit?: number;
  approvers?: ApproverConfig;
  conditions?: Condition[];
}

// 表单模板类型
export enum FormTemplateType {
  LEAVE = "leave", // 请假
  OVERTIME = "overtime", // 加班
  BUSINESS = "business", // 出差
  EXPENSE = "expense", // 报销
  PURCHASE = "purchase", // 采购
  DAILY_REPORT = "daily_report" // 日报
}

// 表单字段配置
export interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  props: string;
}

// 表单配置
export interface FormConfig {
  fields: FormField[];
}

// 表单Props
export interface FormProps {
  formInline: WorkflowFormData;
}
