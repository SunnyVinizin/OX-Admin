import {http} from "@/utils/http";

/** 菜单列表查询参数类型 */
export interface MenuQuery {
  pageNum?: number;
  pageSize?: number;
  title?: string;
  [key: string]: any;
}

/** 菜单返回类型 */
export interface MenuResult {
  data: {
    list: Array<any>;
    total: number;
  };
}

// 菜单列表
export const menuListQuery = (data?: MenuQuery) => {
  return http.request<MenuResult>("post", "/menus/list", {data});
};

// 新增菜单
export const addMenu = (data?: MenuQuery) => {
  return http.request<MenuResult>("post", "/menus", {data});
};

// 修改菜单
export const updateMenu = (data?: MenuQuery) => {
  return http.request<MenuResult>("put", "/menus", {data});
};

// 删除菜单
export const deleteMenu = (id: number) => {
  return http.request<MenuResult>("delete", `/menus/${id}`);
};

// 获取指定菜单权限列表
export const getMenuPermissionList = (id: number) => {
  return http.request<MenuResult>("get", `/menus/permissions/${id}`);
};
