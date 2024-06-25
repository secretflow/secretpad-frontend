import { DownOutlined } from '@ant-design/icons';
import { Space, Typography } from 'antd';
import { useState } from 'react';

import styles from './index.less';

// const CodeContent = ``;

export const HttpQueryExample = () => {
  const [toggle, setToggle] = useState(false);

  return (
    <div className={styles.content}>
      <div>
        <Space>
          请求示例
          <Space onClick={() => setToggle(!toggle)}>
            <span className={styles.toggleBtn}>{toggle ? '收起' : '展开'}</span>
            <DownOutlined
              style={{
                transform: toggle ? `rotate(180deg)` : `rotate(0)`,
                color: '#0068fa',
              }}
            />
          </Space>
        </Space>
      </div>
      <div style={{ display: toggle ? 'block' : 'none' }}>
        <div style={{ marginTop: 16 }}>
          <Typography.Link
            href="https://www.secretflow.org.cn/zh-CN/docs/serving/0.3.1b0/reference/spi"
            target="_blank"
          >
            点击查看官网文档
          </Typography.Link>
        </div>
        {/* <ReactHightLighter
          type="java"
          codeString={CodeContent}
          className={styles.codeContent}
        /> */}
      </div>
    </div>
  );
};
