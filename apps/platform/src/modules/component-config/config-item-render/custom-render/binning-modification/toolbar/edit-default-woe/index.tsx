import { InputNumber } from 'antd';
import { useEffect } from 'react';

import { useModel } from '@/util/valtio-helper';

import { BinModificationsRenderView } from '../..';
import { CurrOperationEnum, TableTypeEnum } from '../../types';

export const EditDefaultWoe = () => {
  const {
    type,
    disabled,
    defaultWoeValue,
    parametersData,
    setDefaultWoeValue,
    setCurrOperation,
    setParametersData,
  } = useModel(BinModificationsRenderView);

  const handleChange = (value: number | null) => {
    setDefaultWoeValue(value as number);

    if (parametersData) {
      setCurrOperation(CurrOperationEnum.EditDefaultWoe);

      const changedBinningData = parametersData?.variableBins?.map((record) => {
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
      });

      if (changedBinningData && parametersData) {
        setParametersData({
          modelHash: parametersData.modelHash as string,
          variableBins: changedBinningData,
        });
      }
    }
  };

  useEffect(() => {
    const elseBin = parametersData?.variableBins?.[0]?.bins?.find(
      (bin) => bin.label === 'ELSE',
    );

    if (elseBin?.woe) {
      setDefaultWoeValue(elseBin.woe);
    }
  }, [parametersData]);

  return type === TableTypeEnum.WoeBinning ? (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {
        <>
          <span>默认 WOE：</span>
          <InputNumber
            onChange={handleChange}
            value={defaultWoeValue}
            placeholder="WOE"
            min={0}
            style={{ width: 140 }}
            defaultValue={0}
            disabled={disabled}
          />
        </>
      }
    </div>
  ) : null;
};
