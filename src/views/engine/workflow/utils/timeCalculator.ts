import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import {CalculateType} from "./templates";

dayjs.extend(duration);
dayjs.extend(isSameOrBefore);

/**
 * 计算请假天数
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @returns 工作日天数
 */
export function calculateLeaveDays(startDate: string, endDate: string): number {
  let days = 0;
  let currentDate = dayjs(startDate);
  const end = dayjs(endDate);

  while (currentDate.isSameOrBefore(end)) {
    // 排除周末
    if (currentDate.day() !== 0 && currentDate.day() !== 6) {
      days++;
    }
    currentDate = currentDate.add(1, "day");
  }

  return days;
}

/**
 * 计算加班时长(小时)
 * @param startTime 开始时间
 * @param endTime 结束时间
 * @returns 加班小时数
 */
export function calculateOvertimeHours(
  startTime: string,
  endTime: string
): number {
  const start = dayjs(startTime);
  const end = dayjs(endTime);
  const hours = end.diff(start, "hour", true);
  // 四舍五入到0.5小时
  return Math.round(hours * 2) / 2;
}

/**
 * 计算出差天数
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @returns 出差天数
 */
export function calculateBusinessTripDays(
  startDate: string,
  endDate: string
): number {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const days = end.diff(start, "day") + 1;
  return days;
}

// 计算规则配置
export const calculatorConfig = {
  [CalculateType.LEAVE_DAYS]: {
    resultField: "duration",
    calculate: calculateLeaveDays
  },
  [CalculateType.OVERTIME_HOURS]: {
    resultField: "duration",
    calculate: calculateOvertimeHours
  },
  [CalculateType.BUSINESS_DAYS]: {
    resultField: "duration",
    calculate: calculateBusinessTripDays
  }
};
