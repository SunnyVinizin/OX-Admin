// 字典类型
export interface Dict {
  id: number;
  dictName: string;
  dictType: string;
  status: number;
  remark: string;
  createdAt: string;
  updatedAt: string;
  items?: DictItem[];
}

// 字典项
export interface DictItem {
  id: number;
  dictId: number;
  label: string;
  value: string;
  sort: number;
  status: number;
  remark: string;
  createdAt: string;
  updatedAt: string;
}

// 字典表单属性
export interface FormProps {
  formInline: Partial<Dict>;
}

// 字典项表单属性
export interface ItemFormProps {
  formInline: Partial<DictItem>;
}

// 查询参数
export interface QueryParams {
  dictName?: string;
  dictType?: string;
  page?: number;
  pageSize?: number;
}
