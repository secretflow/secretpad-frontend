import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'umi';

import { Platform } from '@/components/platform-wrapper';
import { LoginService } from '@/modules/login/login.service';
import { useModel } from '@/util/valtio-helper';

/**
 * 判断 platformType === AUTONOMY
 */
const P2pLoginAuth = () => {
  const loginService = useModel(LoginService);
  const [canOutlet, setCanOutlet] = useState(true);

  const getUserInfo = async () => {
    await loginService.getUserInfo();
    // 不是P2P则跳转登陆页面
    if (loginService?.userInfo?.platformType !== Platform.AUTONOMY) {
      setCanOutlet(false);
    }
  };

  useEffect(() => {
    getUserInfo();
  }, []);

  if (canOutlet) {
    return <Outlet />;
  } else {
    return <Navigate to="/" />;
  }
};

export default P2pLoginAuth;
