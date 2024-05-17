import { SyncOutlined } from '@ant-design/icons';
import { Button } from 'antd';

import { useModel } from '@/util/valtio-helper';

import { LinearModelParamsModificationsRenderView } from '../..';
import { DefaultRedoUndoService } from '../../../redo-undo/redo-undo-service';
import type { ParametersData } from '../../types';
import styles from '../index.less';

export const ResetOperation = () => {
  const { undoStack, redoStack } = useModel(DefaultRedoUndoService<ParametersData>);
  const viewInstance = useModel(LinearModelParamsModificationsRenderView);

  const handleReset = async () => {
    viewInstance.reset();
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
