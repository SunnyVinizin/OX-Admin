// src/views/system/user/utils/types.ts

// 岗位类型定义
export interface Position {
  id: number;
  positionName: string;
  positionCode: string;
  deptId: number;
  status: number;
}

// 表单项类型定义
export interface FormItemProps {
  id?: number;
  title?: string;
  higherDeptOptions?: any[];
  departments?: any[];
  deptIds?: number[];
  roles?: any[];
  roleIds?: number[];
  positions?: Position[]; // 所有岗位列表
  primaryPositionId?: number; // 添加主岗位ID
  positionIds?: number[]; // 添加副岗位ID列表
  nickname?: string;
  username: string;
  password?: string;
  mobile?: string;
  email?: string;
  avatar?: string;
  status?: number;
  remark?: string;
}

export interface FormProps {
  formInline: FormItemProps;
}

// 角色表单类型定义
export interface RoleFormItemProps {
  username?: string;
  nickname?: string;
  roleOptions?: Array<{
    id: number;
    roleKey: string;
    roleName: string;
    status: number;
  }>;
  ids?: number[];
}

export interface RoleFormProps {
  formInline: RoleFormItemProps;
}
