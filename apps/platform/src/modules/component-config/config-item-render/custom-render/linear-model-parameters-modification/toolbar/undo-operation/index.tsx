import { UndoOutlined } from '@ant-design/icons';
import { Button } from 'antd';

import { useModel } from '@/util/valtio-helper';

import { LinearModelParamsModificationsRenderView } from '../..';
import { DefaultRedoUndoService } from '../../../redo-undo/redo-undo-service';
import type { ParametersData } from '../../types';
import styles from '../index.less';

export const UndoOperation = () => {
  const viewInstance = useModel(LinearModelParamsModificationsRenderView);
  const undoService = useModel(DefaultRedoUndoService<ParametersData>);

  const handleUndo = async () => {
    viewInstance.undo();
  };

  return (
    <Button
      type="link"
      onClick={handleUndo}
      disabled={viewInstance.disabled || undoService.undoStack.length <= 0}
      className={styles.operationBtn}
    >
      <UndoOutlined />
      撤销
    </Button>
  );
};
