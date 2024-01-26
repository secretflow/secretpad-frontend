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
    binningData,
    setDefaultWoeValue,
    setCurrOperation,
    setBinningData,
  } = useModel(BinModificationsRenderView);

  const handleChange = (value: number | null) => {
    setDefaultWoeValue(value as number);

    if (binningData) {
      setCurrOperation(CurrOperationEnum.EditDefaultWoe);

      const changedBinningData = binningData?.variableBins?.map((record) => {
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

      if (changedBinningData && binningData) {
        setBinningData({
          modelHash: binningData.modelHash as string,
          variableBins: changedBinningData,
        });
      }
    }
  };

  useEffect(() => {
    const elseBin = binningData?.variableBins?.[0]?.bins?.find(
      (bin) => bin.label === 'ELSE',
    );

    if (elseBin?.woe) {
      setDefaultWoeValue(elseBin.woe);
    }
  }, [binningData]);

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
