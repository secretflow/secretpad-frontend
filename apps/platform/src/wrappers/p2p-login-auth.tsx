import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'umi';

import { Platform } from '@/components/platform-wrapper';
import { LoginService } from '@/modules/login/login.service';
import { useModel } from '@/util/valtio-helper';
import { parse } from 'query-string';

/**
 * 判断 platformType === AUTONOMY
 */
const P2pLoginAuth = () => {
  const loginService = useModel(LoginService);
  const [canOutlet, setCanOutlet] = useState(true);
  const [isReady, setIsReady] = useState(false);

  const { ownerId } = parse(window.location.search);

  const getUserInfo = async () => {
    await loginService.getUserInfo();
    setIsReady(true);
    // 不是P2P则跳转登陆页面
    if (loginService?.userInfo?.platformType !== Platform.AUTONOMY) {
      setCanOutlet(false);
    } else {
      if (loginService?.userInfo.ownerId !== ownerId) {
        setCanOutlet(false);
      }
    }
  };

  useEffect(() => {
    getUserInfo();
  }, []);

  if (canOutlet) {
    return isReady && <Outlet />;
  } else {
    return <Navigate to="/" />;
  }
};

export default P2pLoginAuth;
