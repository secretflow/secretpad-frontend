import { Tag } from 'antd';

import styles from './embedded-node.less';

const embeddedNodeInfo = [
  {
    nodeName: 'alice',
    datatableName: 'alice.csv',
  },
  {
    nodeName: 'bob',
    datatableName: 'bob.csv',
  },
];

export const EmbeddedNodePreview = () => {
  return (
    <div className={styles.embeddedNodes}>
      {embeddedNodeInfo.map((embedded, index) => {
        return (
          <div className={styles.embeddedNode} key={index}>
            <div className={styles.nodeContent}>
              <div>
                <Tag color="success">内置</Tag>
              </div>
              <div>
                <div className={styles.header}>节点：{embedded.nodeName}</div>
                <div className={styles.table}>{embedded.datatableName}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
