/* 四舍五入到两位小数 */
export function roundToTwoDecimals(num: number) {
  return Math.round(num * 100) / 100;
}

/** 判断采样分位点字符串输入是否合法
 * 【合法】12,24.6,40
 * 【不合法】
 *  结尾不能有多余符号：123,
 *  开头不能有多余符号：,123
 *  不能有数字和逗号之外的字符：abc,123
 *  数字需递增：1,2,2
 */
export function isValidQuantilesString(input: string) {
  // 先进行基本的格式校验，确保字符串由数字和逗号组成
  const basicPattern = /^(\d+(\.\d*)?)(,\d+(\.\d*)?)*$/;
  if (!basicPattern.test(input)) {
    return false;
  }

  // 将字符串分割成数字数组
  const numbers = input.split(',').map(Number);

  for (let i = 1; i < numbers.length; i++) {
    if (numbers[i] <= numbers[i - 1]) {
      // 如果当前数字不大于前一个数字，说明不满足递增条件
      return false;
    }
  }

  // 所有数字都满足递增条件
  return true;
}
