import {
  PlusSquareOutlined,
  MinusSquareOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Checkbox, Form, Select, Table, Tag } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import classNames from 'classnames';
import { useState } from 'react';
import { useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';

import styles from './index.less';
import { Tooltip } from 'antd/lib';

export const ToggleButton = (props: {
  disabled: boolean;
  value?: boolean;
  onChange?: (type: boolean) => void;
}) => {
  const { disabled = true, value, onChange } = props;

  return (
    <div>
      {value ? (
        <MinusSquareOutlined onClick={() => onChange && onChange(false)} />
      ) : (
        <PlusSquareOutlined
          className={classNames({
            [styles.toggleBtnDisabled]: disabled,
          })}
          onClick={() => onChange && !disabled && onChange(true)}
        />
      )}
    </div>
  );
};

export const MatchTag = (props: { value?: string }) => {
  const { value = 'default' } = props;
  const StatusText = {
    default: <Tag color="default">未匹配</Tag>,
    process: (
      <Tag icon={<SyncOutlined spin />} color="匹配中">
        processing
      </Tag>
    ),
    success: <Tag color="success">匹配成功</Tag>,
    error: <Tag color="error">匹配失败</Tag>,
  };
  return (
    <div style={{ width: 68 }}>{StatusText[value as keyof typeof StatusText]}</div>
  );
};

export interface FeaturesItem {
  into: string;
  online?: string;
}

export const FeatureTable = (props: {
  name: any;
  fieldKey: number;
  featureItemsRefData: FeaturesItem[];
  setFeatureItemsObj: Dispatch<SetStateAction<Record<number, FeaturesItem[]>>>;
  onlineOptions: { label: string; value: string }[] | undefined;
}) => {
  const {
    fieldKey,
    featureItemsRefData,
    setFeatureItemsObj,
    onlineOptions = [],
  } = props;

  const form = Form.useFormInstance();
  const featuresValue = Form.useWatch('features', form);
  const [errorNum, setErrorNum] = useState(0);
  const [checked, setChecked] = useState(false);

  /** 过滤已经选择了的options */
  const selectValue = (featureItemsRefData || [])
    .filter((item) => item.online)
    .map((item) => item.online);
  const onlineOptionsFilter = onlineOptions.filter(
    (item) => !selectValue.includes(item.value),
  );

  // 不看错误展示的数据
  const [featureItemsValue, setFeatureItemsValue] = useState<FeaturesItem[]>([]);

  // 仅看错误展示的数据
  const [featureItemsValueError, setFeatureItemsValueError] = useState<FeaturesItem[]>(
    [],
  );

  useEffect(() => {
    setErrorNum(
      (featureItemsRefData || []).filter((item) => item.online === undefined).length,
    );
    setFeatureItemsValue(featureItemsRefData);
  }, [featureItemsRefData]);

  useEffect(() => {
    // 判断匹配状态, 默认 default 根据 errorNum 判断匹配状态
    let status = 'default';
    if (featuresValue?.[fieldKey]?.node && featuresValue?.[fieldKey]?.featureService) {
      if (errorNum > 0) {
        status = 'error';
      } else {
        status = 'success';
      }
    }
    form.setFieldsValue({
      features: {
        [fieldKey]: {
          status: status,
        },
      },
    });
  }, [errorNum]);

  const handleFeatureOnlineChange = (
    fieldKey: number,
    value: string,
    record: FeaturesItem,
  ) => {
    const newList = featureItemsRefData.map((item) => {
      if (item.into === record.into) {
        return {
          into: item.into,
          online: value,
        };
      }
      return item;
    });

    /** 如果仅看错误 */
    if (checked) {
      const newList = featureItemsValueError.map((item) => {
        if (item.into === record.into) {
          return {
            into: item.into,
            online: value,
          };
        }
        return item;
      });
      setFeatureItemsValueError(newList);
    }
    /** 更新所有的数据传出去 */
    setFeatureItemsObj((prev) => ({ ...prev, [fieldKey]: newList }));
    const errorListLength = newList.filter((item) => item.online === undefined).length;
    if (errorListLength === 0) {
      handleChangeCheckbox(false);
    }
    setErrorNum(errorListLength);
  };

  const handleChangeCheckbox = (value: boolean) => {
    setChecked(value);
    if (value) {
      const errorList = (featureItemsRefData || []).filter((item) => !item.online);
      setFeatureItemsValueError(errorList);
    } else {
      setFeatureItemsValue(featureItemsRefData);
    }
  };

  const columns = [
    {
      title: <div className={styles.intoHeader}>入模特征</div>,
      dataIndex: 'into',
      key: 'into',
      render: (text: string) => <div style={{ marginLeft: 24 }}>{text}</div>,
    },
    {
      title: (
        <div className={styles.onlineHeader}>
          <span className={styles.features}>在线特征</span>
          <Checkbox
            style={{
              display: errorNum > 0 ? 'flex' : 'none',
            }}
            checked={checked}
            onChange={(e: CheckboxChangeEvent) =>
              handleChangeCheckbox(e.target.checked)
            }
          >
            <span className={styles.checkBoxLabel}>仅看错误 ({errorNum})</span>
          </Checkbox>
        </div>
      ),
      dataIndex: 'online',
      key: 'online',
      render: (text: string, record: FeaturesItem) => {
        return (
          <Tooltip
            title={
              featuresValue?.[fieldKey]?.featureService === 'mock'
                ? 'mock服务不允许修改'
                : ''
            }
          >
            <Select
              placeholder="请手动选择"
              className={classNames(styles.featureOnline, {
                [styles.featureOnlineError]: !text,
              })}
              size="small"
              value={text}
              options={onlineOptionsFilter}
              disabled={featuresValue?.[fieldKey]?.featureService === 'mock'}
              onChange={(value) => handleFeatureOnlineChange(fieldKey, value, record)}
            />
          </Tooltip>
        );
      },
    },
  ];

  return (
    <Table
      size="small"
      columns={columns}
      dataSource={checked ? featureItemsValueError : featureItemsValue}
    />
  );
};
