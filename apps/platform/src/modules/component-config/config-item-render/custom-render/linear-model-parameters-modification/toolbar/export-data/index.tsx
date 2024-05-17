import { DownloadOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { cloneDeep } from 'lodash';

import { useModel } from '@/util/valtio-helper';

import { LinearModelParamsModificationsRenderView } from '../..';
import type { ParametersDatum } from '../../types';
import styles from '../index.less';

import { csv } from './csv-export';

export const ExportData = () => {
  const coreService = useModel(LinearModelParamsModificationsRenderView);
  const { parametersData, node } = coreService;

  // 0. init columns
  const columns = [
    {
      title: 'feature',
      dataIndex: 'featureName',
      key: 'featureName',
    },
    { title: '所属节点', dataIndex: 'party', key: 'party' },
    { title: 'weight', dataIndex: 'featureWeight', key: 'featureWeight' },
  ];

  const handleExport = () => {
    const data = cloneDeep(parametersData?.featureWeights);

    // 初始化表头
    const cols = columns.map(({ title }) => title);

    const exportData = data?.reduce(
      (tempRes, info) => {
        const row = columns.map(({ dataIndex }) => {
          return info[dataIndex];
        });

        const binsInfo = getBinsInfo(info);

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

    csv(
      [[`modelHash:${_modelHash}`], [`bias:${parametersData?.bias}`], ...exportData],
      {
        name: _modelHash,
      },
    );
  };

  // 获取 bins 的 row
  const getBinsInfo = (bins: ParametersDatum[]) => {
    if (bins && bins.length) {
      return bins.map((item) => {
        return [`${item.featureName}`, `"${item.party}"`, `${item.featureWeight}`];
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
