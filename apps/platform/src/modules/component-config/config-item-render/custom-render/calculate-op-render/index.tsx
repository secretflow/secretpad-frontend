import { Form, Select } from 'antd';

import styles from './index.less';
import {
  LogOperands,
  RangeOperands,
  SubstrOperands,
  UnaryOperands,
  LogRoundOperands,
} from './operand-items';
import { OP } from './types';

const opList = [
  {
    value: OP.STANDARDIZE,
    label: 'Standardize(标准化)',
  },
  {
    value: OP.NORMALIZATION,
    label: '归一化',
  },
  {
    value: OP.RANGE_LIMIT,
    label: 'Range(范围限制)',
  },
  {
    value: OP.UNARY,
    label: 'Unary(单变量四则运算)',
  },
  {
    value: OP.ROUND,
    label: 'Round(圆整)',
  },
  {
    value: OP.LOG_ROUND,
    label: 'LogRound(取log后圆整)',
  },
  {
    value: OP.SQRT,
    label: 'sqrt(根号)',
  },
  {
    value: OP.LOG,
    label: 'Log',
  },
  {
    value: OP.EXP,
    label: 'exp',
  },
  {
    value: OP.LENGTH,
    label: 'length',
  },
  {
    value: OP.SUBSTR,
    label: 'Substr',
  },
  {
    value: OP.RECIPROCAL,
    label: 'Reciprocal(倒数)',
  },
];

const operandRenderMap = {
  [OP.UNARY]: {
    render: UnaryOperands,
    initialValue: ['+', '/', null],
  },
  [OP.LOG]: {
    render: LogOperands,
    initialValue: ['e', null],
  },
  [OP.LOG_ROUND]: {
    render: LogRoundOperands,
    initialValue: [null],
  },
  [OP.RANGE_LIMIT]: {
    render: RangeOperands,
    initialValue: [null, null],
  },
  [OP.SUBSTR]: {
    render: SubstrOperands,
    initialValue: [null],
  },
};

// const hasNewCol = {
//   [OP.CONCAT]: true,
// };

export const calculateSerializer = (val, clsName) => {
  const name = 'custom_value';
  const cw = val;

  const { newColNames } = cw || {};

  if (newColNames) {
    const newCols = newColNames.split(',').filter((col: string) => col.length > 0);
    cw['newColNames'] = newCols;
  }
  return { ...{ custom_value: cw }, custom_protobuf_cls: clsName };
};

export const calculateUnserializer = (val?) => {
  const name = 'custom_value';
  if (!val || !val[name]) {
    return { op: OP.STANDARDIZE };
  }
  const { custom_value } = val || {};
  const { newColNames } = custom_value || {};
  if (newColNames) {
    custom_value['newColNames'] = newColNames.join(',');
  }
  return custom_value;
};

export const CalculateOpRender = (prop) => {
  const { node } = prop;
  const { name } = node;

  const form = Form.useFormInstance();
  Form.useWatch([name, 'op'], form);

  return (
    <Form.Item name={name} noStyle>
      <Form.Item
        name={[name, 'op']}
        label={<span className={styles.font}>算子选择</span>}
        initialValue={OP.STANDARDIZE}
        rules={[{ required: true, message: '请选择算子' }]}
      >
        <Select options={opList} />
      </Form.Item>
      <Form.Item noStyle dependencies={[[name, 'op']]}>
        {({ getFieldValue }) => {
          const op = getFieldValue([name, 'op']);
          const operandRender = operandRenderMap[op];
          if (operandRender) {
            const { render: Render, initialValue } = operandRender;
            return (
              <Form.Item
                name={[name, 'operands']}
                initialValue={initialValue}
                preserve={false}
                rules={[
                  {
                    validator: (_, value) =>
                      value.includes(null) || value.includes(undefined)
                        ? Promise.reject(new Error('值不能为空'))
                        : Promise.resolve(),
                  },
                ]}
              >
                <Render />
              </Form.Item>
            );
          } else {
            <></>;
          }
        }}
      </Form.Item>

      {/* <Form.Item noStyle dependencies={[[name, 'op'], 'input/in_ds/features']}>
        {({ getFieldValue }) => {
          const op = getFieldValue([name, 'op']);
          const enabled = hasNewCol[op];
          if (enabled) {
            return (
              <Form.Item
                name={[name, 'newColNames']}
                label={<span className={styles.font}>新特征列命名</span>}
                // getValueFromEvent={(e) => {
                //   console.log(e.target.value);
                //   return e.target.value
                //     .split(',')
                //     .filter((col: string) => col.length > 0);
                // }}
                // getValueProps={(value) => {
                //   console.log(value, 'value');
                //   return { value: value?.join(',') };
                // }}
                rules={[
                  { required: true, message: '请输入新特征列名' },
                  {
                    pattern: /^[\u4E00-\u9FA5A-Za-z0-9-_,]+$/,
                    message:
                      '只能包含中文/英文/数字/下划线/中划线, 多个特征列用","分隔',
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const selectedCols = getFieldValue('input/in_ds/features');
                      const newCols = value
                        .split(',')
                        .filter((col: string) => col.length > 0);

                      if (selectedCols.length === newCols.length)
                        return Promise.resolve();
                      else return Promise.reject(new Error('新特征列与特征列数量不符'));
                    },
                  }),
                ]}
              >
                <Input placeholder="支持英文大小写、数字、下划线、中划线，多个特征列用,分隔" />
              </Form.Item>
            );
          } else {
            <></>;
          }
        }}
      </Form.Item> */}
    </Form.Item>
  );
};
