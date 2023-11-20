import { parse } from 'query-string';
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'umi';

import { LoginService } from '@/modules/login/login.service';
import { get } from '@/services/secretpad/NodeController';
import { useModel } from '@/util/valtio-helper';

// 在这里控制/node 和 /my-node 和/message 有没有正确的nodeId 和权限
const EdgeNodeAuth = () => {
  const loginService = useModel(LoginService);
  const { nodeId } = parse(window.location.search);
  if (!nodeId) return <Navigate to="/login" />;
  const embeddedNodes = ['alice', 'bob', 'tee'];
  const getUserInfo = async () => {
    await loginService.getUserInfo();
    // 登录center平台。账号是center，内置节点可以直接进入
    if (
      loginService?.userInfo?.platformType === 'CENTER' &&
      loginService?.userInfo?.ownerType === 'CENTER' &&
      embeddedNodes.includes(nodeId as string)
    ) {
      setCanOutlet(true);
      return;
    }
    //用户不是EDGE平台账号，则跳转到登陆页
    if (loginService?.userInfo?.platformType !== 'EDGE') {
      setCanOutlet(false);
    }
  };

  useEffect(() => {
    getUserInfo();
  }, []);

  const [canOutlet, setCanOutlet] = useState(true);
  useEffect(() => {
    if (!nodeId) return;
    getNodeInfo(nodeId as string);
  }, [nodeId]);

  const getNodeInfo = async (id: string) => {
    await get({
      nodeId: id,
    });
  };

  if (canOutlet) {
    return <Outlet />;
  } else {
    return <Navigate to="/login" />;
  }
};

export default EdgeNodeAuth;
