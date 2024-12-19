import { ExclamationCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Flex, Form, Tooltip } from 'antd';

import type { RenderProp } from '../../config-render-protocol';

import styles from './index.less';
import type { Feature } from './output-feature-show';
import { OutputFeatureShow } from './output-feature-show';

export const upstreamOutputFeatureSerializer = (val: Feature[], clsName: string) => {
  const cw = val;
  return { ...{ custom_value: cw }, custom_protobuf_cls: clsName };
};

export const upstreamOutputFeatureUnserializer = (val?: {
  custom_value: Feature[];
}) => {
  const name = 'custom_value';
  if (!val || !val[name]) {
    return [];
  }
  const value = val[name];
  return value;
};

/**
 * 上游算子输出到结果表展示
 */
export const UpstreamOutputFeatureRender: React.FC<RenderProp<Feature[]>> = (
  config,
) => {
  const { onChange, value, node } = config;

  return (
    <Form.Item noStyle>
      <Form.Item noStyle>
        <Flex
          style={{ color: 'orange', fontSize: 12, marginBottom: 8 }}
          align="baseline"
          gap={8}
        >
          <div>
            <ExclamationCircleOutlined />
          </div>
          <div>如使用 scql 分析组件，字段名不可存在 sql 关键字和中划线</div>
        </Flex>

        <Flex gap="small">
          <div className={styles.inputTitle}>输入</div>
          <div>
            <Tooltip title="修改连线后需要重新保存配置">
              <QuestionCircleOutlined
                style={{
                  color: '#00000073',
                }}
              />
            </Tooltip>
          </div>
        </Flex>
      </Form.Item>
      <Form.Item name={node.name}>
        <OutputFeatureShow {...config} value={value} onChange={onChange} />
      </Form.Item>
    </Form.Item>
  );
};
