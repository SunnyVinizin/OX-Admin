import {http} from "@/utils/http";

/** 操作日志列表查询参数类型 */
export interface OperationLogQuery {
  pageNum?: number;
  pageSize?: number;
  [key: string]: any;
}

/** 操作日志返回类型 */
export interface OperationLogResult {
  data: {
    list: Array<any>;
    total: number;
  };
}

// 操作日志列表
export const logsOperationListQuery = (data?: OperationLogQuery) => {
  return http.request<OperationLogResult>("post", "/logs/operation", {
    data
  });
};

// 删除操作日志 (可批量可单个，要传number数组)
export const deleteOperationLog = (ids: number[]) => {
  return http.request<OperationLogResult>("delete", "/logs/operation", {
    data: ids
  });
};

// 登录日志列表
export const logsLoginListQuery = (data?: OperationLogQuery) => {
  return http.request<OperationLogResult>("post", "/logs/login", {
    data
  });
};

// 删除登录日志 (可批量可单个，要传number数组)
export const deleteLoginLog = (ids: number[]) => {
  return http.request<OperationLogResult>("delete", "/logs/login", {
    data: ids
  });
};
