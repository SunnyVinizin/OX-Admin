import {http} from "@/utils/http";

/** 获取工作流列表 */
export const getWorkflowList = (data?: object) => {
  return http.request<any>("get", "/workflows", {params: data});
};

// 获取工作流详情
export const getWorkflowDetail = (id: number) =>
  http.request<any>("get", `/workflows/${id}`);

/** 创建工作流 */
export const addWorkflow = (data?: object) => {
  return http.request("post", "/workflows", {data});
};

/** 更新工作流 */
export const updateWorkflow = (id: number, data?: object) => {
  return http.request("put", `/workflows/${id}`, {data});
};

/** 删除工作流 */
export const deleteWorkflow = (id: number) => {
  return http.request("delete", `/workflows/${id}`);
};

/** 更新工作流状态 */
export const updateWorkflowStatus = (id: number, status: number) => {
  return http.request("put", `/workflows/${id}/status`, {data: {status}});
};
