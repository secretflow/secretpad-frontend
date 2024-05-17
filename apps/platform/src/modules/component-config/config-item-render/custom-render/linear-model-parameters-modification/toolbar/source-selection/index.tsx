import { QuestionCircleOutlined } from '@ant-design/icons';
import { Radio, Space, Tooltip } from 'antd';
import type { RadioChangeEvent } from 'antd/lib';

import { useModel } from '@/util/valtio-helper';

import { BinModificationsRenderView } from '../..';
import { SourceTypeEnum } from '../../types';

const SourceSelection = () => {
  const {
    setSourceType,
    sourceType,
    getLatestBinningData,
    latestBinningData,
    getUpstreamBinningData,
    disabled,
  } = useModel(BinModificationsRenderView);

  const handleChange = (e: RadioChangeEvent) => {
    setSourceType(e.target.value);

    if (e.target.value === SourceTypeEnum.Upstream) {
      getUpstreamBinningData();
    }

    if (e.target.value === SourceTypeEnum.Latest) {
      getLatestBinningData();
    }
  };
  return (
    <>
      <Space style={{ marginLeft: 18 }}>模型参数选择 ：</Space>
      <Radio.Group onChange={handleChange} value={sourceType} disabled={disabled}>
        <Radio value={SourceTypeEnum.Latest} disabled={!latestBinningData}>
          上次模型参数修改
        </Radio>
        <Radio value={SourceTypeEnum.Upstream}>上游输出</Radio>
      </Radio.Group>
    </>
  );
};

export default SourceSelection;
