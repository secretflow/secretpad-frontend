import { App } from 'antd';
import { Outlet } from 'umi';

import styles from './index.less';

export enum GlobalLayout {
  main = 'main',
  drawer = 'drawer',
}

const GlobalLayoutComponent = () => {
  return (
    <App style={{ height: '100%' }}>
      <div className={styles.root}>
        <Outlet />
      </div>
    </App>
  );
};

export default GlobalLayoutComponent;
