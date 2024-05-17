import { SyncOutlined } from '@ant-design/icons';
import { Button } from 'antd';

import { useModel } from '@/util/valtio-helper';

import { BinModificationsRenderView } from '../..';
import type { BinningData, Record } from '../../types';
import { CurrOperationEnum } from '../../types';
import { DefaultUndoService } from '../../undo-service';
import styles from '../index.less';

export const ResetOperation = () => {
  const { undoStack, redoStack } = useModel(DefaultUndoService<BinningData>);
  const viewInstance = useModel(BinModificationsRenderView);

  const handleReset = async () => {
    viewInstance.reset();
    viewInstance.setCurrOperation(CurrOperationEnum.Reset);

    viewInstance.setBinningData({
      modelHash: viewInstance.binningData?.modelHash as string,
      variableBins: viewInstance.binningData?.variableBins?.map((record) => {
        return {
          ...record,
          bins: record.bins?.map((bin) => {
            return {
              ...bin,
              markForMerge: false,
            };
          }),
        };
      }) as Record[],
    });
  };

  return (
    <Button
      type="link"
      onClick={handleReset}
      disabled={
        viewInstance.disabled || (undoStack.length <= 0 && redoStack.length <= 0)
      }
      className={styles.operationBtn}
    >
      <SyncOutlined /> 重做
    </Button>
  );
};
