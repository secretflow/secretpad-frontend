import { LoginService } from '@/modules/login/login.service';
import { useModel } from '@/util/valtio-helper';

interface IProps {
  children?: React.ReactNode;
}

/**
 *
 * center 平台的admin用户才能看到
 * @returns
 */
export const EdgeAuthWrapper = (props: IProps) => {
  const { children } = props;
  const loginService = useModel(LoginService);
  if (children === undefined || children === null) {
    return null;
  }
  return (
    <>
      {loginService.userInfo?.platformType === 'CENTER' &&
        loginService.userInfo?.ownerType === 'CENTER' && <>{children}</>}
    </>
  );
};
