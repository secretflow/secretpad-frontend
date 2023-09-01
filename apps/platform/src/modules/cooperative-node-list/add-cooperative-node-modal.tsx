import { CloseOutlined } from '@ant-design/icons';
import { Button, Drawer, Form, Input, message, Radio, Select, Space } from 'antd';
import { parse } from 'query-string';
import { useEffect } from 'react';
import { useLocation } from 'umi';

import { useModel } from '@/util/valtio-helper';

import { NodeState } from '../managed-node-list';

import { CooperativeNodeService } from './cooperative-node.service';
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
  const [form] = Form.useForm();
  const computeNodeId = Form.useWatch(['cooperativeNode', 'computeNodeName'], form);
  const { search } = useLocation();
  const { nodeId } = parse(search);

  useEffect(() => {
    if (open) {
      service.getComputeNodeList();
    }
  }, [open]);

  useEffect(() => {
    form.setFieldValue(['cooperativeNode', 'computeNodeId'], computeNodeId);
    const address = computeNodeList.find(
      (item) => item.controlNodeId === computeNodeId,
    )?.netAddress;
    form.setFieldValue(['cooperativeNode', 'nodeAddress'], address);
  }, [computeNodeId]);

  useEffect(() => {
    service.getNodeInfo();
  }, []);

  const handleOk = () => {
    form.validateFields().then(async (value) => {
      const { status } = await service.addCooperativeNode({
        srcNodeId: nodeId as string,
        dstNodeId: value.cooperativeNode.computeNodeId,
        dstNetAddress: value.cooperativeNode.nodeAddress,
        routeType: 'FullDuplex', //default
        srcNetAddress: value.selfNode.nodeAddress,
      });
      if (status && status.code !== 0) {
        message.error(status.msg);
      } else {
        onOk();
        handleClose();
        messageApi.success(<>添加成功！</>);
      }
    });
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
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
            <Button type="primary" onClick={handleOk}>
              确定
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <div className={styles.subTitle}>合作节点</div>
          <div className={styles.formGroup}>
            <Form.Item
              name={['cooperativeNode', 'computeNodeName']}
              label={'计算节点名'}
              rules={[{ required: true, message: '请选择' }]}
            >
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
            </Form.Item>

            <Form.Item name={['cooperativeNode', 'computeNodeId']} label={'计算节点ID'}>
              <Input placeholder="选择计算节点后自动填充" disabled></Input>
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
              <Input placeholder="172.19.111.82"></Input>
            </Form.Item>
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
              initialValue={service.nodeInfo.netAddress}
            >
              <Input placeholder="请输入通讯地址"></Input>
            </Form.Item>
          </div>
        </Form>
      </Drawer>
      {contextHolder}
    </>
  );
};
