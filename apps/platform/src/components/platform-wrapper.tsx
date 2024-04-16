import { parse } from 'query-string';
import { useLocation } from 'umi';

import { LoginService } from '@/modules/login/login.service';
import { getModel } from '@/util/valtio-helper';

/**
 *
 * 根据路由来区分 'P2P' 模式。/edge 路由下都是p2p模式
 * @returns children
 */
export const EdgeRouteWrapper = (props: { children?: React.ReactNode }) => {
  const { children } = props;

  const { pathname } = useLocation();
  if (children === undefined || children === null) return null;
  if (pathname !== '/edge') return null;
  return <>{pathname === '/edge' && <>{children}</>}</>;
};

/**
 * 判断当前是不是p2p 的工作台页面
 * @returns boolean
 */
export const isP2PWorkbench = (pathname: string) => {
  const { search } = window.location;
  const { tab } = parse(search);
  return pathname === '/edge' && tab === 'workbench';
};

export enum PadMode {
  'TEE' = 'TEE',
  'MPC' = 'MPC',
  'ALL-IN-ONE' = 'ALL-IN-ONE',
}

export enum Platform {
  'CENTER' = 'CENTER',
  'EDGE' = 'EDGE',
  'AUTONOMY' = 'AUTONOMY',
}

type AccessType = {
  type?: Platform[];
  mode?: PadMode[];
};

/**
 * 判断当前平台类型和部署类型
 * @param accessType
 * @param accessType.type - 平台类型  可以是 [Platform.AUTONOMY | Platform.CENTER | Platform.EDGE]
 * @param accessType.mode - 部署类型  可以是 [PadMode['ALL-IN-ONE'] | PadMode.MPC | PadMode.TEE]
 * @returns boolean
 */
export const hasAccess = (accessType: AccessType) => {
  const {
    type = [Platform.AUTONOMY, Platform.CENTER, Platform.EDGE],
    mode = [PadMode['ALL-IN-ONE'], PadMode.MPC, PadMode.TEE],
  } = accessType;
  const loginService = getModel(LoginService);
  if (!loginService.userInfo?.deployMode) return false;
  if (!loginService.userInfo?.platformType) return false;

  const deployMode = loginService.userInfo.deployMode;
  const platformType = loginService.userInfo.platformType;

  return type.includes(platformType) && mode.includes(deployMode);
};

/**
 * 根据登陆用户信息来判断是否展示view
 */
export const AccessWrapper = (props: {
  accessType: AccessType;
  children?: React.ReactNode;
}) => {
  const { children, accessType = {} } = props;
  if (children === undefined || children === null) return null;
  const showChildren = hasAccess(accessType);
  return <>{showChildren && <>{children}</>}</>;
};

/**
 *
 * 获取当前平台 是 TEE | MPC | ALL-IN-ONE 模式
 * @returns children
 */
export const getPadMode = () => {
  const loginService = getModel(LoginService);
  return loginService.userInfo?.deployMode;
};
