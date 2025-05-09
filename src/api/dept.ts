import {http} from "@/utils/http";

/** 部门查询参数类型 */
export interface DeptQuery {
  deptName?: string;
  status?: number;
  page?: number;
  pageSize?: number;
}

/** 部门表单类型 */
export interface DeptForm {
  id?: number;
  parentId: number;
  deptName: string;
  deptCode: string;
  leader: string;
  leaderMobile: string;
  leaderEmail: string;
  rank: number;
  status: number;
  remark: string;
}

/** 部门返回类型 */
export interface DeptResult {
  data: {
    list?: Array<DeptForm>;
    total?: number;
    departments?: DeptForm[];
  };
}

/** 获取部门列表 */
export const deptListQuery = (data: DeptQuery) => {
  return http.request<DeptResult>("post", "/departments/list", {data});
};

/** 新增部门 */
export const addDept = (data: DeptForm) => {
  return http.request<DeptResult>("post", "/departments", {data});
};

/** 更新部门 */
export const updateDept = (data: DeptForm) => {
  return http.request<DeptResult>("put", "/departments", {data});
};

/** 删除部门 */
export const deleteDept = (id: number) => {
  return http.request<DeptResult>("delete", `/departments/${id}`);
};

/** 获取部门树 */
export const deptTreeQuery = () => {
  return http.request<DeptResult>("get", "/departments/tree", {});
};
