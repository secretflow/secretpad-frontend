import Icon, { CheckCircleFilled } from '@ant-design/icons';
import type { FormInstance } from 'antd';
import { Button, Drawer, Form, Input, Space, Typography } from 'antd';
import classnames from 'classnames';
import { useEffect, useState } from 'react';

import styles from './index.less';
import {
  TemplateIcon,
  type PipelineTemplateContribution,
  PipelineTemplateType,
} from './pipeline-protocol';

interface ICreatePipelineModal {
  visible: boolean;
  data: {
    templateList: PipelineTemplateContribution[];
    form: FormInstance<any>;
    submit: () => Promise<void>;
  };
  close: () => void;
}

const order = [
  PipelineTemplateType.BLANK,
  PipelineTemplateType.RISK,
  PipelineTemplateType.PSI,
];

const P2PCreatePipelineModal = ({ visible, data, close }: ICreatePipelineModal) => {
  const [currentTemplateId, setCurrentTemplateId] = useState('blank');
  const { Link, Title, Text } = Typography;
  const { templateList, form, submit } = data;
  const templates = templateList
    .map((item) => ({
      ...item,
      id: item.type,
      icon: TemplateIcon[item.type],
    }))
    .sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));

  const templateName = Form.useWatch('name', form);

  useEffect(() => {
    form.setFieldValue('templateId', 'blank');
  }, []);

  return (
    <Drawer
      width={560}
      title={'创建训练流'}
      destroyOnClose
      open={visible}
      onClose={close}
      footer={
        <Space style={{ float: 'right' }}>
          <Button onClick={close}>取消</Button>
          <Button
            type="primary"
            onClick={submit}
            className={classnames({
              [styles.buttonDisable]: !templateName,
            })}
          >
            创建
          </Button>
        </Space>
      }
    >
      <Form form={form} preserve={false} layout="vertical" requiredMark="optional">
        <Form.Item
          label={<div>训练流名称</div>}
          name="name"
          rules={[
            { required: true, message: '请输入训练流名称！' },
            { type: 'string', max: 32, message: '训练流名称长度不能超过32个字符' },
            {
              pattern: /^[\u4e00-\u9fa5a-zA-Z0-9_-]+$/gi,
              message: '只能包含中文、大小写英文、数字、下划线、中划线',
            },
          ]}
        >
          <Input placeholder="请输入中文、大小写英文、数字、下划线、中划线，32个字符以内" />
        </Form.Item>
        <Form.Item label="选择模板" name="templateId" required>
          <div className={styles.templates}>
            {templates.map(({ id, name, description, icon }) => (
              <Link
                key={id}
                onClick={() => {
                  setCurrentTemplateId(id);
                  form.setFieldValue('templateId', id);
                }}
                className={classnames(styles.item, {
                  [styles.checked]: currentTemplateId === id,
                })}
              >
                <div className={styles.templateIcon}>
                  <Icon component={icon} />
                </div>
                <Typography className={styles.text}>
                  <Title level={5} className={styles.title}>
                    {name}
                  </Title>
                  <Text ellipsis type="secondary" className={styles.description}>
                    {description}
                  </Text>
                </Typography>
                <CheckCircleFilled className={styles.icon} />
              </Link>
            ))}
          </div>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default P2PCreatePipelineModal;
