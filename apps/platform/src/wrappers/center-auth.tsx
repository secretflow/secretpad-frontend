import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'umi';

import { LoginService } from '@/modules/login/login.service';
import { useModel } from '@/util/valtio-helper';

const CenterAuth = () => {
  const loginService = useModel(LoginService);
  const [canOutlet, setCanOutlet] = useState(true);

  const getUserInfo = async () => {
    await loginService.getUserInfo();
    if (loginService?.userInfo?.platformType !== 'CENTER') {
      //用户不是CENTER则跳转登陆页面
      setCanOutlet(false);
    }
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

export default CenterAuth;
