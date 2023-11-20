import { message } from 'antd';
import React from 'react';
import { history } from 'umi';

import { ReactComponent as Logo } from '@/assets/logo1.svg';
import platformConfig from '@/platform.config';
import { getModel, Model, useModel } from '@/util/valtio-helper';

import { LoginForm } from './component/login-form';
import type { UserInfo } from './component/login-form';
import styles from './index.less';
import type { User } from './login.service';
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
    this.token = data?.token || '';
    this.loginService.userInfo = data as User;
    if (status?.code === 0) {
      if (this.loginService.userInfo.platformType === 'EDGE') {
        if (this.loginService.userInfo.ownerId) {
          localStorage.setItem('neverLogined', 'true');
          history.push(`/node?nodeId=${this.loginService.userInfo.ownerId}`);
        }
      } else {
        localStorage.setItem('neverLogined', 'true');
        if (notFirstTimeIn || !platformConfig.guide) {
          history.push('/');
        } else {
          // edge 账号登陆center平台不需要跳转到guide页面
          if (
            this.loginService.userInfo.platformType === 'CENTER' &&
            this.loginService.userInfo?.ownerType === 'EDGE'
          ) {
            history.push('/');
          } else {
            history.push('/guide');
          }
          localStorage.setItem('notFirstTimeIn', 'true');
        }
      }
      message.success('登录成功');
    } else {
      message.error('登录失败，请检查用户名或密码');
    }
  };
}
