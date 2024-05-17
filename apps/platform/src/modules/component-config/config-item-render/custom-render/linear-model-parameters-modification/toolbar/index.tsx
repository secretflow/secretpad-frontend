import { EditBias } from './edit-bias';
import { ExportData } from './export-data';
import styles from './index.less';
import { RedoOperation } from './redo-operation';
import { ResetOperation } from './reset-operation';
import SourceSelection from './source-selection';
import { UndoOperation } from './undo-operation';
import { UploadParameters } from './upload-data';

export const ToolBar = () => {
  return (
    <div>
      {/* 结果表选择 */}
      <SourceSelection />
      <div className={styles.container}>
        <div className={styles.left}>
          <ExportData />
          <UploadParameters />
          <UndoOperation />
          <RedoOperation />
          <ResetOperation />
        </div>
        <div className={styles.right}>
          <EditBias />
        </div>
      </div>
    </div>
  );
};
