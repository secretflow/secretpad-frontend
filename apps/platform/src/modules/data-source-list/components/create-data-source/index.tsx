import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Descriptions,
  Drawer,
  Form,
  Input,
  Radio,
  Select,
  Space,
  Switch,
  Tooltip,
  message,
  notification,
} from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'umi';

import { hasAccess, Platform } from '@/components/platform-wrapper';
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
  const [searchParams] = useSearchParams();
  const ownerId = searchParams.get('ownerId');

  const [notificationApi, contextHolder] = notification.useNotification();

  const [form] = Form.useForm();
  const values = Form.useWatch([], form);
  const nodeIdsValue = Form.useWatch('nodeIds', form);
  const [disabled, setDisabled] = useState(true);
  // const [nodeStatus, setNodeStatus] = useState('pending');

  const closeHandler = () => {
    onClose();
    form.resetFields();
  };

  const handleOk = async () => {
    await form.validateFields().then(async (value) => {
      if (value.type === DataSourceType.ODPS) {
        value.name = 'ODPS-' + value.name;
      }

      const { status, data } = await dataSourceService.addDataSource({
        ...value,
        ownerId: ownerId,
      });
      if (status && status.code === 0) {
        message.success(`「${value.name}」注册成功」`);
        if (isAutonomyMode) {
          // 部分节点创建成功
          const errorNodesObj = data?.failedCreatedNodes || {};
          const errorNodeList = Object.keys(errorNodesObj).map((id) => ({
            nodeId: id,
            errorMessage: errorNodesObj[id],
          }));
          if (errorNodeList.length !== 0) {
            notificationApi.info({
              message: '部分节点创建失败',
              duration: 3,
              description: (
                <Space direction="vertical">
                  {errorNodeList.map((node) => {
                    return (
                      <Descriptions key={node.nodeId}>
                        <Descriptions.Item label={node.nodeId}>
                          {node.errorMessage}
                        </Descriptions.Item>
                      </Descriptions>
                    );
                  })}
                </Space>
              ),
            });
            closeHandler();
            return;
          }
        }
        closeHandler();
      } else {
        message.error(status?.msg || '注册失败');
        closeHandler();
      }
    });
  };

  const getNodeList = useCallback(async () => {
    await dataSourceService.queryAutonomyNodeList();
  }, []);

  const isAutonomyMode = hasAccess({ type: [Platform.AUTONOMY] });

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

  useEffect(() => {
    if (visible) {
      // p2p 模式下有多个节点，其他模式下只允许当前节点
      if (isAutonomyMode) {
        getNodeList();
      } else {
        dataSourceService.nodeOptions = [
          {
            value: nodeService.currentNode?.nodeId,
            label: nodeService.currentNode?.nodeName,
          },
        ];
      }
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      // p2p 模式下有多个节点，其他模式下只允许当前节点
      if (isAutonomyMode) {
        getNodeList();
      } else {
        dataSourceService.nodeOptions = [
          {
            value: nodeService.currentNode?.nodeId,
            label: nodeService.currentNode?.nodeName,
          },
        ];
      }
    }
  }, [visible]);

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

  const nodeOptionsFilter = dataSourceService.nodeOptions.map((item) => {
    if (
      (nodeIdsValue || []).some(
        (node: { nodeId: string }) => node?.nodeId === item.value,
      )
    ) {
      return {
        ...item,
        disabled: true,
      };
    } else {
      return {
        ...item,
        disabled: false,
      };
    }
  });

  return (
    <>
      {contextHolder}
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
            </Radio> */}
              <Radio value={DataSourceType.ODPS}>
                <Space>ODPS</Space>
              </Radio>
              <Radio value={DataSourceType.MYSQL}>
                <Space>MYSQL</Space>
              </Radio>
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
                    <Input.Password
                      autoComplete="new-text-field"
                      placeholder="请输入"
                    />
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
              ) : getFieldValue('type') === DataSourceType.MYSQL ? (
                <>
                  <Alert
                    message="MYSQL 数据暂不支持使用模型训练、特征处理类型组件"
                    type="info"
                    style={{ marginBottom: 16 }}
                  />
                  <Form.Item
                    label="显示名称"
                    name={['name']}
                    rules={[
                      { required: true, message: '请输入名称' },
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
                    ]}
                  >
                    <Input
                      addonBefore={'jdbc:mysql://'}
                      placeholder="请输入endpoint 例如: [hostname | ip]:port "
                    />
                  </Form.Item>
                  <Form.Item
                    label="user"
                    name={['dataSourceInfo', 'user']}
                    rules={[{ required: true, message: '请输入user' }]}
                  >
                    <Input placeholder="请输入" />
                  </Form.Item>
                  <Form.Item
                    label="password"
                    name={['dataSourceInfo', 'password']}
                    rules={[{ required: true, message: '请输入password' }]}
                  >
                    <Input.Password
                      autoComplete="new-text-field"
                      placeholder="请输入"
                    />
                  </Form.Item>
                  <Form.Item
                    label="database"
                    name={['dataSourceInfo', 'database']}
                    rules={[
                      { required: true, message: '请输入database' },
                      { max: 63, min: 3, message: '长度限制3~63字节' },
                      {
                        pattern: /^[a-zA-Z_]([A-Za-z0-9-_]*)$/,
                        message: '字母或下划线开头，可由字母/数字/中划线/下划线组成',
                      },
                    ]}
                  >
                    <Input placeholder="请输入" />
                  </Form.Item>
                </>
              ) : (
                <>
                  <Form.Item
                    label="ODPS Project名称"
                    name={['dataSourceInfo', 'project']}
                    rules={[
                      { required: true, message: '请输入ODPS Project名称' },
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
                    label="显示名称"
                    name={['name']}
                    rules={[
                      { required: true, message: '请输入名称' },
                      { max: 32, message: '长度限制32' },
                      {
                        pattern: /^[\u4E00-\u9FA5A-Za-z0-9-_]+$/,
                        message: '只能包含中文/英文/数字/下划线/中划线',
                      },
                    ]}
                  >
                    <Input
                      placeholder="名称可由中文/英文/数字/下划线/中划线组成，长度限制32"
                      addonBefore={'ODPS-'}
                    />
                  </Form.Item>

                  <Form.Item
                    label="endpoint名称"
                    name={['dataSourceInfo', 'endpoint']}
                    rules={[
                      { required: true, message: '请输入endpoint名称' },
                      { max: 64, message: '长度限制64' },
                    ]}
                  >
                    <Input placeholder="请输入" />
                  </Form.Item>
                  <Form.Item
                    label="AccessKeyID"
                    name={['dataSourceInfo', 'accessId']}
                    rules={[{ required: true, message: '请输入AccessID' }]}
                  >
                    <Input placeholder="请输入" />
                  </Form.Item>
                  <Form.Item
                    label="AccessKeySecret"
                    name={['dataSourceInfo', 'accessKey']}
                    rules={[{ required: true, message: '请输入AccessKey' }]}
                  >
                    <Input.Password
                      autoComplete="new-text-field"
                      placeholder="请输入"
                    />
                  </Form.Item>
                </>
              );
            }}
          </Form.Item>
          <div className={styles.nodeTitle}>节点连接配置</div>
          <Form.List
            name="nodeIds"
            initialValue={
              isAutonomyMode
                ? [{}]
                : [
                    {
                      nodeId: nodeService.currentNode?.nodeId,
                    },
                  ]
            }
          >
            {(fields, { add, remove }) => (
              <Space direction="vertical">
                <div className={styles.nodeContent}>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space
                      key={key}
                      style={{
                        display: 'flex',
                      }}
                      align="baseline"
                    >
                      {`节点: ${name + 1}`}
                      <Form.Item
                        {...restField}
                        name={[name, 'nodeId']}
                        rules={[{ required: true, message: '请选择节点' }]}
                      >
                        <Select
                          placeholder="请选择"
                          options={nodeOptionsFilter}
                          size="middle"
                          style={{ width: 160 }}
                        />
                      </Form.Item>
                      {fields.length > 1 && (
                        <DeleteOutlined onClick={() => remove(name)} />
                      )}
                    </Space>
                  ))}
                </div>
                {isAutonomyMode && (
                  <div>
                    <Tooltip
                      placement="right"
                      title={fields.length >= 5 ? '最多可添加5个节点' : ''}
                    >
                      <Button
                        disabled={fields.length >= 5}
                        type="link"
                        onClick={() => add()}
                        icon={<PlusOutlined />}
                        className={styles.addBtn}
                      >
                        添加节点连接配置
                      </Button>
                    </Tooltip>
                  </div>
                )}
              </Space>
            )}
          </Form.List>
          {/* 一期没有校验功能 */}
          {/* <span className={styles.nodeStatusTag}>
            {nodeTestContent[nodeStatus as keyof typeof nodeTestContent]}
          </span> */}
        </Form>
      </Drawer>
    </>
  );
};
