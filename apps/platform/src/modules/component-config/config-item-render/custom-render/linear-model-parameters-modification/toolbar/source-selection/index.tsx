import { Radio, Space } from 'antd';
import type { RadioChangeEvent } from 'antd/lib';

import { useModel } from '@/util/valtio-helper';

import { LinearModelParamsModificationsRenderView } from '../..';
import { SourceTypeEnum } from '../../../parameters-modification/types';

const SourceSelection = () => {
  const {
    setSourceType,
    sourceType,
    getLatestData,
    latestData,
    getUpstreamData,
    disabled,
  } = useModel(LinearModelParamsModificationsRenderView);

  const handleChange = (e: RadioChangeEvent) => {
    setSourceType(e.target.value);

    if (e.target.value === SourceTypeEnum.Upstream) {
      getUpstreamData();
    }

    if (e.target.value === SourceTypeEnum.Latest) {
      getLatestData();
    }
  };
  return (
    <>
      <Space style={{ marginLeft: 18 }}>模型参数选择 ：</Space>
      <Radio.Group onChange={handleChange} value={sourceType} disabled={disabled}>
        <Radio value={SourceTypeEnum.Latest} disabled={!latestData}>
          上次模型参数修改
        </Radio>
        <Radio value={SourceTypeEnum.Upstream}>上游输出</Radio>
      </Radio.Group>
    </>
  );
};

export default SourceSelection;
