import {
  NodeType,
  ApproveType,
  type WorkflowType,
  type WorkflowNode,
  type ApproverConfig,
  type Condition
} from "@/views/engine/workflow/utils/types";

// 设计器节点数据
export interface DesignerNodeData {
  label: string;
  type: NodeType;
  approveType?: ApproveType;
  timeLimit?: number;
  approvers?: ApproverConfig;
  conditions?: Condition[];
  [key: string]: any;
}

// 设计器边数据
export interface DesignerEdgeData {
  label?: string;
  condition?: string;
  [key: string]: any;
}

// 流程模板数据
export interface FlowTemplate {
  name: string;
  type: WorkflowType;
  description?: string;
  nodes: WorkflowNode[];
}

export {NodeType, ApproveType};
