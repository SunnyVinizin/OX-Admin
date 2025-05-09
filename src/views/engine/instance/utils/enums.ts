/**
 * 获取采购类型文本
 * @param type 采购类型
 */
export const getPurchaseTypeText = (type: string) => {
  const typeMap = {
    office: "办公用品",
    electronics: "电子设备",
    software: "软件服务",
    materials: "生产物料",
    others: "其他"
  };
  return typeMap[type] || type;
};

/**
 * 获取单位文本
 * @param unit 单位代码
 */
export const getUnitText = (unit: string) => {
  const unitMap = {
    piece: "个",
    set: "套",
    box: "箱",
    unit: "台",
    item: "件",
    other: "其他"
  };
  return unitMap[unit] || unit;
};

/**
 * 获取报销类型文本
 * @param type
 * @returns
 */
export const getExpenseTypeText = (type: string) => {
  const typeMap = {
    air_ticket: "机票",
    train_ticket: "火车票",
    taxi: "的士费",
    hotel: "住宿费",
    meals: "餐饮费",
    gift: "礼品费",
    activity: "活动费",
    communication: "通讯费",
    allowance: "补助",
    others: "其他"
  };
  return typeMap[type] || type;
};
