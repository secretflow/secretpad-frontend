import { MenuOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import classnames from 'classnames';
import { useState } from 'react';

import { FieldMiniTable } from './field-mini-table';
import style from './index.less';
import { MultiFieldSelectModal } from './multi-field-select-modal';
import type { TableInfoType } from './type';

export const MultiTableFeatureSelection = (props: IProps) => {
  const [showSelectorModal, setShowSelectorModal] = useState(false);
  const [showFields, setShowFields] = useState(false);
  const {
    value = '',
    tableKeys,
    onChange,
    disabled,
    fromTableKey,
    outputTableKeys,
    rules,
  } = props;
  const fields = Array.isArray(value)
    ? value.filter((v) => v)
    : value
    ? value.split(',')
    : [];

  const fieldNum = fields.length;

  const onShowSelectorModal = () => {
    setShowSelectorModal(true);
  };

  return (
    <div
      className={classnames({
        [style.fieldsComponent]: true,
        [style.small]: props.size === 'small',
      })}
    >
      <span
        className={classnames({
          [style.nums]: true,
        })}
        onClick={onShowSelectorModal}
      >
        {fieldNum ? `已选择${fieldNum}个字段` : '未选择字段'}
      </span>
      <Button
        size={props.size || 'middle'}
        icon={<MenuOutlined />}
        disabled={!fieldNum}
        type={showFields ? 'primary' : 'default'}
        onClick={() => setShowFields(!showFields)}
      />
      {showFields && <FieldMiniTable selectedFields={fields} />}
      <MultiFieldSelectModal
        visible={showSelectorModal}
        tableInfos={tableKeys}
        fromTableInfo={fromTableKey}
        outputTableInfos={outputTableKeys}
        multiple={Array.isArray(tableKeys) && tableKeys.length > 1}
        submit={onChange}
        fields={fields.map((f: string) => ({ colName: f }))}
        hideModal={() => setShowSelectorModal(false)}
        disabled={disabled}
        rules={rules}
      />
    </div>
  );
};

export interface IProps {
  size: 'small' | 'middle';
  disabled?: boolean;
  tableKeys: TableInfoType[];
  fromTableKey?: TableInfoType;
  outputTableKeys?: TableInfoType[];
  onChange?: (values: string[]) => void;
  value?: string | string[];
  rules?: { max?: number; min: number; excludes?: string[] };
}
