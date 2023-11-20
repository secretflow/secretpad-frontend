import { Input, Form, Modal, message, Radio } from 'antd';

import { createNode } from '@/services/secretpad/NodeController';
import { Model, useModel } from '@/util/valtio-helper';

import style from './create-node.less';

interface ICreateNodetModal {
  visible: boolean;
  close: () => void;
  onOk: () => void;
}

export const CreateNodeModal = ({ visible, close, onOk }: ICreateNodetModal) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const viewInstance = useModel(CreateNodeModel);

  const handleOk = () => {
    form.validateFields().then(async (value) => {
      viewInstance.createLoading = true;
      const { status } = await createNode({
        name: value.name,
        mode: 1,
      });
      if (status && status.code !== 0) {
        messageApi.error(status.msg);
        return;
      }
      viewInstance.createLoading = false;
      messageApi.success(`「${value.name}」注册成功！`);
      close();
      onOk();
    });
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="注册节点"
        destroyOnClose
        open={visible}
        onCancel={close}
        onOk={handleOk}
        wrapClassName={style.node}
      >
        <Form form={form} preserve={false} layout="vertical" requiredMark={false}>
          <Form.Item
            label="节点名称"
            name="name"
            rules={[
              { max: 32, message: '长度限制32' },
              { required: true, message: '请输入节点名称' },
              {
                pattern: /^[\u4E00-\u9FA5A-Za-z0-9-_]+$/,
                message: '只能包含中文/英文/数字/下划线/中划线',
              },
            ]}
          >
            <Input
              placeholder="名称可由中文/英文/数字/下划线/中划线组成，长度限制32"
              allowClear
            />
          </Form.Item>
          {/* <Form.Item label="节点能力" required name="mode" initialValue={1}>
            <Radio.Group>
              <Radio value={0}>
                Tee
              </Radio>
              <Radio value={1}>MPC</Radio>
              <Radio value={2}>
                TeeAndMpc
              </Radio>
            </Radio.Group>
          </Form.Item> */}
        </Form>
      </Modal>
    </>
  );
};

export class CreateNodeModel extends Model {
  createLoading = false;
}
