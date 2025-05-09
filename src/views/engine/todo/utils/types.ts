export interface ApproveForm {
  action: "approve" | "reject" | "transfer";
  comment: string;
  transferTo?: number;
}
