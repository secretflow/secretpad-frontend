import { InputNumber } from 'antd';
import { useEffect } from 'react';

import { useModel } from '@/util/valtio-helper';

import { BinModificationsRenderView } from '../..';
import { CurrOperationEnum } from '../../types';

export const EditDefaultWoe = () => {
  const {
    disabled,
    defaultBiasValue,
    parametersData,
    setDefaultBiasValue,
    setCurrOperation,
    setBinningData,
  } = useModel(BinModificationsRenderView);

  const handleChange = (value: number | null) => {
    setDefaultBiasValue(value as number);

    if (parametersData) {
      setCurrOperation(CurrOperationEnum.EditBias);

      const changedBinningData = parametersData?.variableParametersData?.map(
        (record) => {
          return {
            ...record,
            bins: record.bins?.map((bin) => {
              if (bin.label === 'ELSE') {
                return {
                  ...bin,
                  woe: value,
                };
              } else {
                return bin;
              }
            }),
          };
        },
      );

      if (changedBinningData && parametersData) {
        setBinningData({
          modelHash: parametersData.modelHash as string,
          variableParametersData: changedBinningData,
        });
      }
    }
  };

  useEffect(() => {
    setDefaultBiasValue(defaultBiasValue);
  }, [parametersData]);

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {
        <>
          <span>bias(interpect)：</span>
          <InputNumber
            onChange={handleChange}
            value={defaultBiasValue}
            min={0}
            style={{ width: 140 }}
            defaultValue={0}
            disabled={disabled}
          />
        </>
      }
    </div>
  );
};
