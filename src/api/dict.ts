import {http} from "@/utils/http";
import type {
  Dict,
  DictItem,
  QueryParams
} from "@/views/system/dict/utils/types";

/** 字典管理返回结果类型 */
export interface DictResult {
  code: number;
  message: string;
  data: {
    list?: Dict[];
    total?: number;
    items?: DictItem[];
  };
}

/** 获取字典类型列表 */
export const getDicts = (params?: QueryParams) => {
  return http.request<DictResult>("get", "/dicts", {params});
};

/** 创建字典类型 */
export const createDict = (data: Partial<Dict>) => {
  return http.request<DictResult>("post", "/dicts", {data});
};

/** 更新字典类型 */
export const updateDict = (id: number, data: Partial<Dict>) => {
  return http.request<DictResult>("put", `/dicts/${id}`, {data});
};

/** 删除字典类型 */
export const deleteDict = (id: number) => {
  return http.request<DictResult>("delete", `/dicts/${id}`);
};

/** 获取字典项列表 */
export const getDictItems = (dictId: number) => {
  return http.request<DictResult>("get", `/dicts/${dictId}/items`);
};

/** 创建字典项 */
export const createDictItem = (dictId: number, data: Partial<DictItem>) => {
  return http.request<DictResult>("post", `/dicts/${dictId}/items`, {data});
};

/** 更新字典项 */
export const updateDictItem = (
  dictId: number,
  itemId: number,
  data: Partial<DictItem>
) => {
  return http.request<DictResult>("put", `/dicts/${dictId}/items/${itemId}`, {
    data
  });
};

/** 删除字典项 */
export const deleteDictItem = (dictId: number, itemId: number) => {
  return http.request<DictResult>("delete", `/dicts/${dictId}/items/${itemId}`);
};

/** 根据字典类型获取字典数据 */
export const getDictByType = (dictType: string) => {
  return http.request<DictResult>("get", `/dicts/type?type=${dictType}`);
};
