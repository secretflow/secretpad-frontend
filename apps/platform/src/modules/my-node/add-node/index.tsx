import { Form, Input, Modal, message } from 'antd';
import { useEffect, useState } from 'react';
import { useModel } from '@/util/valtio-helper';
import { MyNodeService } from '../my-node.service';
import styles from './index.less';

interface IChangePasswordModal {
  visible: boolean;
  close: () => void;
}

export const AddNodeModal = ({ visible, close }: IChangePasswordModal) => {
  const myNodeService = useModel(MyNodeService);
  const [form] = Form.useForm();
  const values = Form.useWatch([], form);

  const [disabled, setDisabled] = useState(true);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleOk = async () => {
    await form.validateFields().then(async (value) => {
      setConfirmLoading(true);
      const { status } = await myNodeService.addAutonomyNode(value.calcNodeName);
      if (status && status.code === 0) {
        await myNodeService.getAutonomyNodeList();
        close();
        message.success(`「${value.calcNodeName}」新增成功`);
      } else {
        message.error(status?.msg);
      }
      setConfirmLoading(false);
    });
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
  }, [values]);

  return (
    <Modal
      title="新增计算节点"
      destroyOnClose
      mask={false}
      open={visible}
      onCancel={close}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      okButtonProps={{ disabled }}
      wrapClassName={styles.content}
    >
      <Form form={form} preserve={false} layout="vertical" requiredMark={false}>
        <Form.Item
          label="节点名称"
          name="calcNodeName"
          rules={[
            { required: true, message: '请输入节点名称' },
            { max: 32, message: '长度限制32' },
            {
              pattern: /^[\u4E00-\u9FA5A-Za-z0-9-_]+$/,
              message: '只能包含中文/英文/数字/下划线/中划线',
            },
          ]}
        >
          <Input placeholder="名称可由中文/英文/数字/下划线/中划线组成，长度限制32" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
