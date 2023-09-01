import type { Node } from '@antv/x6';
import { ShapeRegister } from '@secretflow/dag';
import { Tooltip } from 'antd';
import classnames from 'classnames';

import styles from './index.less';

const GuideNode = ({ node }: { node: Node }) => {
  const data = node.getData<any>();
  const { name, description } = data;

  return (
    <Tooltip title={description}>
      <div className={styles['guide-node']}>
        <span className={classnames(styles.img, styles[`img${node.id}`])} />
        <span className={styles.text}>{name}</span>
      </div>
    </Tooltip>
  );
};

// register node
ShapeRegister({
  shape: 'guide-node',
  width: 124,
  height: 54,
  component: GuideNode,
  effect: ['data'],
  inherit: 'react-shape',
});
