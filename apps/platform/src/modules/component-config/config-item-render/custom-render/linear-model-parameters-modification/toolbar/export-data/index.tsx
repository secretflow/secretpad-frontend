import { DownloadOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { cloneDeep } from 'lodash';

import { useModel } from '@/util/valtio-helper';

import { BinModificationsRenderView } from '../..';
import type { Bin } from '../../types';
import styles from '../index.less';

import { csv } from './csv-export';

export const ExportData = () => {
  const coreService = useModel(BinModificationsRenderView);
  const { binningData, node } = coreService;

  // 0. init columns
  const columns = [
    {
      title: '特征',
      dataIndex: 'feature',
      key: 'feature',
    },
    { title: '类型', dataIndex: 'type', key: 'type' },
  ];

  columns.push({ title: '分箱数', dataIndex: 'binCount', key: 'binCount' });
  columns.push({ title: 'partyName', dataIndex: 'partyName', key: 'partyName' });

  const handleExport = () => {
    const data = cloneDeep(binningData?.variableBins);

    // 初始化表头
    const cols = columns.map(({ title }) => title);
    cols.push(...['序号', '区间', '数量']);

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

    const isIncludeUnderline = binningData?.modelHash.includes('_');

    const _modelHash = isIncludeUnderline
      ? binningData?.modelHash
      : `${binningData?.modelHash}_${node?.graphNode.graphNodeId}`;

    csv([[`modelHash:${_modelHash}`], ...exportData], { name: _modelHash });
  };

  // 获取 bins 的 row
  const getBinsInfo = (bins: Bin[]) => {
    if (bins && bins.length) {
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
    return null;
  };

  return (
    <Button type="link" onClick={handleExport} className={styles.operationBtn}>
      <DownloadOutlined /> 下载
    </Button>
  );
};
