import { Table, message } from 'antd';
import { useEffect } from 'react';

import { useModel } from '@/util/valtio-helper';

import { BinModificationsRenderView } from '..';
import { checkIsConsecutive } from '../helper';
import styles from '../index.less';
import type { Bin, Record, SelectedRowMap } from '../types';
import { TableTypeEnum } from '../types';

const woeColumnsType = [
  {
    title: '区间',
    key: 'label',
    dataIndex: 'label',
  },
  {
    title: '数量',
    key: 'totalCount',
    dataIndex: 'totalCount',
  },
  {
    title: 'WOE',
    key: 'woe',
    dataIndex: 'woe',
  },
];

const defaultColumnsType = [
  {
    title: '序号',
    key: 'order',
    dataIndex: 'order',
  },
  {
    title: '区间',
    key: 'label',
    dataIndex: 'label',
  },
  {
    title: '数量',
    key: 'totalCount',
    dataIndex: 'totalCount',
  },
];

const ExpandedTable = (props: IProps) => {
  const {
    selectedRowKeys,
    setSelectedRowKeys,
    type,
    disabled,
    parametersData,
    setParametersData,
    selectedRowMap,
    setSelectedRowMap,
  } = useModel(BinModificationsRenderView);

  const columns =
    type === TableTypeEnum.WoeBinning ? woeColumnsType : defaultColumnsType;

  useEffect(() => {
    const keys: string[] = [];
    parametersData?.variableBins?.forEach((bins) => {
      bins.bins?.forEach((bin) => {
        if (bin.markForMerge) {
          keys.push(bin.key);
        }
      });
    });
    setSelectedRowKeys(keys);
    const newSelectedRowMap: SelectedRowMap = {};
    keys.map((item) => {
      const featureName = item?.split('/')?.[1];
      const featureNameIndex = Number(item?.split('/')?.[0]);
      const currentIndexList = newSelectedRowMap[featureName]?.index || [];
      const currentValueList = newSelectedRowMap[featureName]?.value || [];
      newSelectedRowMap[featureName] = {
        index: [...new Set([...currentIndexList, featureNameIndex])],
        value: [...new Set([...currentValueList, item])],
      };
    });
    setSelectedRowMap(newSelectedRowMap);
  }, [parametersData]);

  const onCheckboxPropsChange = (record: { label: string }) => {
    const isDisable = record.label.toUpperCase() === 'ELSE';
    return { disabled: disabled || isDisable };
  };

  const onSelectChange = (record: { key: string }, selected: boolean) => {
    const currentRowkey = record.key;
    const featureName = currentRowkey?.split('/')?.[1];
    const featureNameIndex = Number(currentRowkey?.split('/')?.[0]);
    let newIndexArr = selectedRowMap[featureName]?.index || [];

    if (selected) {
      newIndexArr = [...newIndexArr, featureNameIndex];
    } else {
      newIndexArr = newIndexArr.filter((idx: number) => idx !== featureNameIndex);
    }

    /** 需选择相邻的分箱进行合并 */
    const isConsecutive = checkIsConsecutive(newIndexArr);
    if (!isConsecutive) {
      message.warning('需选择相邻的分箱进行合并');
      return;
    }

    /** 不支持合并到两个以及以下的分桶 */
    const records = parametersData?.variableBins?.find(
      (record: Record) => record.feature === featureName,
    );
    const test = selected ? newIndexArr.length : newIndexArr.length - 1;
    if (records && test > records.binCount - 1) {
      message.warning('不支持合并到 2 个以下的分桶');
      return;
    }

    updateSelectedRowMap(currentRowkey, selected);

    const currentSelectedRowKeys = selected
      ? [...selectedRowKeys, currentRowkey]
      : selectedRowKeys.filter((key) => key !== currentRowkey);
    setSelectedRowKeys(currentSelectedRowKeys);

    const markedparametersData = parametersData?.variableBins?.map((record) => {
      const valueList = selectedRowMap[record.key]?.value || [];
      const rowKeys = valueList.length >= 1 ? valueList : [];
      return {
        ...record,
        bins: record.bins?.map((bin) => {
          return {
            ...bin,
            markForMerge: rowKeys.includes(bin.key),
          };
        }),
      };
    });
    if (parametersData && markedparametersData) {
      setParametersData({
        modelHash: parametersData.modelHash,
        variableBins: markedparametersData,
      });
    }
  };

  const updateSelectedRowMap = (currentRowkey: string, isSelect: boolean) => {
    const featureName = currentRowkey?.split('/')?.[1];
    const featureNameIndex = Number(currentRowkey?.split('/')?.[0]);

    const currentIndexList = selectedRowMap[featureName]?.index || [];
    const currentValueList = selectedRowMap[featureName]?.value || [];

    if (isSelect) {
      selectedRowMap[featureName] = {
        index: [...currentIndexList, featureNameIndex],
        value: [...currentValueList, currentRowkey],
      };
    } else {
      selectedRowMap[featureName] = {
        index: currentIndexList.filter((index: number) => index !== featureNameIndex),
        value: currentValueList.filter((key: string) => key !== currentRowkey),
      };
    }
  };

  // table rowSelection 配置
  const rowSelection = {
    selectedRowKeys,
    getCheckboxProps: onCheckboxPropsChange,
    onSelect: onSelectChange,
  };

  return (
    <Table
      className={styles.expandedTableContent}
      bordered
      rowSelection={{ ...rowSelection }}
      columns={columns}
      dataSource={props?.bins || []}
    />
  );
};

export default ExpandedTable;

interface IProps {
  bins: Bin[];
}
