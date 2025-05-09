import {http} from "@/utils/http";

/** 角色查询参数类型 */
export interface RoleQuery {
  roleKey?: string;
  roleName?: string;
  status?: number;
  page: number;
  pageSize: number;
}

/** 角色表单类型（创建） */
export interface CreateRoleForm {
  roleKey: string;
  roleName: string;
  status?: number;
  remark?: string;
  dataScope?: number;
  menuIds?: number[];
  deptIds?: number[];
}

/** 角色表单类型（更新） */
export interface UpdateRoleForm {
  id: number;
  roleName?: string;
  status?: number;
  remark?: string;
  dataScope?: number;
  menuIds?: number[];
  deptIds?: number[];
}

/** 角色返回类型 */
export interface RoleResult {
  data: {
    list: Array<CreateRoleForm & {id: number}>;
    total: number;
  };
}

/** 获取角色列表 */
export const roleListQuery = (data: RoleQuery) => {
  return http.request<RoleResult>("post", "/roles/list", {data});
};

/** 新增角色 */
export const addRole = (data: CreateRoleForm) => {
  return http.request<RoleResult>("post", "/roles", {data});
};

/** 更新角色 */
export const updateRole = (data: UpdateRoleForm) => {
  return http.request<RoleResult>("put", "/roles", {data});
};

/** 删除角色 */
export const deleteRole = (id: number) => {
  return http.request<RoleResult>("delete", `/roles/${id}`);
};

/** 更新角色菜单 */
export const updateRoleMenu = (data: {id: number; menuIds: number[]}) => {
  return http.request<RoleResult>("put", `/roles/menu/${data.id}`, {
    data: {id: data.id, menuIds: data.menuIds}
  });
};

/** 获取角色菜单 */
export const getRoleMenu = (id: number) => {
  return http.request<RoleResult>("get", `/roles/menu/${id}`);
};

/** 获取菜单-权限树形结构 */
export const getMenuPermissionTree = () => {
  return http.request("get", "/roles/menu-permissions");
};

/** 获取角色权限 */
export const getRolePermissions = (id: number) => {
  return http.request<{
    data: number[];
  }>("get", `/roles/permissions/${id}`);
};

/** 更新角色权限 */
export const updateRolePermissions = (data: {
  id: number;
  permissionIds: number[];
}) => {
  return http.request("put", `/roles/permissions/${data.id}`, {
    data: {permissionIds: data.permissionIds}
  });
};
