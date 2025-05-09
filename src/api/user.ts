import {http} from "@/utils/http";

export type UserResult = {
  success: boolean;
  data: {
    /** 用户ID */
    id: number;
    /** 头像 */
    avatar: string;
    /** 用户名 */
    username: string;
    /** 昵称 */
    nickname: string;
    /** 当前登录用户的角色 */
    roles: Array<string>;
    /** 按钮级别权限 */
    permissions: Array<string>;
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: Date;
  };
};

export type RefreshTokenResult = {
  success: boolean;
  data: {
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: Date;
    /** 用户ID */
    id: number;
  };
};

/** 登录 */
export const getLogin = (data?: object) => {
  return http.request<UserResult>("post", "/auth/login", {data});
};

/** 刷新`token` */
export const refreshTokenApi = (data?: object) => {
  return http.request<RefreshTokenResult>("post", "/auth/refresh-token", {
    data
  });
};

export const userListQuery = (data?: object) => {
  return http.request<UserResult>("post", "/users/list", {data});
};

export const addUser = (data?: object) => {
  return http.request<UserResult>("post", "/users", {data});
};

export const updateUser = (data?: object) => {
  return http.request<UserResult>("put", "/users", {data});
};

export const deleteUser = (id: number) => {
  return http.request<UserResult>("delete", `/users/${id}`);
};

export const updateUserPassword = (id: number, password: string) => {
  return http.request<UserResult>("put", `/users/password`, {
    data: {id, newPassword: password}
  });
};

export const updateUserRole = (userId: number, roleIds: number[]) => {
  return http.request<UserResult>("put", `/users/role`, {
    data: {userId, roleIds}
  });
};

export const updateUserStatus = (id: number, status: number) => {
  return http.request<UserResult>("put", `/users/status`, {
    data: {id, status}
  });
};

/** 用户选项类型 */
export interface UserOption {
  value: number;
  label: string;
  department?: string;
  position?: string;
}

/** 搜索用户 */
export const searchUsers = (keyword: string) => {
  return http.request<{
    data: {
      list: Array<{
        id: number;
        username: string;
        nickname: string;
        departmentName: string;
        positionName: string;
      }>;
    };
  }>("get", "/users/search", {params: {keyword}});
};

interface UserSelectorRequest {
  keyword?: string;
  deptId?: number;
  roleId?: number;
  page: number;
  pageSize: number;
}

export function getUserSelector(params: UserSelectorRequest) {
  return http.request<any>("get", "/users/selector", {params});
}

/** 用户基本信息 */
export interface UserInfo {
  id: number;
  username: string;
  nickname: string;
  avatar: string;
  deptName?: string;
  roleName?: string;
}
