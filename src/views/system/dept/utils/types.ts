export interface FormItemProps {
  id?: number;
  parentId: number;
  deptName: string;
  deptCode: string;
  leader: string;
  leaderMobile: string;
  leaderEmail: string;
  rank: number;
  status: number;
  remark: string;
  higherDeptOptions?: Record<string, unknown>[];
}

export interface FormProps {
  formInline: FormItemProps;
}
