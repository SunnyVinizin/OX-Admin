import {http} from "@/utils/http";

// 创建工作流实例
export const createInstance = (data: any) =>
  http.request<any>("post", "/workflows/instances", {
    data
  });

// 获取实例列表
export const listInstances = (params: any) =>
  http.request<any>("post", "/workflows/instances/list", {
    data: params
  });

// 获取待办列表
export const listTodo = (params: any) =>
  http.request<any>("post", "/workflows/instances/todo", {
    data: params
  });

// 获取已办列表
export const listDone = (params: any) =>
  http.request<any>("post", "/workflows/instances/done", {
    data: params
  });

// 审批
export const approveInstance = (id: string, data: any) =>
  http.request<any>("post", `/workflows/instances/${id}/approve`, {
    data
  });

// 撤销
export const cancelInstance = (id: string) =>
  http.request<any>("post", `/workflows/instances/${id}/cancel`);

// 获取实例详情
export const getInstanceDetail = (id: string) =>
  http.request<any>("get", `/workflows/instances/${id}/detail`);

// 实例统计
export const getInstanceStatistics = () =>
  http.request<any>("get", `/workflows/instances/statistics`);
