import dayjs from 'dayjs';

import {
  CycleTaskType,
  monthMapping,
  weekMapping,
} from './create-periodic-task-service';

export const range = (start: number, end: number) => {
  const result = [];
  for (let i = start; i < end; i++) {
    result.push(i);
  }
  return result;
};

export const getScheduleDateStr = (periodic: CycleTaskType, dayList: string[] = []) => {
  let days: number[] = [];

  const findKey = (mappingObj: Record<string, string>, value: string) => {
    if (value === '最后一天') return '-1';
    return Object.keys(mappingObj).find((k) => {
      return mappingObj[k] === value;
    });
  };

  if (periodic === CycleTaskType.Week) {
    days = dayList.map((value: string) => Number(findKey(weekMapping, value)));
  } else if (periodic === CycleTaskType.Month) {
    days = dayList.map((value: string) => Number(findKey(monthMapping, value)));
  }

  return days;
};

// 格式化函数
const formatDate = (date: dayjs.Dayjs) => date.format('YYYYMMDD');

// 获取每个月的最后一天
const getLastDayOfMonth = (year: number, month: number) => {
  return dayjs(new Date(year, month + 1, 0)).date(); // 修改为 month + 1
};

/**
 * 判断日期范围内有没有符合条件的日期
 * @param startTime 开始日期
 * @param endTime   结束日期
 * @param type  日期类型 D / M / W
 * @param days  选择的日期, D -> [], W -> [1,2,3,4,5,6,0]:周一到周日，周日为0 , M -> [1~31, -1]
 * @param currentTime 当天的某一时刻
 * @returns
 */
export const getSpecifiedDatesWithinRange = (
  startTime: string,
  endTime: string,
  type: CycleTaskType,
  days: number[] = [],
  currentTime: string,
) => {
  const startTimestamp = dayjs(startTime).valueOf();
  const endTimestamp = dayjs(endTime).valueOf();
  const result: string[] = [];
  let currentDateTimestamp = dayjs(startTime).startOf('day').valueOf();

  while (currentDateTimestamp <= endTimestamp) {
    const currentDate = dayjs(currentDateTimestamp);
    // 查找并形成特定日期时刻
    const relevantDates = [];
    if (type === CycleTaskType.Week && days.includes(currentDate.day())) {
      relevantDates.push(currentDate);
    } else if (type === CycleTaskType.Day) {
      relevantDates.push(currentDate);
    } else if (type === CycleTaskType.Month) {
      days.forEach((day) => {
        const lastDayOfMonth = getLastDayOfMonth(
          currentDate.year(),
          currentDate.month(),
        );
        const validDay = Math.min(day, lastDayOfMonth);
        relevantDates.push(
          dayjs(new Date(currentDate.year(), currentDate.month(), validDay)),
        );
      });
    }

    // 针对上述类型进一步筛选特定时刻，并检查是否在时间范围内
    relevantDates.forEach((relevantDate) => {
      const currentSpecifiedMoment = dayjs(
        `${relevantDate.format('YYYY-MM-DD')} ${currentTime}`,
      ).valueOf();
      if (
        currentSpecifiedMoment >= startTimestamp &&
        currentSpecifiedMoment <= endTimestamp
      ) {
        result.push(formatDate(relevantDate));
      }
    });

    // 移动到下一个日期
    currentDateTimestamp += 24 * 60 * 60 * 1000; // 增加一天的时间戳（以毫秒计）
  }

  return result;
};
