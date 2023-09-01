import { message } from 'antd';
import React from 'react';
import { history } from 'umi';

import { ReactComponent as Logo } from '@/assets/logo1.svg';
import platformConfig from '@/platform.config';
import { getModel, Model, useModel } from '@/util/valtio-helper';

import { LoginForm } from './component/login-form';
import type { UserInfo } from './component/login-form';
import styles from './index.less';
import { LoginService } from './login.service';

export const LoginComponent: React.FC = () => {
  const loginModel = useModel(LoginModel);
  return (
    <div className={styles.content}>
      <div className={styles.left}>
        <Logo />
      </div>
      <div className={styles.right}>
        <LoginForm onConfirm={loginModel.loginConfirm} />
      </div>
    </div>
  );
};

export class LoginModel extends Model {
  token = '';
  loginService = getModel(LoginService);

  loginConfirm = async (loginFields: UserInfo) => {
    const { status, data } = await this.loginService.login({
      name: loginFields.name,
      password: loginFields.password,
    });

    const notFirstTimeIn = localStorage.getItem('notFirstTimeIn');
    this.token = data || '';
    if (status?.code === 0) {
      message.success('登录成功');
      localStorage.setItem('neverLogined', 'true');

      if (notFirstTimeIn || !platformConfig.guide) {
        history.push('/');
      } else {
        history.push('/guide');
        localStorage.setItem('notFirstTimeIn', 'true');
      }
    } else {
      message.error('登录失败，请检查用户名或密码');
    }
  };
}
