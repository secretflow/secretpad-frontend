import { Form, Typography, Button, Input } from 'antd';
import { useState } from 'react';

import styles from './index.less';

export interface UserInfo {
  name: string;
  password: string;
}

export const LoginForm = (props: {
  onConfirm: (userInfo: UserInfo) => Promise<void>;
}) => {
  const { Title } = Typography;
  const [loginState, setLoginState] = useState(false);

  const onFinish = async (values: UserInfo) => {
    setLoginState(true);
    await props.onConfirm(values);
    setLoginState(false);
  };

  return (
    <div className={styles.loginForm}>
      <Title level={3} className={styles.title}>
        隐语登录
      </Title>
      <p className={styles.slogan}>科技护航数据安全，开源加速数据流通</p>
      <Form
        name="basic"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          label=""
          name="name"
          rules={[{ required: true, message: '请输入您的账号' }]}
        >
          <Input
            className={styles.loginInput}
            size="large"
            placeholder="请输入您的账号"
          />
        </Form.Item>

        <Form.Item
          label=""
          name="password"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input.Password
            className={styles.loginInput}
            size="large"
            placeholder="请输入密码"
          />
        </Form.Item>

        <Form.Item className={styles.loginBtnItem}>
          <Button
            className={styles.loginBtn}
            type="primary"
            size="large"
            htmlType="submit"
            loading={loginState}
          >
            登录
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
