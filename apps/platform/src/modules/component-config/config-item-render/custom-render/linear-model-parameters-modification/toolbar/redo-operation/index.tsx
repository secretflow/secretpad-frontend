import { RedoOutlined } from '@ant-design/icons';
import { Button } from 'antd';

import { useModel } from '@/util/valtio-helper';

import { LinearModelParamsModificationsRenderView } from '../..';
import { DefaultRedoUndoService } from '../../../redo-undo/redo-undo-service';
import type { ParametersData } from '../../types';
import styles from '../index.less';

export const RedoOperation = () => {
  const viewInstance = useModel(LinearModelParamsModificationsRenderView);
  const undoService = useModel(DefaultRedoUndoService<ParametersData>);

  const handleRedo = async () => {
    viewInstance.redo();
  };

  return (
    <Button
      type="link"
      onClick={handleRedo}
      disabled={viewInstance.disabled || undoService.redoStack.length <= 0}
      className={styles.operationBtn}
    >
      <RedoOutlined />
      前进
    </Button>
  );
};
