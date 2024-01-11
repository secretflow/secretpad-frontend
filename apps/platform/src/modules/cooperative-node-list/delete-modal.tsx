import { ExclamationCircleFilled } from '@ant-design/icons';
import { message, Modal, Space } from 'antd';
import { useMemo } from 'react';

import { hasAccess, Platform } from '@/components/platform-wrapper';
import { useModel } from '@/util/valtio-helper';

import { CooperativeNodeService } from './cooperative-node.service';

export const DeleteCooperativeNodeModal = ({
  open,
  onClose,
  data,
  onOk,
}: {
  open: boolean;
  onClose: () => void;
  data: API.NodeRouterVO;
  onOk: () => void;
}) => {
  const service = useModel(CooperativeNodeService);

  const [messageApi, contextHolder] = message.useMessage();
  const title = useMemo(() => {
    return (
      <Space>
        <ExclamationCircleFilled style={{ color: 'orange' }} />
        确认要删除合作吗?
      </Space>
    );
  }, []);

  const handleDelete = async () => {
    if (hasAccess({ type: [Platform.AUTONOMY] })) {
      const { status } = await service.p2pDeleteCooperativeNode(data.routeId || '');
      if (status && status.code !== 0) {
        messageApi.error(status.msg);
        return;
      }
    } else {
      const { status } = await service.deleteCooperativeNode(data.routeId || '');
      if (status && status.code !== 0) {
        messageApi.error(status.msg);
        return;
      }
    }
    onOk();
    messageApi.success('删除成功!');
    onClose();
  };

  return (
    <>
      <Modal
        title={title}
        open={open}
        onOk={handleDelete}
        onCancel={onClose}
        okButtonProps={{ danger: true, type: 'default' }}
        okText={'删除'}
      ></Modal>
      {contextHolder}
    </>
  );
};
