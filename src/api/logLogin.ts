import {http} from "@/utils/http";

/** 登录日志列表查询参数类型 */
export interface LoginLogQuery {
  pageNum?: number;
  pageSize?: number;
  [key: string]: any;
}

/** 登录日志返回类型 */
export interface LoginLogResult {
  data: {
    list: Array<any>;
    total: number;
  };
}

// 登录日志列表
export const logsLoginListQuery = (data?: LoginLogQuery) => {
  return http.request<LoginLogResult>("post", "/logs/login", {
    data
  });
};

// 删除登录日志 (可批量可单个，要传number数组)
export const deleteLoginLog = (ids: number[]) => {
  return http.request<LoginLogResult>("delete", "/logs/login", {
    data: ids
  });
};
