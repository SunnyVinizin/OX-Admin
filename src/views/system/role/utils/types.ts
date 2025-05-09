// src/views/system/role/utils/types.ts
export interface FormItemProps {
  id?: number;
  roleName: string;
  roleKey: string;
  status: number;
  remark: string;
  menuIds: number[];
  dataScope?: number; // 新增
  deptIds?: number[]; // 新增
  deptOptions?: any[];
}

export interface FormProps {
  formInline: FormItemProps;
}

export interface RoleMenuProps {
  id?: number;
  roleName: string;
  menuIds: number[];
  menuOptions: any[];
}

export interface RolePermissionProps {
  id?: number;
  roleName: string;
  permissionIds: number[];
  treeData: any[];
}
