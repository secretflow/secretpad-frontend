import { CheckCircleOutlined } from '@ant-design/icons';
import classNames from 'classnames';

import { ComponentIcons } from '@/modules/component-tree/component-icon';

import styles from './index.less';

interface IProps {
  nodes: {
    id: string;
    icon: string;
    label: string;
    nodeDef: {
      domain: string;
    };
  }[];
}

export const PreviewSubmitNode = (props: IProps) => {
  const { nodes = [] } = props;
  return (
    <div
      className={classNames({
        [styles.wrapper]: nodes.length > 1,
      })}
    >
      {nodes.map((item, index: number) => (
        <div key={item.id} className={styles.content}>
          <div className={styles.dagNode}>
            <span className={styles.icon}>
              {ComponentIcons[item.nodeDef.domain as string] ||
                ComponentIcons['default']}
            </span>
            <span className={styles.label}>{item.label}</span>
            <CheckCircleOutlined style={{ color: '#52C41A' }} />
          </div>
          {index < nodes.length - 1 && <div className={styles.line}></div>}
        </div>
      ))}
    </div>
  );
};
