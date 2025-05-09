export interface FormItemProps {
  id?: number;
  menuId: number;
  menuOptions: any[];
  permissionKey: string;
  permissionName: string;
  status: number;
}

export interface FormProps {
  formInline: FormItemProps;
}
