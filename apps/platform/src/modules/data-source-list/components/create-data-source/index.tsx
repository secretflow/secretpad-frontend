import { ExclamationCircleOutlined } from '@ant-design/icons';
import {
  Button,
  Drawer,
  Form,
  Input,
  Radio,
  Select,
  Space,
  Switch,
  Tooltip,
  message,
} from 'antd';
import React, { useEffect, useState } from 'react';

import {
  DataSourceService,
  DataSourceType,
} from '@/modules/data-source-list/data-source-list.service';
import { NodeService } from '@/modules/node';
import { useModel } from '@/util/valtio-helper';

import styles from './index.less';

export const CreateDataSourceModal: React.FC<{
  onClose: () => void;
  visible: boolean;
}> = ({ visible, onClose }) => {
  const dataSourceService = useModel(DataSourceService);
  const nodeService = useModel(NodeService);

  const [form] = Form.useForm();
  const values = Form.useWatch([], form);

  const [disabled, setDisabled] = useState(true);
  // const [nodeStatus, setNodeStatus] = useState('pending');

  const closeHandler = () => {
    onClose();
  };

  const handleOk = async () => {
    await form.validateFields().then(async (value) => {
      const { status } = await dataSourceService.addDataSource(value);
      if (status && status.code === 0) {
        message.success(`「${value.name}」注册成功」`);
      } else {
        message.error(status?.msg || '注册失败');
      }
    });

    onClose();
  };

  useEffect(() => {
    if (visible) {
      form.validateFields({ validateOnly: true }).then(
        () => {
          setDisabled(false);
        },
        () => {
          setDisabled(true);
        },
      );
    }
  }, [values, visible]);

  // const testNode = () => {
  // const nodeId = form.getFieldValue('nodeId');
  // todo 接口调用
  // 点击之后，变成loading
  // setNodeStatus('testing');
  // 接口返回之后 变成成功或者失败
  // setNodeStatus('succeed');
  // setNodeStatus('failed');
  // };

  // const nodeTestContent = {
  //   pending: (
  //     <Button type="link" className={styles.check} onClick={testNode}>
  //       校验
  //     </Button>
  //   ),
  //   testing: (
  //     <Button type="link" className={styles.testing} icon={<LoadingOutlined />}>
  //       校验中
  //     </Button>
  //   ),
  //   failed: (
  //     <Tag bordered={false} color="error">
  //       校验失败
  //     </Tag>
  //   ),
  //   succeed: (
  //     <Tag bordered={false} color="success">
  //       校验成功
  //     </Tag>
  //   ),
  // };

  return (
    <Drawer
      title="注册数据源"
      width={700}
      open={visible}
      onClose={closeHandler}
      footer={
        <div className={styles.actions}>
          <Space>
            <Button onClick={closeHandler}>取消</Button>
            <Button type="primary" onClick={handleOk} disabled={disabled}>
              提交
            </Button>
          </Space>
        </div>
      }
    >
      <Form
        form={form}
        autoComplete="off"
        layout="vertical"
        requiredMark="optional"
        className={styles.manualColInfo}
      >
        <Form.Item
          name="type"
          label="数据源类型"
          rules={[{ required: true, message: '请选择数据源类型' }]}
          initialValue={DataSourceType.OSS}
        >
          <Radio.Group>
            <Radio value={DataSourceType.OSS}>
              <div>
                OSS
                <Tooltip
                  title={
                    <div style={{ maxWidth: '245px', whiteSpace: 'nowrap' }}>
                      OSS存储支持CSV文件类型的数据资产
                    </div>
                  }
                >
                  <ExclamationCircleOutlined
                    style={{
                      marginLeft: '9px',
                      cursor: 'pointer',
                      color: '#00000073',
                    }}
                  />
                </Tooltip>
              </div>
            </Radio>
            {/* <Radio value={DataSourceType.HTTP}>
              <Space>HTTP</Space>
            </Radio>
            <Radio value={DataSourceType.ODPS}>
              <Space>ODPS</Space>
            </Radio> */}
          </Radio.Group>
        </Form.Item>
        <Form.Item dependencies={['type']} noStyle>
          {({ getFieldValue }) => {
            return getFieldValue('type') === DataSourceType.OSS ? (
              <>
                <Form.Item
                  label="显示名称"
                  name={'name'}
                  rules={[
                    { required: true, message: '请输入显示名称' },
                    { max: 32, message: '长度限制32' },
                    {
                      pattern: /^[\u4E00-\u9FA5A-Za-z0-9-_]+$/,
                      message: '只能包含中文/英文/数字/下划线/中划线',
                    },
                  ]}
                >
                  <Input placeholder="名称可由中文/英文/数字/下划线/中划线组成，长度限制32" />
                </Form.Item>
                <Form.Item
                  label="endpoint名称"
                  name={['dataSourceInfo', 'endpoint']}
                  rules={[
                    { required: true, message: '请输入endpoint名称' },
                    { max: 64, message: '长度限制64' },
                    // {
                    //   pattern: /^[a-zA-Z]([a-zA-Z0-9-_]*)$/,
                    //   message: '英文字母开头，可由英文/数字/下划线/中划线组成',
                    // },
                  ]}
                >
                  <Input placeholder="请输入" />
                </Form.Item>
                <Form.Item
                  label="AccessKeyID"
                  name={['dataSourceInfo', 'ak']}
                  rules={[{ required: true, message: '请输入AccessKeyID' }]}
                >
                  <Input placeholder="请输入" />
                </Form.Item>
                <Form.Item
                  label="AccessKeySecret"
                  name={['dataSourceInfo', 'sk']}
                  rules={[{ required: true, message: '请输入AccessKeySecret' }]}
                >
                  <Input.Password autoComplete="new-text-field" placeholder="请输入" />
                </Form.Item>
                <Form.Item
                  label="virtualhost"
                  required
                  name={['dataSourceInfo', 'virtualhost']}
                  valuePropName="checked"
                >
                  <Switch defaultChecked={false} />
                </Form.Item>
                <Form.Item
                  label="bucket"
                  name={['dataSourceInfo', 'bucket']}
                  rules={[
                    { required: true, message: '请输入bucket' },
                    { max: 63, min: 3, message: '长度限制3~63字节' },
                    {
                      pattern: /^[a-z0-9]([a-z0-9-]*)$/,
                      message: '小写字母或者数字开头，可由小写字母/数字/中划线组成',
                    },
                  ]}
                >
                  <Input placeholder="请输入" />
                </Form.Item>
                <Form.Item label="预设路径" name={['dataSourceInfo', 'prefix']}>
                  <Input placeholder="请输入" />
                </Form.Item>
              </>
            ) : getFieldValue('type') === DataSourceType.HTTP ? (
              <Form.Item
                label="显示名称"
                name={['dataSourceInfo', 'name']}
                rules={[
                  { required: true, message: '请输入模型名称' },
                  { max: 32, message: '长度限制32' },
                  {
                    pattern: /^[\u4E00-\u9FA5A-Za-z0-9-_]+$/,
                    message: '只能包含中文/英文/数字/下划线/中划线',
                  },
                ]}
              >
                <Input placeholder="名称可由中文/英文/数字/下划线/中划线组成，长度限制32" />
              </Form.Item>
            ) : (
              <Form.Item
                label="ODPS Project名称"
                name={['dataSourceInfo', 'name']}
                rules={[
                  { required: true, message: '请输入模型名称' },
                  { max: 32, message: '长度限制32' },
                  {
                    pattern: /^[\u4E00-\u9FA5A-Za-z0-9-_]+$/,
                    message: '只能包含中文/英文/数字/下划线/中划线',
                  },
                ]}
              >
                <Input placeholder="名称可由中文/英文/数字/下划线/中划线组成，长度限制32" />
              </Form.Item>
            );
          }}
        </Form.Item>
        <div className={styles.nodeTitle}>节点连接配置</div>
        <div className={styles.nodeContent}>
          <span className={styles.nodeName}>节点1：</span>
          <Form.Item
            label=""
            name={'nodeId'}
            initialValue={nodeService.currentNode?.nodeId}
          >
            <Select
              placeholder="请选择"
              options={[
                {
                  value: nodeService.currentNode?.nodeId,
                  label: nodeService.currentNode?.nodeName,
                },
              ]}
            />
          </Form.Item>
          {/* 一期没有校验功能 */}
          {/* <span className={styles.nodeStatusTag}>
            {nodeTestContent[nodeStatus as keyof typeof nodeTestContent]}
          </span> */}
        </div>
      </Form>
    </Drawer>
  );
};
