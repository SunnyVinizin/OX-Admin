export interface FormItemProps {
  id?: number;
  positionName: string;
  positionCode: string;
  deptId: number;
  rank: number;
  status: number;
  remark: string;
  deptOptions?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export interface FormProps {
  formInline: Partial<FormItemProps>;
}

export interface PositionGroup {
  deptInfo: {
    id?: number;
    deptName: string;
  };
  positions: FormItemProps[];
}

export interface GroupedPositions {
  [key: string]: PositionGroup;
}
