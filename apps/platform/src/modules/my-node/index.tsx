import { EditOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import {
  Badge,
  Breadcrumb,
  Card,
  Descriptions,
  Tag,
  Typography,
  Input,
  Table,
  Divider,
  Spin,
  Modal,
  Form,
  Tooltip,
  Space,
} from 'antd';
import type { InputRef } from 'antd';
import { toNumber } from 'lodash';
import { parse } from 'query-string';
import { useState, useRef, useEffect } from 'react';
import { history } from 'umi';
import { useLocation } from 'umi';

import { ReactComponent as CanUseNodeImg } from '@/assets/enable-node-instance.svg';
import GuideGirlBg from '@/assets/guide-girl.png';
import { ReactComponent as MyNodeImg } from '@/assets/my-node.svg';
import { AccessWrapper, Platform, hasAccess } from '@/components/platform-wrapper';
import { PopoverCopy } from '@/components/popover-copy';
import { Model, getModel, useModel } from '@/util/valtio-helper';

import { formatTimestamp } from '../dag-result/utils';
import { NodeState, NodeStateText } from '../managed-node-list';

import { NodeFunc } from './components/node-func';
import styles from './index.less';
import { MyNodeService } from './my-node.service';

const { Title } = Typography;

export enum StatusArea {
  success = '节点可用',
  error = '节点不可用',
}

enum DomainCertConfigEnum {
  // configured
  configured = 'configured',
  // unConfigured
  unconfirmed = 'unconfirmed',
}

export const MyNodeComponent: React.FC = () => {
  // const myNodeService = useModel(MyNodeService);
  const myNodeService = useModel(MyNodeService);
  const [form] = Form.useForm();
  const values = Form.useWatch([], form);

  const { search } = useLocation();
  const { nodeId } = parse(search);

  const [isEdit, setIsEdit] = useState(false);

  const [inputValue, setInputValue] = useState('');

  const inputRef = useRef<InputRef>(null);

  const { nodeInstances, nodeInfo, enableInstance, allInstance } = myNodeService;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    myNodeService.getNodeInfo(nodeId as string);
  }, [nodeId]);

  useEffect(() => {
    if (isModalOpen) {
      form.validateFields({ validateOnly: true }).then(
        () => {
          setDisabled(false);
        },
        () => {
          setDisabled(true);
        },
      );
    }
  }, [values]);

  useEffect(() => {
    if (isEdit) {
      inputRef.current?.focus({
        cursor: 'end',
      });
      setInputValue(nodeInfo?.netAddress || '');
    }
  }, [isEdit]);

  const columns = [
    {
      title: 'HostName',
      dataIndex: 'name',
      key: 'name',
      width: '18%',
      ellipsis: true,
      render: (name: string) => <Typography.Text ellipsis>{name}</Typography.Text>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: '16%',
      ellipsis: true,
      render: (status: NodeState) => {
        return (
          <Badge
            status={NodeStateText[(status as NodeState) || NodeState.UNKNOWN].icon}
            text={NodeStateText[(status as NodeState) || NodeState.UNKNOWN].text}
          />
        );
      },
    },
    {
      title: '实例系统版本',
      dataIndex: 'version',
      key: 'version',
      width: '16%',
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'lastTransitionTime',
      key: 'lastTransitionTime',
      width: '16%',
      ellipsis: true,
      render: (lastTransitionTime: string) => (
        <Typography.Text
          ellipsis={{
            tooltip: `${formatTimestamp(lastTransitionTime)}`,
          }}
        >
          {formatTimestamp(lastTransitionTime)}
        </Typography.Text>
      ),
    },
    {
      title: '最后心跳时间',
      dataIndex: 'lastHeartbeatTime',
      key: 'lastHeartbeatTime',
      width: '16%',
      ellipsis: true,
      render: (lastHeartbeatTime: string) => (
        <Typography.Text
          ellipsis={{
            tooltip: `${formatTimestamp(lastHeartbeatTime)}`,
          }}
        >
          {formatTimestamp(lastHeartbeatTime)}
        </Typography.Text>
      ),
    },
    // {
    //   title: '操作',
    //   dataIndex: 'options',
    //   key: 'options',
    //   render: (_text: string, record: { resources: ResourceType[] }) => {
    //     const resources = record.resources || [];
    //     if (resources.length === 0) {
    //       return (
    //         <Tooltip title="当前节点暂无资源使用情况">
    //           <span>资源使用情况</span>
    //         </Tooltip>
    //       );
    //     }
    //     return (
    //       <Popover
    //         placement="left"
    //         title="资源使用情况"
    //         content={
    //           <>
    //             <div>
    //               <Progress
    //                 type="dashboard"
    //                 size={80}
    //                 gapDegree={1}
    //                 strokeColor="rgb(82, 196, 26)"
    //                 percent={getPercent(resources, 'cpu')}
    //                 style={{ marginRight: 8 }}
    //                 format={(percent) => `${percent?.toFixed(0)} %`}
    //                 status={'normal'}
    //               />
    //               <Progress
    //                 type="dashboard"
    //                 size={80}
    //                 gapDegree={1}
    //                 strokeColor="rgb(82, 196, 26)"
    //                 percent={getPercent(resources, 'memory')}
    //                 style={{ marginRight: 8 }}
    //                 format={(percent) => `${percent?.toFixed(0)} %`}
    //                 status={'normal'}
    //               />
    //               <Progress
    //                 type="dashboard"
    //                 size={80}
    //                 gapDegree={1}
    //                 strokeColor="rgb(82, 196, 26)"
    //                 percent={getPercent(resources, 'storage')}
    //                 format={(percent) => `${percent?.toFixed(0)} %`}
    //                 style={{ marginRight: 8 }}
    //                 status={'normal'}
    //               />
    //             </div>
    //             <div className={styles.memorySize}>
    //               <div>CPU</div>
    //               <div>内存</div>
    //               <div>磁盘</div>
    //             </div>
    //           </>
    //         }
    //         trigger="click"
    //       >
    //         <span className={styles.spanClick}>资源使用情况</span>
    //       </Popover>
    //     );
    //   },
    // },
  ];

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    await form.validateFields().then(async (value) => {
      const res = await myNodeService.resetEdgeNodePwd(
        nodeId as string,
        nodeId as string,
        value.passwordHash,
        value.newPassword,
      );
      if (res) {
        setIsModalOpen(false);
        form.resetFields();
      }
    });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const NodeReadyList = [NodeState.READY, NodeState.SUCCEEDED];
  const TooltipOpen = !NodeReadyList.includes(
    (nodeInfo?.nodeStatus as NodeState) || NodeState.UNKNOWN,
  );

  return (
    <div className={styles.myNode}>
      <Breadcrumb
        items={[
          {
            title: (
              <div
                onClick={() => {
                  history.back();
                }}
                style={{ cursor: 'pointer' }}
              >
                返回
              </div>
            ),
          },
          {
            title: '我的节点',
          },
        ]}
      />
      <Spin spinning={myNodeService.nodeInfoLoading}>
        <div className={styles.card}>
          <Card
            title={
              <div className={styles.header}>
                <Title className={styles.title} level={4}>
                  {nodeInfo?.nodeName}
                </Title>
                <Tooltip
                  placement="right"
                  defaultOpen={false}
                  open={TooltipOpen}
                  title="节点不可用，建议检查节点容器是否正常"
                >
                  <Tag
                    icon={
                      <Badge
                        status={
                          NodeStateText[
                            (nodeInfo?.nodeStatus as NodeState) || NodeState.UNKNOWN
                          ].icon
                        }
                      />
                    }
                    color={
                      NodeStateText[
                        (nodeInfo?.nodeStatus as NodeState) || NodeState.UNKNOWN
                      ].icon
                    }
                  >
                    <span className={styles.statusText}>
                      {
                        NodeStateText[
                          (nodeInfo?.nodeStatus as NodeState) || NodeState.UNKNOWN
                        ].text
                      }
                    </span>
                  </Tag>
                </Tooltip>
              </div>
            }
            bordered={false}
          >
            <Descriptions column={2}>
              <Descriptions.Item label="节点ID">{nodeInfo?.nodeId}</Descriptions.Item>
              {hasAccess({ type: [Platform.AUTONOMY] }) && (
                <Descriptions.Item label="中心管控节点ID">
                  {nodeInfo?.masterNodeId}
                </Descriptions.Item>
              )}
              <Descriptions.Item
                label={
                  <Space>
                    通讯地址
                    {hasAccess({ type: [Platform.AUTONOMY] }) && (
                      <Tooltip title="通讯地址改变,节点认证码也会改变" placement="top">
                        <QuestionCircleOutlined />
                      </Tooltip>
                    )}
                  </Space>
                }
              >
                {isEdit ? (
                  <Input
                    ref={inputRef}
                    style={{ width: '300px' }}
                    onBlur={() => {
                      setIsEdit(false);
                      myNodeService.changeCommonNetAddress(
                        inputValue,
                        nodeId as string,
                      );
                    }}
                    onPressEnter={() => {
                      setIsEdit(false);
                      myNodeService.changeCommonNetAddress(
                        inputValue,
                        nodeId as string,
                      );
                    }}
                    onChange={(e) => setInputValue(e.target.value)}
                    value={inputValue}
                  />
                ) : (
                  <div className={styles.address}>
                    <span>{nodeInfo?.netAddress}</span>
                    <EditOutlined onClick={() => setIsEdit(true)} />
                  </div>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="通讯协议">
                {nodeInfo?.protocol}
              </Descriptions.Item>
              {hasAccess({ type: [Platform.CENTER] }) && (
                <Descriptions.Item label="节点证书">
                  {nodeInfo.cert && nodeInfo.cert === DomainCertConfigEnum.configured
                    ? '已配置'
                    : '待配置'}
                </Descriptions.Item>
              )}
              {hasAccess({ type: [Platform.AUTONOMY] }) && (
                <>
                  <Descriptions.Item label="公钥">
                    <PopoverCopy
                      title="节点公钥"
                      icon="复制公钥"
                      copyText={nodeInfo?.certText}
                    />
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <Space>
                        节点认证码
                        <Tooltip
                          title="通过认证码可快速进行节点授权合作"
                          placement="top"
                        >
                          <QuestionCircleOutlined />
                        </Tooltip>
                      </Space>
                    }
                  >
                    <PopoverCopy
                      title="节点认证码"
                      icon="复制认证码"
                      copyText={nodeInfo?.nodeAuthenticationCode}
                    />
                  </Descriptions.Item>
                </>
              )}
              {hasAccess({ type: [Platform.CENTER, Platform.EDGE] }) && (
                <>
                  {nodeInfo.type !== 'embedded' && (
                    <Descriptions.Item
                      label={
                        <Space>
                          中心平台账号
                          <Tooltip
                            title={`初始化密码是: ${nodeId}12#$qwER`}
                            placement="top"
                          >
                            <QuestionCircleOutlined />
                          </Tooltip>
                        </Space>
                      }
                    >
                      <div style={{ marginRight: '8px' }}>{nodeId}</div>
                      <Typography.Link onClick={showModal}>设置密码</Typography.Link>
                      <Modal
                        className={styles.passwordModel}
                        title="设置密码"
                        open={isModalOpen}
                        onOk={handleOk}
                        okButtonProps={{ disabled }}
                        onCancel={handleCancel}
                      >
                        <div className={styles.name}>账号名：{nodeId}</div>
                        <Form
                          form={form}
                          layout="vertical"
                          requiredMark="optional"
                          autoComplete="off"
                        >
                          <Form.Item
                            name="passwordHash"
                            label="原密码"
                            rules={[
                              { required: isModalOpen, message: '请输入原密码' },
                              {
                                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{8,20}$/,
                                message: '需同时包含小写字母、大写字母、数字，8-20字符',
                              },
                            ]}
                          >
                            <Input.Password placeholder="请输入" />
                          </Form.Item>
                          <Form.Item
                            name="newPassword"
                            label="新密码"
                            rules={[
                              { required: isModalOpen, message: '请输入新密码' },
                              {
                                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{8,20}$/,
                                message: '需同时包含小写字母、大写字母、数字，8-20字符',
                              },
                            ]}
                          >
                            <Input.Password placeholder="请输入" />
                          </Form.Item>
                          <Form.Item
                            name="verifiedNewPassword"
                            label="新密码确认"
                            dependencies={['newPassword', 'passwordHash']}
                            rules={[
                              { required: isModalOpen, message: '请再次确认' },
                              {
                                validator(_, value: string) {
                                  if (isModalOpen) {
                                    if (value) {
                                      const passwordHash =
                                        form.getFieldValue('passwordHash');
                                      const newPassword =
                                        form.getFieldValue('newPassword');
                                      if (value === passwordHash) {
                                        return Promise.reject(
                                          new Error('新密码与当前密码不能一致'),
                                        );
                                      }
                                      if (value !== newPassword) {
                                        return Promise.reject(
                                          new Error('请与新密码保持一致'),
                                        );
                                      }
                                    }
                                  }
                                  return Promise.resolve();
                                },
                              },
                            ]}
                          >
                            <Input.Password placeholder="请输入" />
                          </Form.Item>
                        </Form>
                      </Modal>
                    </Descriptions.Item>
                  )}
                </>
              )}
            </Descriptions>
            <Divider className={styles.divider}>
              <div className={styles.bg}>
                <img src={GuideGirlBg} />
              </div>
            </Divider>
            <AccessWrapper
              accessType={{
                type: [Platform.AUTONOMY],
              }}
            >
              <div className={styles.nodefunc}>
                <Typography.Title level={5}>节点能力</Typography.Title>
                <NodeFunc />
              </div>
            </AccessWrapper>
            <div className={styles.titleinstance}>
              <Typography.Title level={5}>节点实例</Typography.Title>
              <span>
                节点实例是可以在平台管理的最小可部署的计算单元，一般对应一台物理机或虚拟机，包含一组已编排的容器。单机模式部署时，一个节点有一个节点实例；集群模式部署时，一个节点有多个节点实例。
              </span>
            </div>
            <div className={styles.box}>
              <div className={styles.topBox}>
                可用实例/实例总数 {enableInstance}/{allInstance}
              </div>
              <div className={styles.bottomImg}>
                {enableInstance ?? 0
                  ? Array(enableInstance)
                      ?.fill('')
                      ?.map((_, index) => <CanUseNodeImg key={index} />)
                  : ''}
                {allInstance ?? 0
                  ? Array(Number(allInstance) - Number(enableInstance))
                      ?.fill('')
                      .map((_, index) => <MyNodeImg key={index} />)
                  : ''}
              </div>
            </div>
            <Table
              rowKey={'name'}
              columns={columns}
              dataSource={nodeInstances}
              pagination={false}
            />
          </Card>
        </div>
      </Spin>
      <div className={styles.cardBottom}></div>
    </div>
  );
};

export class MyNodeModel extends Model {
  readonly myNodeService;

  constructor() {
    super();
    this.myNodeService = getModel(MyNodeService);
  }
}

type NameType = 'cpu' | 'memory' | 'pods' | 'storage';

type ResourceType = {
  allocatable: string;
  name: string;
  capacity: string;
};

const unitMap = {
  Bi: 1 / 1024,
  Ki: 1,
  Mi: 1024,
  Gi: 1024 * 1024,
};

const getPercent = (list: ResourceType[], name: NameType) => {
  const item = list.find((resourceItem: ResourceType) => resourceItem.name === name);
  if (!item) return 0;
  if (name === 'cpu') {
    return (
      ((toNumber(item.capacity) - toNumber(item.allocatable)) /
        toNumber(item.allocatable)) *
      100
    );
  } else {
    const allUnit = item.allocatable.slice(
      item.allocatable.length - 2,
      item.allocatable.length,
    ) as keyof typeof unitMap;
    const capUnit = item.capacity.slice(
      item.capacity.length - 2,
      item.capacity.length,
    ) as keyof typeof unitMap;
    const allocatable = item.allocatable.slice(0, item.allocatable.length - 2);
    const capacity = item.capacity.slice(0, item.capacity.length - 2);
    // use Ki unit calc  (capacity-allocatable) /  allocatable
    return (
      ((toNumber(capacity) * unitMap[capUnit] -
        toNumber(allocatable) * unitMap[allUnit]) /
        (toNumber(allocatable) * unitMap[allUnit])) *
      100
    );
  }
};
