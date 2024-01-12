import { Form, Input, Modal } from 'antd';
import { useEffect } from 'react';

import styles from './index.less';

export const EditProjectModal = ({
  isModalOpen,
  handleCancel,
  data,
  onEdit,
}: {
  isModalOpen: boolean;
  handleCancel: () => void;
  data: API.ProjectVO;
  onEdit: (item: API.ProjectVO, projectId: string) => Promise<void>;
}) => {
  const [form] = Form.useForm();
  const handleOk = () => {
    form.validateFields().then(async (value) => {
      handleCancel();
      if (!data.projectId) return;
      await onEdit(value, data.projectId);
    });
  };

  useEffect(() => {
    form.setFieldValue('projectName', data.projectName);
    form.setFieldValue('description', data.description);
  }, [data]);

  return (
    <Modal
      title="编辑"
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      wrapClassName={styles.editModal}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="项目名称"
          name="projectName"
          rules={[
            { required: true, message: '请输入项目名称' },
            { max: 32, message: '长度限制32' },
          ]}
        >
          <Input placeholder="请输入项目名称" />
        </Form.Item>
        <Form.Item
          name="description"
          label={
            <>
              项目描述
              <span style={{ color: '#969696' }}>(可选)</span>
            </>
          }
        >
          <Input placeholder="请输入项目描述" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
