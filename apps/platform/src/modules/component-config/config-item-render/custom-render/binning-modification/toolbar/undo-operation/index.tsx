import { UndoOutlined } from '@ant-design/icons';
import { Button } from 'antd';

import { useModel } from '@/util/valtio-helper';

import { BinModificationsRenderView } from '../..';
import type { BinningData } from '../../types';
import { CurrOperationEnum } from '../../types';
import styles from '../index.less';
import { DefaultRedoUndoService } from '../../../redo-undo/redo-undo-service';

export const UndoOperation = () => {
  const viewInstance = useModel(BinModificationsRenderView);
  const undoService = useModel(DefaultRedoUndoService<BinningData>);

  const handleUndo = async () => {
    viewInstance.setCurrOperation(CurrOperationEnum.Undo);
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
