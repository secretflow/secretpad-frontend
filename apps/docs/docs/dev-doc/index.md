---
nav:
  title: 开发文档
  order: -1
group:
  title: 入门
  order: -1
order: 1
mobile: false
---

# 项目结构

## 目录结构

<Tree>
  <ul>
    <li>
      apps
      <small>平台及文档目录</small>
      <ul>
        <li>
          docs
          <small>平台文档目录</small>
        </li>
        <li>
          platform
          <small>中心管控模式平台目录</small>
          <ul>
            <li>
              config
              <small>工程配置目录</small>
              <ul>
                <li>
                  config.ts
                  <small>umi配置</small>
                </li>
                <li>
                  routes.ts
                  <small>路由配置</small>
                </li>
              </ul>
            </li>
            <li>
              src
              <small>源码目录</small>
              <ul>
                <li>
                  modules
                  <small>平台模块(组件)目录</small>
                </li>
                <li>
                  pages
                  <small>平台页面目录</small>
                </li>
                <li>
                  services
                  <small>接口目录</small>
                </li>
                <li>
                  wrappers
                  <small>全局组件目录</small>
                  <ul>
                    <li>
                        login-auth.tsx
                        <small>登录权限校验</small>
                    </li>
                    <li>
                        theme-wrappers.tsx
                        <small>全局主题</small>
                    </li>
                  </ul>
                </li>
               </ul>
            </li>
          </ul>
        </li>
      </ul>
    </li>
    <li>
      packages
      <small>平台通用组件库</small>
      <ul>
        <li>
          dag
          <small>任务流组件</small>
        </li>
        <li>
          utils
          <small>工具方法</small>
        </li>
      </ul>
    </li>
  </ul>
</Tree>

## 模块开发范式推荐

<Tree>
  <ul>
    <li>
      modules
    </li>
    <ul>
      <li>
        login
        <small>登录</small>
        <ul>
           <li>
             index.tsx
             <small>view + viewModel</small>
           </li>
           <li>
             index.less
             <small>样式</small>
           </li>
           <li>
             login.service.tsx
             <small>用于处理接口及一些复杂逻辑，包括一些公用服务等</small>
           </li>
        </ul>
      </li>
    </ul>
  </ul>
</Tree>

### index.tsx(login) 示例

```jsx | pure
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

/* view */
export const LoginComponent: React.FC = () => {
  //  通过useModel将viewModel注入进来
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

/* viewModel viewModel的属性都是响应式的*/
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
```
