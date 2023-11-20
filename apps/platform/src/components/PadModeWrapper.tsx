import { LoginService } from '@/modules/login/login.service';
import { useModel } from '@/util/valtio-helper';

type Model = 'TEE' | 'MPC' | 'ALL-IN-ONE';

interface IProps {
  children?: React.ReactNode;
  type: Model[];
}

/**
 *
 * 用来区分 TEE  | MPC  | ALL-IN-ONE 模式
 * @returns children
 */
export const PadModeWrapper = (props: IProps) => {
  const { children, type = [] } = props;
  const loginService = useModel(LoginService);

  if (children === undefined || children === null || type.length === 0) return null;
  if (!loginService.userInfo?.deployMode) return null;
  const deployMode = loginService.userInfo.deployMode;
  return <>{type.includes(deployMode) && <>{children}</>}</>;
};

/**
 *
 * 获取当前平台 是 TEE | MPC | ALL-IN-ONE 模式
 * @returns children
 */
export const getPadMode = () => {
  const loginService = useModel(LoginService);
  return loginService.userInfo?.deployMode;
};
