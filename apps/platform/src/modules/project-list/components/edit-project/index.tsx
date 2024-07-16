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
    if (isModalOpen) {
      form.setFieldValue('projectName', data.projectName);
      form.setFieldValue('description', data.description);
    } else {
      form.resetFields();
    }
  }, [data, isModalOpen]);

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
            {
              pattern: /^[\u4E00-\u9FA5A-Za-z0-9-_]+$/,
              message: '只能包含中文/英文/数字/下划线/中划线',
            },
          ]}
        >
          <Input placeholder="请输入项目名称" />
        </Form.Item>
        <Form.Item
          name="description"
          rules={[
            { max: 128, message: '长度限制128' },
            {
              pattern: /^[\u4E00-\u9FA5A-Za-z0-9-_]+$/,
              message: '只能包含中文/英文/数字/下划线/中划线',
            },
          ]}
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
