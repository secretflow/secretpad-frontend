import {
  CloseOutlined,
  Loading3QuartersOutlined,
  PaperClipOutlined,
  RedoOutlined,
} from '@ant-design/icons';
import { Progress, Space } from 'antd';

import styles from './index.less';

export interface FileInfo {
  name?: string;
  status?: 'Processing' | 'Success' | 'Error';
  percent?: number;
  info?: string;
  realName?: string;
}

interface IProps {
  fileInfo: FileInfo;
  onRetry: (fileInfo: FileInfo) => void;
  onClose: (fileInfo: FileInfo) => void;
}

const UploadTableFileList: React.FC<IProps> = (props: IProps) => {
  const { fileInfo = {}, onRetry, onClose } = props;

  const { name, status, info, percent = 0 } = fileInfo;

  return (
    <div className={styles.uploadFileList}>
      <div className={styles.fileInfo}>
        {status === 'Processing' && (
          <a>
            <Loading3QuartersOutlined spin />
          </a>
        )}

        {status === 'Error' && (
          <span className={styles.infoError}>
            <PaperClipOutlined />
          </span>
        )}

        <span
          className={`${styles.fileName} ${status === 'Error' ? styles.infoError : ''}`}
        >
          {name}
        </span>
        <span className={styles.fileActions}>
          <Space>
            {status === 'Error' && (
              <span
                className={styles.actionsItem}
                onClick={() => {
                  onRetry && onRetry(fileInfo);
                }}
              >
                <RedoOutlined />
              </span>
            )}
            <span className={styles.actionsItem}>
              <CloseOutlined
                onClick={() => {
                  onClose && onClose(fileInfo);
                }}
              />
            </span>
          </Space>
        </span>
      </div>
      <div className={styles.progress}>
        <Progress
          percent={percent}
          size={['100%' as unknown as number, 2]}
          showInfo={false}
          status={status === 'Error' ? 'exception' : 'normal'}
        />
      </div>
      {status === 'Error' ? (
        <div className={styles.info + ' ' + styles.infoError}>文件上传失败 {info}</div>
      ) : (
        <div className={styles.info}>{info}</div>
      )}
    </div>
  );
};
export default UploadTableFileList;
