import { ExclamationCircleFilled } from '@ant-design/icons';
import { Input, Modal } from 'antd';

export interface IProps {
  name: string;
  description: string;
  onOk: () => void;
}

export const confirmDelete = (props: IProps) => {
  const { name, description, onOk } = props;

  Modal.confirm({
    title: `确认要删除「${name}」吗？`,
    icon: <ExclamationCircleFilled />,
    centered: true,
    okButtonProps: {
      danger: true,
      type: 'default',
    },
    content: (
      <div>
        <p>{description}</p>
      </div>
    ),
    okText: '删除',
    cancelText: '取消',
    onOk(close) {
      onOk();
      return close(Promise.resolve);
    },
  });
};

export const confirmDeleteInput = (props: IProps) => {
  const { name, description, onOk } = props;
  let value = '';

  const modal = Modal.confirm({
    title: `确认要删除「${name}」吗？`,
    icon: <ExclamationCircleFilled />,
    centered: true,
    okButtonProps: {
      disabled: true,
    },
    content: (
      <div>
        <p>{description}</p>
        <p>{`请输入 「${name}」 确认操作`}</p>
        <Input
          onChange={(e) => {
            value = e.target.value;
            modal.update({
              okButtonProps: {
                disabled: e.target.value !== name,
                danger: true,
              },
            });
          }}
          placeholder="请输入"
        />
      </div>
    ),
    okText: '删除',
    cancelText: '取消',
    okType: 'danger',
    onOk(close) {
      if (value === name) {
        onOk();
        return close(Promise.resolve);
      }
    },
  });
};
