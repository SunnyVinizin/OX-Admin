import {http} from "@/utils/http";

/** 岗位查询参数类型 */
export interface PositionQuery {
  pageNum: number;
  pageSize: number;
  deptId?: number;
  status?: number;
  keyword?: string;
}

/** 岗位表单类型 */
export interface PositionForm {
  id?: number;
  positionName: string;
  positionCode: string;
  deptId: number;
  rank: number;
  status: number;
  remark: string;
}

/** 岗位返回类型 */
export interface PositionResult {
  data: {
    list: Array<PositionForm>;
    total: number;
  };
}

/** 获取岗位列表 */
export const positionListQuery = (data: PositionQuery) => {
  return http.request<PositionResult>("get", "/positions", {params: data});
};

/** 新增岗位 */
export const addPosition = (data: PositionForm) => {
  return http.request<PositionResult>("post", "/positions", {data});
};

/** 更新岗位 */
export const updatePosition = (data: PositionForm) => {
  return http.request<PositionResult>("put", `/positions/${data.id}`, {data});
};

/** 删除岗位 */
export const deletePosition = (id: number) => {
  return http.request<PositionResult>("delete", `/positions/${id}`);
};

/** 获取岗位详情 */
export const getPosition = (id: number) => {
  return http.request<PositionResult>("get", `/positions/${id}`);
};
