import { ExportData } from './export-data';
import styles from './index.less';
import { MergeOperation } from './merge-operation';
import { RedoOperation } from './redo-operation';
import { ResetOperation } from './reset-operation';
import SourceSelection from './source-selection';
import { UndoOperation } from './undo-operation';
import { UploadBinning } from './upload-binning';

export const ToolBar = () => {
  return (
    <div>
      {/* 分箱结果表选择 */}
      <SourceSelection />
      <div className={styles.container}>
        <div className={styles.left}>
          <ExportData />
          <UploadBinning />
          <MergeOperation />
          {/* <SplitOperation
            selectedRowKeys={selectedRowKeys}
            setSelectedRowKeys={setSelectedRowKeys}
          /> */}
          <UndoOperation />
          <RedoOperation />
          <ResetOperation />
        </div>
        {/* <div className={styles.right}>
          <EditDefaultWoe />
        </div> */}
      </div>
    </div>
  );
};
