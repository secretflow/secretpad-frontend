// 渲染 结果表的 标签
export const getLabel = (leftBound: number | string, rightBound: number | string) => {
  if (leftBound === 0 && rightBound === 0) {
    return 'ELSE';
  } else {
    let rightBoundBracket = ']';
    if (typeof rightBound === 'string' && rightBound.includes('Infinity')) {
      rightBoundBracket = ')';
    }
    return `(${leftBound}, ${rightBound}${rightBoundBracket}`;
  }
};

// 返回 引擎所需要的 区间值
export const getBoundValue = (label: string) => {
  if (label === 'ELSE') return [0, 0];

  const left = label.split(',')[0].replace('(', '');
  const right = label.split(',')[1].replace(']', '').replace(')', '');

  return [
    left.includes('Infinity') ? left : Number(left),
    right.includes('Infinity') ? right : Number(right),
  ];
};

// 检查相邻的两个数字是否连续
export function checkIsConsecutive(arr: number[]) {
  arr.sort((a, b) => a - b);
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] + 1 !== arr[i + 1]) {
      return false;
    }
  }
  return true;
}
