import { Alert, Form, Modal } from 'antd';

import { SwitchCard } from '@/components/switch-card';
import {
  ProjectType,
  computeFuncList,
} from '@/modules/create-project/p2p-create-project/compute-func-data';

import styles from './index.less';

export const UpdateFuncModal = ({
  open,
  onClose,
  data,
  onOk,
}: {
  open: boolean;
  onClose: () => void;
  data?: API.ProjectVO;
  onOk?: () => void;
}) => {
  const [form] = Form.useForm();

  const closeModal = () => {
    onClose();
    form.resetFields();
  };

  const handleOk = () => {
    form.validateFields().then(async () => {
      // console.log(value, data?.projectId,  '发起审批--->UpdateFuncModal');
      // request value
      closeModal();
      onOk && onOk();
    });
  };

  const updateFunList = computeFuncList.filter(
    (item) => item.type !== (data?.computedFunc || ProjectType.DAG),
  );

  return (
    <Modal
      open={open}
      onCancel={closeModal}
      title="功能升级"
      onOk={handleOk}
      width={464}
    >
      <Alert
        message="更改功能确定后会发给其他合作节点审批，其他节点全部同意后才能增加功能成功。"
        type="warning"
      />
      <div className={styles.updateContent}>
        <Form
          form={form}
          preserve={false}
          layout="vertical"
          requiredMark="optional"
          initialValues={{
            function: updateFunList[0]?.type,
          }}
        >
          <Form.Item name="function">
            <SwitchCard cardList={updateFunList} />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};
