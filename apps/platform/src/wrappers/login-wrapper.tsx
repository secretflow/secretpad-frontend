import { Outlet } from 'umi';

const LoginAuth = () => {
  localStorage.removeItem('neverLogined');
  return <Outlet />;
};

export default LoginAuth;
