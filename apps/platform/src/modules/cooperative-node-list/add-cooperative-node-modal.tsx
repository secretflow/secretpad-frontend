import { CloseOutlined } from '@ant-design/icons';
import { Alert, Button, Drawer, Form, Input, message, Select, Space } from 'antd';
import type { ValidateStatus } from 'antd/es/form/FormItem';
import { parse } from 'query-string';
import { useEffect, useState } from 'react';
import { useLocation, history } from 'umi';

import { AccessWrapper, Platform, hasAccess } from '@/components/platform-wrapper';
import { useModel } from '@/util/valtio-helper';

import { NodeState } from '../managed-node-list';

import { CooperativeNodeService } from './cooperative-node.service';

import { SelectBefore, getProtocol, replaceProtocol } from './slectBefore';
import styles from './index.less';

export const AddCooperativeNodeDrawer = ({
  open,
  onClose,
  onOk,
}: {
  open: boolean;
  onClose: () => void;
  onOk: () => void;
}) => {
  const service = useModel(CooperativeNodeService);

  const { computeNodeList, computeNodeLoading } = service;
  const [messageApi, contextHolder] = message.useMessage();
  const [submittable, setSubmittable] = useState(false);
  const [serviceType, setServiceType] = useState('http://');
  const [cooperativeServiceType, setCooperativeServiceType] = useState('http://');

  const [form] = Form.useForm();

  const computeNodeId = Form.useWatch(['cooperativeNode', 'computeNodeName'], form);
  const verifyCodeValue = Form.useWatch('verifyCode', form);
  // Watch all values
  const values = Form.useWatch([], form);

  const { search } = useLocation();
  const { nodeId } = parse(search);

  useEffect(() => {
    if (service.nodeInfo.netAddress) {
      setServiceType(getProtocol(service.nodeInfo.netAddress));
    }
  }, [service.nodeInfo.netAddress]);

  useEffect(() => {
    if (open) {
      if (!hasAccess({ type: [Platform.AUTONOMY] })) {
        service.getComputeNodeList();
      }
    }
  }, [open]);

  useEffect(() => {
    form.validateFields({ validateOnly: true }).then(
      () => {
        setSubmittable(true);
      },
      () => {
        setSubmittable(false);
      },
    );
  }, [values]);

  useEffect(() => {
    if (!hasAccess({ type: [Platform.AUTONOMY] })) {
      // AUTONOMY 模式下，需要手动填写计算节点ID和计算节点名称
      form.setFieldValue(['cooperativeNode', 'computeNodeId'], computeNodeId);
      const address = computeNodeList.find(
        (item) => item.controlNodeId === computeNodeId,
      )?.netAddress;
      form.setFieldValue(['cooperativeNode', 'nodeAddress'], replaceProtocol(address));
      if (address) {
        const protocol = getProtocol(address);
        setCooperativeServiceType(protocol);
      }
    }
    form.setFieldValue(['cooperativeNode', 'computeControlNodeId'], 'master');
  }, [computeNodeId]);

  useEffect(() => {
    service.getNodeInfo();
  }, []);

  const handleOk = () => {
    form.validateFields().then(async (value) => {
      if (hasAccess({ type: [Platform.AUTONOMY] })) {
        const { status } = await service.addCooperativeNode({
          mode: 1,
          masterNodeId: 'master', // 管控节点默认 master 服务端预留字段
          dstNodeId: value.cooperativeNode.computeNodeId,
          name: value.cooperativeNode.computeNodeName,
          certText: value.cooperativeNode.cert,
          srcNetAddress: `${serviceType}${value.selfNode.nodeAddress}`,
          dstNetAddress: `${cooperativeServiceType}${value.cooperativeNode.nodeAddress}`,
        });
        if (status && status.code !== 0) {
          message.error(status.msg);
        } else {
          onOk();
          handleClose();
          messageApi.success(<>添加成功！</>);
        }
      } else {
        const { status } = await service.addApprovalAudit({
          nodeID: nodeId as string,
          voteType: 'NODE_ROUTE',
          voteConfig: {
            srcNodeId: nodeId as string,
            desNodeId: value.cooperativeNode.computeNodeId,
            srcNodeAddr: `${serviceType}${value.selfNode.nodeAddress}`,
            desNodeAddr: `${cooperativeServiceType}${value.cooperativeNode.nodeAddress}`,
            isSingle: false,
            // isSingle: value.cooperativeNode.routeType === 'FullDuplex' ? false : true,
          },
        });
        if (status && status.code !== 0) {
          message.error(status.msg);
        } else {
          onOk();
          handleClose();
          messageApi.success(
            <>
              添加成功！请到
              <a
                onClick={() => {
                  history.push(`/message?nodeId=${nodeId}`);
                }}
              >
                消息中心
              </a>
              查看合作进度
            </>,
          );
        }
      }
    });
  };

  const handleClose = () => {
    form.resetFields();
    setServiceType('http://');
    setCooperativeServiceType('http://');
    onClose();
  };

  const [verifyCodeStatus, setVerifyCodeStatus] = useState<ValidateStatus>('');
  const [verifyCodeHelp, setVerifyCodeHelp] = useState<string>('');
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    if (!verifyCodeValue) {
      setVerifyCodeStatus('');
      setVerifyCodeHelp('');
      setShowAlert(false);
    }
  }, [verifyCodeValue]);

  const handleParseVerifyCode = () => {
    try {
      const base64String = atob(verifyCodeValue);
      const jsonObj = JSON.parse(base64String);
      // 全部解析出值才算成功
      if (
        jsonObj.certText &&
        jsonObj.dstNodeId &&
        jsonObj.name &&
        jsonObj.dstNetAddress
      ) {
        const protocol = getProtocol(jsonObj.dstNetAddress);
        setCooperativeServiceType(protocol);
        form.setFieldsValue({
          cooperativeNode: {
            cert: jsonObj.certText,
            computeNodeId: jsonObj.dstNodeId,
            computeNodeName: jsonObj.name,
            nodeAddress: replaceProtocol(jsonObj.dstNetAddress),
          },
        });
        setShowAlert(true);
        setVerifyCodeStatus('');
        setVerifyCodeHelp('');
      } else {
        throw new Error('');
      }
    } catch (error) {
      setVerifyCodeStatus('error');
      setVerifyCodeHelp('无法解析，请确认输入的认证码是否正确');
      setShowAlert(false);
    }
  };

  return (
    <>
      <Drawer
        title="添加合作节点"
        placement="right"
        onClose={handleClose}
        destroyOnClose
        open={open}
        closable={false}
        width={560}
        className={styles.addCooperativeNodeDrawer}
        extra={
          <CloseOutlined
            style={{ fontSize: 12 }}
            onClick={() => {
              handleClose();
            }}
          />
        }
        footer={
          <Space style={{ float: 'right' }}>
            <Button onClick={handleClose}>取消</Button>
            <Button disabled={!submittable} type="primary" onClick={handleOk}>
              确定
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <div className={styles.subTitle}>合作节点</div>
          <div className={styles.formGroup}>
            <AccessWrapper accessType={{ type: [Platform.AUTONOMY] }}>
              <Form.Item
                name={'verifyCode'}
                className={styles.verifyCodeForm}
                validateStatus={verifyCodeStatus}
                help={verifyCodeHelp}
                label={
                  <div className={styles.verifyCodeCode}>
                    <div className={styles.tips}>节点认证码 (可选)</div>
                    <Button
                      disabled={!verifyCodeValue}
                      type="link"
                      className={styles.linkTips}
                      onClick={handleParseVerifyCode}
                    >
                      识别解析
                    </Button>
                  </div>
                }
              >
                <Input.TextArea
                  rows={4}
                  placeholder="请输入合作方认证码，识别解析后可自动填充合作节点信息"
                />
              </Form.Item>
              {showAlert && (
                <Alert
                  showIcon
                  message="认证码识别成功，节点信息已为你自动填充，建议不要手动修改"
                  type="success"
                  style={{ marginBottom: 8 }}
                />
              )}
              <Form.Item
                name={['cooperativeNode', 'computeControlNodeId']}
                label={'管控节点ID'}
              >
                <Input placeholder="选择计算节点后自动填充" disabled></Input>
              </Form.Item>
            </AccessWrapper>
            <Form.Item
              name={['cooperativeNode', 'computeNodeName']}
              label={'计算节点名'}
              rules={[
                {
                  required: true,
                  message: hasAccess({ type: [Platform.AUTONOMY] })
                    ? '请输入'
                    : '请选择',
                },
              ]}
            >
              {hasAccess({ type: [Platform.AUTONOMY] }) ? (
                <Input placeholder="请输入计算节点名" />
              ) : (
                <Select
                  placeholder="请选择"
                  options={computeNodeList
                    .filter(
                      (item) =>
                        item.nodeId !== nodeId && item.nodeStatus === NodeState.READY,
                    )
                    .map((item) => ({
                      value: item.nodeId,
                      label: item.nodeName,
                    }))}
                  loading={computeNodeLoading}
                  showSearch
                ></Select>
              )}
            </Form.Item>
            <Form.Item
              name={['cooperativeNode', 'computeNodeId']}
              label={'计算节点ID'}
              rules={[
                {
                  required: hasAccess({ type: [Platform.AUTONOMY] }) ? true : false,
                  message: '请输入',
                },
              ]}
            >
              {hasAccess({ type: [Platform.AUTONOMY] }) ? (
                <Input placeholder="请输入计算节点ID" />
              ) : (
                <Input placeholder="选择计算节点后自动填充" disabled />
              )}
            </Form.Item>
            <Form.Item
              name={['cooperativeNode', 'nodeAddress']}
              label={'节点通讯地址'}
              rules={[
                { required: true, message: '请输入通讯地址' },
                {
                  pattern:
                    /^.{1,50}:([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/,
                  message: '请输入正确的通讯地址',
                },
              ]}
            >
              <Input
                placeholder="127.0.0.1"
                addonBefore={
                  <SelectBefore
                    serviceType={cooperativeServiceType}
                    onChange={setCooperativeServiceType}
                  />
                }
              ></Input>
            </Form.Item>
            <AccessWrapper accessType={{ type: [Platform.AUTONOMY] }}>
              <Form.Item
                rules={[{ required: true, message: '请输入节点公钥' }]}
                name={['cooperativeNode', 'cert']}
                label={'节点公钥'}
              >
                <Input.TextArea placeholder="请输入" />
              </Form.Item>
            </AccessWrapper>
            {/* <Form.Item
              label="访问方式"
              name={['cooperativeNode', 'routeType']}
              initialValue={'FullDuplex'}
            >
              <Radio.Group>
                <Radio value={'FullDuplex'}>
                  <Space>双向（合作双方节点互访问）</Space>
                </Radio>
                <Radio value={'Single'}>
                  <Space>单向（发起节点访问合作节点）</Space>
                </Radio>
              </Radio.Group>
            </Form.Item> */}
          </div>
          <div className={styles.subTitle}>本方节点</div>
          <div className={styles.formGroup}>
            <Form.Item
              name={['selfNode', 'nodeAddress']}
              label={'节点通讯地址'}
              rules={[
                { required: true, message: '请输入通讯地址' },
                {
                  pattern:
                    /^.{1,50}:([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/,
                  message: '请输入正确的通讯地址',
                },
              ]}
              initialValue={replaceProtocol(service.nodeInfo.netAddress)}
            >
              <Input
                addonBefore={
                  <SelectBefore serviceType={serviceType} onChange={setServiceType} />
                }
                placeholder="请输入通讯地址"
              ></Input>
            </Form.Item>
          </div>
        </Form>
      </Drawer>
      {contextHolder}
    </>
  );
};
