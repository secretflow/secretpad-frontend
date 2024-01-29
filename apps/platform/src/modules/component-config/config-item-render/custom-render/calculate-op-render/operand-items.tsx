import { QuestionCircleOutlined } from '@ant-design/icons';
import { Select, Input, InputNumber, Tooltip, Space } from 'antd';
import { useState } from 'react';

import styles from './index.less';

export const UnaryOperands = (prop: {
  value?: (string | number)[];
  onChange?: (value: (string | number)[]) => void;
}) => {
  const { value = [], onChange } = prop;
  const prefixOptions = [
    { value: '+', label: '+' },
    { value: '-', label: '-' },
  ];

  const opOptions = [
    { value: '+', label: '+' },
    { value: '-', label: '-' },
    { value: '/', label: '/' },
    { value: '*', label: '*' },
  ];

  const triggerChange = (changedVal: (string | number)[]) => {
    onChange?.(changedVal);
  };

  const val = value?.length === 3 ? value : ['+', '/', null];
  const [selected, setSelected] = useState<(string | number)[]>(val);

  return (
    <div className={styles.UnaryContent}>
      <Select
        options={prefixOptions}
        value={val[0] as string}
        onChange={(val: string) => {
          const arr = [...selected];
          arr[0] = val;
          setSelected(arr);
          triggerChange(arr);
        }}
        className={styles.select}
      />
      <div className={styles.content}>
        {'('}
        <div className={styles.disableBtn}>原值</div>
        <Select
          options={opOptions}
          value={val[1] as string}
          onChange={(val: string) => {
            const arr = [...selected];
            arr[1] = val;
            setSelected(arr);
            triggerChange(arr);
          }}
        />
        <InputNumber
          value={val[2] ? parseFloat(val[2]) : null}
          onChange={(val: number | null) => {
            const arr = [...selected];
            arr[2] = val + '';
            setSelected(arr);
            triggerChange(arr);
          }}
          placeholder="请输入数值"
        />
        {')'}
      </div>
    </div>
  );
};

export const RangeOperands = (prop: {
  value?: (string | number)[];
  onChange?: (value: (string | number)[]) => void;
}) => {
  const { value = [], onChange } = prop;
  const [selected, setSelected] = useState<(string | number)[]>([]);

  const triggerChange = (changedVal: (string | number)[]) => {
    onChange?.(changedVal);
  };
  return (
    <div className={styles.RangeContent}>
      <div className={styles.text}>限制范围</div>
      <Space className={styles.content}>
        <div>
          <InputNumber
            max={(selected[1] as number) || Number.MAX_SAFE_INTEGER}
            value={value[0] ? parseFloat(value[0]) : null}
            onChange={(val: number | null) => {
              const arr = [...selected];
              arr[0] = val + '';
              setSelected(arr);
              triggerChange(arr);
            }}
            placeholder="最小值"
          />
        </div>
        ,
        <div>
          <InputNumber
            min={(selected[0] as number) || Number.MIN_SAFE_INTEGER}
            value={value[1] ? parseFloat(value[1]) : null}
            onChange={(val: number | null) => {
              const arr = [...selected];
              arr[1] = val + '';
              setSelected(arr);
              triggerChange(arr);
            }}
            placeholder="最大值"
          />
        </div>
      </Space>
    </div>
  );
};

export const LogOperands = (prop: {
  value?: (string | number)[];
  onChange?: (value: (string | number)[]) => void;
}) => {
  const { value = [], onChange } = prop;
  const [selected, setSelected] = useState<(string | number)[]>(['e']);

  const triggerChange = (changedVal: (string | number)[]) => {
    onChange?.(changedVal);
  };
  return (
    <div className={styles.LogContent}>
      <div className={styles.content}>
        Log
        <Input
          value={value[0] as string}
          onChange={(e) => {
            const arr = [...selected];
            arr[0] = e.target.value;
            setSelected(arr);
            triggerChange(arr);
          }}
        />
        {'('} <div className={styles.disableBtn}>原值</div>
        +
        <InputNumber
          value={value[1] ? parseFloat(value[1]) : null}
          onChange={(e) => {
            const arr = [...selected];
            arr[1] = e + '';
            setSelected(arr);
            triggerChange(arr);
          }}
          placeholder="常量"
        />
        {')'}
      </div>
    </div>
  );
};

export const LogRoundOperands = (prop: {
  value?: (string | number)[];
  onChange?: (value: (string | number)[]) => void;
}) => {
  const { value = [], onChange } = prop;
  const [selected, setSelected] = useState<(string | number)[]>([]);

  const triggerChange = (changedVal: (string | number)[]) => {
    onChange?.(changedVal);
  };
  return (
    <div className={styles.LogContent}>
      <div className={styles.content}>
        Log2
        {'('} <div className={styles.disableBtn}>原值</div>
        +
        <InputNumber
          value={value[0] ? parseFloat(value[0]) : null}
          onChange={(e) => {
            const arr = [...selected];
            arr[0] = e + '';
            setSelected(arr);
            triggerChange(arr);
          }}
          placeholder="常量"
        />
        {')'}
      </div>
    </div>
  );
};

export const SqrtOperands = (prop: {
  value?: number[];
  onChange?: (value: (number | null)[]) => void;
}) => {
  const { value = [], onChange } = prop;
  const [selected, setSelected] = useState<(null | number)[]>([]);

  const triggerChange = (changedVal: (null | number)[]) => {
    onChange?.(changedVal);
  };
  return (
    <EffectiveNumber
      value={value[0] as number}
      onChange={(val: number | null) => {
        const arr = [...selected];
        arr[0] = val;
        setSelected(arr);
        triggerChange(arr);
      }}
    />
  );
};

export const SubstrOperands = (prop: {
  value?: (string | number)[];
  onChange?: (value: (string | number)[]) => void;
}) => {
  const { value = [], onChange } = prop;
  const [selected, setSelected] = useState<(string | number)[]>([]);

  const triggerChange = (changedVal: (string | number)[]) => {
    onChange?.(changedVal);
  };
  return (
    <div className={styles.subStrContent}>
      <div>
        <div className={styles.text}>截取长度</div>
        <InputNumber
          min={0}
          step={1}
          precision={0}
          value={value[1] ? parseFloat(value[1]) : null}
          onChange={(val) => {
            const arr = [...selected];
            arr[1] = val + '';
            setSelected(arr);
            triggerChange(arr);
          }}
          placeholder="请输入正整数"
        />
      </div>

      <div className={styles.subStrStart}>
        <Space>
          <div className={styles.text}>开始截取位数</div>
          <Tooltip
            trigger="hover"
            className={styles.tip}
            title={
              <div>
                <div>如输入正数，则从左边开始往后从左到右截取；</div>
                <div>如输入负数，则从结尾往前数从左到右截取位数截取。</div>
                <div>{`例：select substr('abcdefg',3,4) from dual; 结果是cdef`}</div>
                <div> {`select substr('abcdefg',-3,4) from dual; 结果efg`}</div>
              </div>
            }
          >
            <QuestionCircleOutlined />
          </Tooltip>
        </Space>
        <InputNumber
          precision={0}
          value={value[0] ? parseFloat(value[0]) : null}
          onChange={(e) => {
            const arr = [...selected];
            arr[0] = e + '';
            setSelected(arr);
            triggerChange(arr);
          }}
          placeholder="请输入"
        />
      </div>
    </div>
  );
};

export const EffectiveNumber = (prop: {
  value?: number;
  onChange?: (value: number | null) => void;
}) => {
  const { value = null, onChange } = prop;
  const triggerChange = (changedVal: number | null) => {
    onChange?.(changedVal);
  };
  return (
    <div className={styles.effectiveContent}>
      <span className={styles.text}>有效数字位数</span>
      <InputNumber
        className={styles.input}
        max={10}
        min={1}
        placeholder="1-10"
        value={value}
        onChange={(val: number | null) => {
          triggerChange(val);
        }}
      />
    </div>
  );
};
