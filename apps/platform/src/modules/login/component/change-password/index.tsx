import { Form, Input, Modal, message } from 'antd';
import { useEffect, useState } from 'react';
import { history } from 'umi';

import { LoginService } from '@/modules/login/login.service';
import { logout } from '@/services/secretpad/AuthController';
import { useModel } from '@/util/valtio-helper';

import styles from './index.less';

interface IChangePasswordModal {
  visible: boolean;
  close: () => void;
}

export const ChangePasswordModal = ({ visible, close }: IChangePasswordModal) => {
  const loginService = useModel(LoginService);
  const [form] = Form.useForm();
  const values = Form.useWatch([], form);

  const [disabled, setDisabled] = useState(true);

  const handleOk = async () => {
    await form.validateFields().then(async (value) => {
      const status = await loginService.resetUserPwd(
        loginService?.userInfo?.name as string,
        value.currentPassword,
        value.newPassword,
        value.verifiedNewPassword,
      );
      if (status?.code == 0) {
        message.success('账户密码修改成功');
        close();
        await logout(
          {},
          {
            name: loginService?.userInfo?.name,
          },
        );
        history.push('/login');
      } else {
        message.error(status?.msg);
        const codeList = [202012001, 202012002, 202012003, 202011601];
        if (codeList.findIndex((i) => i === status?.code) === -1) {
          close();
        }
      }
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
      title="修改密码"
      destroyOnClose
      open={visible}
      onCancel={close}
      onOk={handleOk}
      okButtonProps={{ disabled }}
      wrapClassName={styles.password}
    >
      <div className={styles.name}>账号名：{loginService?.userInfo?.name}</div>
      <Form form={form} preserve={false} layout="vertical" requiredMark={false}>
        <Form.Item
          label="当前密码"
          name="currentPassword"
          rules={[
            { required: visible, message: '请输入当前密码' },
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
          dependencies={['currentPassword']}
          rules={[
            { required: visible, message: '请输入新密码' },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{8,20}$/,
              message: '需同时包含小写字母、大写字母、数字，8-20字符',
            },
            {
              validator(_, value: string) {
                if (visible) {
                  if (value) {
                    const currentPassword = form.getFieldValue('currentPassword');
                    if (value === currentPassword) {
                      return Promise.reject(new Error('新密码与当前密码不能一致'));
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
        <Form.Item
          name="verifiedNewPassword"
          label="新密码确认"
          dependencies={['newPassword', 'currentPassword']}
          rules={[
            { required: visible, message: '请再次确认' },
            {
              validator(_, value: string) {
                if (visible) {
                  if (value) {
                    const currentPassword = form.getFieldValue('currentPassword');
                    const newPassword = form.getFieldValue('newPassword');
                    if (value === currentPassword) {
                      return Promise.reject(new Error('新密码与当前密码不能一致'));
                    }
                    if (value !== newPassword) {
                      return Promise.reject(new Error('请与新密码保持一致'));
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
  );
};
