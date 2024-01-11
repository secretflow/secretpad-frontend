import { Navigate, Outlet } from 'umi';

// 在这里控制是不是第一次进入平台
const BeginnerAuth = () => {
  const neverLogined = localStorage.getItem('neverLogined');
  const token = localStorage.getItem('User-Token') || '';
  if (!neverLogined || !token) {
    // localStorage.setItem('neverLogined', 'true');
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default BeginnerAuth;
