import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'umi';

import { Platform } from '@/components/platform-wrapper';
import { LoginService } from '@/modules/login/login.service';
import { useModel } from '@/util/valtio-helper';

/**
 * 部署的是 CENTER 模式，可以进入路由
 * 部署的是 AUTONOMY 模式 可以进入路由
 *
 * /dag 和 /record 路由 在 CENTER / AUTONOMY 都可以进入
 *
 */
const P2pCenterAuth = () => {
  const loginService = useModel(LoginService);
  const [canOutlet, setCanOutlet] = useState(true);

  const getUserInfo = async () => {
    await loginService.getUserInfo();

    //部署不是CENTER则跳转登陆页面
    if (loginService?.userInfo?.platformType === Platform.CENTER) {
      setCanOutlet(true);
      return;
    }

    //部署不是AUTONOMY则跳转登陆页面
    if (loginService?.userInfo?.platformType === Platform.AUTONOMY) {
      setCanOutlet(true);
      return;
    }

    setCanOutlet(false);
  };

  useEffect(() => {
    getUserInfo();
  }, []);

  if (canOutlet) {
    return <Outlet />;
  } else {
    return <Navigate to="/login" />;
  }
};

export default P2pCenterAuth;
