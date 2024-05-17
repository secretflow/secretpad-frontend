import { DownloadOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { cloneDeep } from 'lodash';

import { useModel } from '@/util/valtio-helper';

import { BinModificationsRenderView } from '../..';
import type { Bin } from '../../types';
import { TableTypeEnum } from '../../types';
import styles from '../index.less';

import { csv } from './csv-export';

export const ExportData = () => {
  const coreService = useModel(BinModificationsRenderView);
  const { parametersData, type, node } = coreService;

  // 0. init columns
  const columns = [
    {
      title: '特征',
      dataIndex: 'feature',
      key: 'feature',
    },
    { title: '类型', dataIndex: 'type', key: 'type' },
  ];

  if (type === TableTypeEnum.WoeBinning) {
    columns.push({ title: 'IV', dataIndex: 'iv', key: 'iv' });
  }

  columns.push({ title: '分箱数', dataIndex: 'binCount', key: 'binCount' });
  columns.push({ title: 'partyName', dataIndex: 'partyName', key: 'partyName' });

  const handleExport = () => {
    const data = cloneDeep(parametersData?.variableBins);

    // 初始化表头
    const cols = columns.map(({ title }) => title);
    if (type === TableTypeEnum.WoeBinning) {
      cols.push(...['区间', '数量', 'WOE']);
    } else {
      cols.push(...['序号', '区间', '数量']);
    }

    const exportData = data?.reduce(
      (tempRes, info) => {
        const row = columns.map(({ dataIndex }) => {
          return info[dataIndex];
        });

        const binsInfo = getBinsInfo(info.bins);

        tempRes.push(row);

        if (binsInfo) {
          tempRes.push(...binsInfo);
        }
        return tempRes;
      },
      [cols],
    );

    const isIncludeUnderline = parametersData?.modelHash.includes('_');

    const _modelHash = isIncludeUnderline
      ? parametersData?.modelHash
      : `${parametersData?.modelHash}_${node?.graphNode.graphNodeId}`;

    csv([[`modelHash:${_modelHash}`], ...exportData], { name: _modelHash });
  };

  // 获取 bins 的 row
  const getBinsInfo = (bins: Bin[]) => {
    if (bins && bins.length) {
      if (type === TableTypeEnum.WoeBinning) {
        return bins.map((item) => {
          return [
            '',
            '',
            '',
            '',
            '',
            `"${item.label}"`,
            `${item.totalCount}`,
            `${item.woe}`,
          ];
        });
      } else {
        return bins.map((item) => {
          return [
            '',
            '',
            '',
            '',
            `${item.order}`,
            `"${item.label}"`,
            `${item.totalCount}`,
          ];
        });
      }
    }
    return null;
  };

  return (
    <Button type="link" onClick={handleExport} className={styles.operationBtn}>
      <DownloadOutlined /> 导出分箱
    </Button>
  );
};
