import { Form, Input } from 'antd';

import type { AtomicConfigNode } from '../../../component-config-protocol';

import styles from './index.less';

export const UnionRender = (prop: { node: AtomicConfigNode }) => {
  const { node, upstreamTables = [], disabled } = prop;
  const { name } = node;

  return (
    <Form.Item name={name} noStyle>
      <Form.Item
        label={<span className={styles.font}>输出表名</span>}
        name={[name, 'table_name']}
      >
        <Input style={{ width: '100%' }} placeholder="请输入" />
      </Form.Item>
    </Form.Item>
  );
};
