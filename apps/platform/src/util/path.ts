/**
 * 打开新窗口
 * @param locationPathName 使用 useLocation 获取的pathname
 * @param search
 * @param router 要跳转的路由地址
 */
export const openNewTab = (
  locationPathName: string,
  router: string,
  search: string,
) => {
  const a = document.createElement('a');
  const currentUrlPathname = window.location.pathname;
  const newPathName = currentUrlPathname.replace(locationPathName, router);
  a.href = `${newPathName}?${search}`;
  a.target = '_blank';
  a.click();
};
