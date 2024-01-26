import type { RadioChangeEvent } from 'antd';
import { Input, Radio } from 'antd';
import classnames from 'classnames';
import React, { useEffect, useState } from 'react';

import style from './index.less';
import { SelectTree } from './select-tree';
import type { FieldInfoType, TableInfoType } from './type';

export const FieldSelectTable = (props: IProps) => {
  const { selectedFields = [], setSelectedFields } = props;
  const text = `${selectedFields.map(({ colName }) => colName)}`;
  const [type, setType] = useState('select');
  const [inputValue, setInputValue] = useState('');
  const onTypeChange = (e: RadioChangeEvent) => {
    setType(e.target.value);
    if (e.target.value === 'input') setInputValue(text);
  };

  useEffect(() => {
    setInputValue(`${selectedFields.map(({ colName }) => colName)}`);
  }, [selectedFields]);

  const onInputValues = (values: string) => {
    setInputValue(values);
    const fields = values
      ?.split(',')
      .map((t) => {
        const field = t.trim();
        return { colName: field };
      })
      .filter((item) => !!item);
    setSelectedFields(fields);
  };

  useEffect(() => {
    setType('select');
    setInputValue('');
  }, []);

  return (
    <div className={style.fieldSelectTable}>
      <div className={style.fieldSelectHeader}>
        <h4 className={style.header}>选择字段</h4>
        <Radio.Group value={type} onChange={onTypeChange} size="small">
          <Radio.Button value="select">选择</Radio.Button>
          <Radio.Button value="input">输入</Radio.Button>
        </Radio.Group>
      </div>
      <div
        className={classnames({
          [style.fieldSelectContent]: type === 'select',
          [style.fieldInputContent]: type === 'input',
        })}
      >
        {type === 'select' && (
          <SelectTree
            {...props}
            selectedFields={selectedFields.map(({ colName }) => colName) as string[]}
          />
        )}
        {type === 'input' && (
          <Input.TextArea
            placeholder="请输入"
            value={inputValue}
            onChange={(e) => onInputValues(e.target.value)}
          />
        )}
      </div>
    </div>
  );
};

export interface IProps {
  schema: TableInfoType[] | TableInfoType | undefined;
  selectedFields: FieldInfoType[];
  setSelectedFields: (fields: FieldInfoType[]) => void;
  dataType?: string;
  disabled?: boolean;
  rules?: { max?: number; min: number; excludes?: string[] };
  // groupKeys: FieldInfoType[];
  // associatedKeys: FieldInfoType[];
}
