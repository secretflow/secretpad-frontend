import { parse } from 'query-string';
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'umi';

import { get1 as get } from '@/services/secretpad/NodeController';

// 在这里控制/node-new 和 //my-node 有没有正确的nodeId, 没有跳转到/home-new
const EdgeNodeAuth = () => {
  const { nodeId } = parse(window.location.search);
  if (!nodeId) return <Navigate to="/home" />;
  const [canOutlet, setCanOutlet] = useState(true);
  useEffect(() => {
    if (!nodeId) return;
    getNodeInfo(nodeId as string);
  }, [nodeId]);

  const getNodeInfo = async (id: string) => {
    const info = await get({
      nodeId: id,
    });
    if (info.status && info.status.code !== 0) {
      setCanOutlet(false);
    }
  };

  if (canOutlet) {
    return <Outlet />;
  } else {
    return <Navigate to="/home" />;
  }
};

export default EdgeNodeAuth;
