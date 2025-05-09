import {http} from "@/utils/http";

export type PermissionResult = {
  success: boolean;
  data?: {
    /** 总条数 */
    total?: number;
    /** 列表数据 */
    list?: Array<any>;
  };
  message?: string;
};

/** 获取权限列表 */
export const permissionListQuery = (data?: object) => {
  return http.request<PermissionResult>("post", "/permissions/list", {data});
};

/** 添加权限 */
export const addPermission = (data?: object) => {
  return http.request<PermissionResult>("post", "/permissions", {data});
};

/** 更新权限 */
export const updatePermission = (data?: any) => {
  return http.request<PermissionResult>("put", `/permissions/${data.id}`, {
    data
  });
};

/** 删除权限 */
export const deletePermission = (id: number) => {
  return http.request<PermissionResult>("delete", `/permissions/${id}`);
};
