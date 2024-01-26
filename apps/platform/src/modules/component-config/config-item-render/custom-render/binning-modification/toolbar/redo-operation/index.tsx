import { RedoOutlined } from '@ant-design/icons';
import { Button } from 'antd';

import { useModel } from '@/util/valtio-helper';

import { BinModificationsRenderView } from '../..';
import type { BinningData } from '../../types';
import { CurrOperationEnum } from '../../types';
import { DefaultUndoService } from '../../undo-service';
import styles from '../index.less';

export const RedoOperation = () => {
  const viewInstance = useModel(BinModificationsRenderView);
  const undoService = useModel(DefaultUndoService<BinningData>);

  const handleRedo = async () => {
    viewInstance.setCurrOperation(CurrOperationEnum.Redo);
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
