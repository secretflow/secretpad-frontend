import { EyeOutlined } from '@ant-design/icons';
import { Popover, Typography } from 'antd';

import styles from './index.less';

const { Paragraph } = Typography;

interface IProps {
  title?: string;
  copyText?: string;
  icon?: string | React.ReactNode;
}

export const PopoverCopy = (props: IProps) => {
  const { title, copyText, icon = '复制' } = props;
  return (
    <div className={styles.popoverCopy}>
      <Popover
        placement="left"
        title={
          <div className={styles.publicTitle}>
            <span>{title}</span>
            <Paragraph
              copyable={{
                icon: icon,
                text: `${copyText || '暂无数据'}`,
              }}
              style={{ color: '#1677FF' }}
            ></Paragraph>
          </div>
        }
        overlayClassName={styles.publicKeyPopover}
        content={<div className={styles.publicKey}>{copyText || '暂无数据'}</div>}
        trigger="click"
      >
        <EyeOutlined className={styles.eyes} />
      </Popover>
      <Paragraph
        copyable={{
          text: copyText || '暂无数据',
        }}
      ></Paragraph>
    </div>
  );
};
