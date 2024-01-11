import { parse } from 'query-string';
import { Navigate, Outlet } from 'umi';

/**
 * 判断 URL 上有没有 nodeId 参数
 * 比如: /node /my-node /message 路由用来判断有没有 nodeId
 */

const BasicNodeAuth = () => {
  const { nodeId } = parse(window.location.search);
  if (!nodeId) return <Navigate to="/login" />;

  return <Outlet />;
};

export default BasicNodeAuth;
