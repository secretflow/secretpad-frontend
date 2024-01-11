import type { Node } from '@antv/x6';
import { register as ShapeRegister } from '@antv/x6-react-shape';
import classnames from 'classnames';

import styles from './index.less';

const GuideNode = ({ node }: { node: Node }) => {
  const data = node.getData<any>();
  const { name, description, index } = data;

  return (
    <div className={styles['guide-node']}>
      <span className={styles.index}>{index}</span>
      <span className={styles.text}>
        <div>{name}</div>
        <div className={styles.description}>{description}</div>
      </span>
    </div>
  );
};

const InputNode = ({ node }: { node: Node }) => {
  const data = node.getData<any>();
  const { name } = data;

  return (
    <div className={classnames(styles['guide-input-node'], styles[`input${node.id}`])}>
      <div className={classnames(styles.img, styles[`img${node.id}`])} />
      <div className={styles.text}>
        <div>{name}</div>
      </div>
    </div>
  );
};

// register node
ShapeRegister({
  shape: 'guide-node',
  width: 155,
  height: 67,
  component: GuideNode,
  effect: ['data'],
  inherit: 'react-shape',
});

ShapeRegister({
  shape: 'guide-input-node',
  width: 50,
  height: 73,
  component: InputNode,
  effect: ['data'],
  inherit: 'react-shape',
});
