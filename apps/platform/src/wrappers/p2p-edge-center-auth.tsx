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
  const { ownerId } = parse(window.location.search);
  if (!ownerId) return <Navigate to="/login" />;
  const embeddedNodes = ['alice', 'bob', 'tee'];

  const [canOutlet, setCanOutlet] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const getUserInfo = async () => {
      await loginService.getUserInfo();
      // 获取用户信息接口请求完成
      setIsReady(true);

      // platformType 是 CENTER 登录账号是 center 用户，并且是内置节点，可以直接进入 CENTER 模式下的 edge 平台
      if (
        loginService?.userInfo?.platformType === 'CENTER' &&
        loginService?.userInfo?.ownerType === 'CENTER' &&
        embeddedNodes.includes(ownerId as string)
      ) {
        setCanOutlet(true);
        return;
      }

      // platformType 是  AUTONOMY
      if (
        loginService?.userInfo?.platformType === Platform.AUTONOMY &&
        loginService?.userInfo.ownerId === ownerId
      ) {
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
    getUserInfo();
  }, []);

  if (canOutlet) {
    return isReady && <Outlet />;
  } else {
    return <Navigate to="/login" />;
  }
};

export default P2pEdgeCenterAuth;
