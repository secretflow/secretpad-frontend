import { InputNumber } from 'antd';

import { useModel } from '@/util/valtio-helper';

import { LinearModelParamsModificationsRenderView } from '../..';

export const EditBias = () => {
  const { disabled, parametersData, setParametersData, record } = useModel(
    LinearModelParamsModificationsRenderView,
  );

  const handleChange = (value: number | null) => {
    if (parametersData) {
      if (parametersData) {
        setParametersData({
          ...parametersData,
          bias: value as number,
        });
        record({
          ...parametersData,
          bias: value as number,
        });
      }
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {
        <>
          <span>bias(intercept)：</span>
          <InputNumber
            onChange={handleChange}
            value={parametersData?.bias}
            style={{ width: 140 }}
            defaultValue={0}
            disabled={disabled}
          />
        </>
      }
    </div>
  );
};
