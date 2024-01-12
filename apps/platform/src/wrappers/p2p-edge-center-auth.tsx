import { parse } from 'query-string';
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'umi';

import { Platform } from '@/components/platform-wrapper';
import { LoginService } from '@/modules/login/login.service';
import { useModel } from '@/util/valtio-helper';

/**
 * 部署的是 CENTER 模式，并且登陆的center用户，并且是内置节点，可以直接进入路由
 * 部署的是 EDGE 模式 可以进入路由
 * 部署的是 AUTONOMY 模式 可以进入路由
 *
 * /my-node 和 /message 路由 在 CENTER / EDGE / AUTONOMY 都可以进入
 *
 */
const P2pEdgeCenterAuth = () => {
  const loginService = useModel(LoginService);
  const { nodeId } = parse(window.location.search);
  if (!nodeId) return <Navigate to="/login" />;
  const embeddedNodes = ['alice', 'bob', 'tee'];
  const getUserInfo = async () => {
    await loginService.getUserInfo();
    // platformType 是 CENTER 登录账号是 center 用户，并且是内置节点，可以直接进入 CENTER 模式下的 edge 平台
    if (
      loginService?.userInfo?.platformType === 'CENTER' &&
      loginService?.userInfo?.ownerType === 'CENTER' &&
      embeddedNodes.includes(nodeId as string)
    ) {
      setCanOutlet(true);
      return;
    }

    // platformType 是  AUTONOMY
    if (loginService?.userInfo?.platformType === Platform.AUTONOMY) {
      setCanOutlet(true);
      return;
    }

    //  platformType 是  EDGE
    if (loginService?.userInfo?.platformType === 'EDGE') {
      setCanOutlet(true);
      return;
    }

    setCanOutlet(false);
  };

  useEffect(() => {
    getUserInfo();
  }, []);

  const [canOutlet, setCanOutlet] = useState(true);

  if (canOutlet) {
    return <Outlet />;
  } else {
    return <Navigate to="/login" />;
  }
};

export default P2pEdgeCenterAuth;
