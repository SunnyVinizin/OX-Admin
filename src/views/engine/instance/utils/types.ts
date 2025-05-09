export interface WorkflowInstance {
  id: string;
  title: string;
  workflowId: number;
  workflowName: string;
  workflowCode: string;
  status: number;
  creatorId: string;
  creatorName: string;
  currentNode: string;
  formData: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ApproveForm {
  approved: boolean;
  comment: string;
}
