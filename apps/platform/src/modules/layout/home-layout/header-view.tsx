import {
  GlobalOutlined,
  ReadOutlined,
  BellOutlined,
  CaretDownOutlined,
  LogoutOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import { Avatar, Badge, Button, Dropdown, Space } from 'antd';
import classNames from 'classnames';
import { parse } from 'query-string';
import { useEffect, useState } from 'react';
import { history, useLocation } from 'umi';

import centerOfflineImgLink from '@/assets/center-offline.png';
import centerImgLink from '@/assets/center.png';
import edgeOfflineImgLink from '@/assets/edge-offline.png';
import edgeImgLink from '@/assets/edge.png';
import Logo from '@/assets/logo.svg';
import fallbackLink from '@/assets/offline-user.png';
import { EdgeAuthWrapper } from '@/components/edge-wrapper-auth';
import { hasAccess, Platform } from '@/components/platform-wrapper';
import { GuideTourService } from '@/modules/guide-tour/guide-tour-service';
import { ChangePasswordModal } from '@/modules/login/component/change-password';
import { LoginService } from '@/modules/login/login.service';
import platformConfig from '@/platform.config';
import { logout } from '@/services/secretpad/AuthController';
import { get } from '@/services/secretpad/NodeController';
import { getImgLink } from '@/util/tracert-helper';
import { getModel, Model, useModel } from '@/util/valtio-helper';

import { HomeLayoutService } from './home-layout.service';
import styles from './index.less';

type IAvatarMapping = Record<
  Platform,
  {
    onlineLink: string;
    localLink: string;
    offlineLink: string;
    localStorageKey: string;
  }
>;

const avatarMapping: IAvatarMapping = {
  [Platform.CENTER]: {
    onlineLink: 'https://secretflow-public.oss-cn-hangzhou.aliyuncs.com/center.png',
    localLink: centerImgLink,
    offlineLink: centerOfflineImgLink,
    localStorageKey: 'secretpad-center',
  },
  [Platform.EDGE]: {
    onlineLink: 'https://secretflow-public.oss-cn-hangzhou.aliyuncs.com/edge.png',
    localLink: edgeImgLink,
    offlineLink: edgeOfflineImgLink,
    localStorageKey: 'secretpad-edge',
  },
  [Platform.AUTONOMY]: {
    onlineLink: 'https://secretflow-public.oss-cn-hangzhou.aliyuncs.com/autonomy.png',
    // autonomy 和 edge 头像相同
    localLink: edgeImgLink,
    offlineLink: edgeOfflineImgLink,
    localStorageKey: 'secretpad-autonomy',
  },
};

export const HeaderComponent = () => {
  const viewInstance = useModel(HeaderModel);
  const layoutService = useModel(HomeLayoutService);
  const loginService = useModel(LoginService);
  const { search, pathname } = useLocation();
  const { nodeId } = parse(search);

  const [avatarLink, setAvatarLink] = useState('');
  const [avatarOfflineLink, setAvatarOfflineLink] = useState('');

  const onLogout = async () => {
    await logout(
      {},
      {
        name: loginService?.userInfo?.name,
      },
    );
    history.push('/login');
  };

  const items = [
    {
      key: 'changePassword',
      label: <div onClick={viewInstance.showChangePassword}>修改密码</div>,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined onClick={onLogout} />,
      label: <div onClick={onLogout}>退出</div>,
    },
  ];

  useEffect(() => {
    const getNodeName = async (nodeId: string) => {
      if (!nodeId) return;
      const info = await get({
        nodeId,
      });
      viewInstance.nodeName = info.data?.nodeName || '';
    };
    if (viewInstance.showMyNode(pathname)) {
      getNodeName(nodeId as string);
    }
  }, []);

  useEffect(() => {
    if (!loginService?.userInfo) return;

    // 获取平台类型
    const platformType = loginService.userInfo.platformType;

    if (platformType) {
      // 如果是 CENTER / EDGE
      const avatarInfo = avatarMapping[platformType];
      setAvatarOfflineLink(avatarInfo.offlineLink);

      const imgLink = getImgLink(avatarInfo);
      setAvatarLink(imgLink);
    }
  }, [loginService?.userInfo]);

  // if (viewInstance.showMyNode()) {
  //   items.push({
  //     key: 'myNode',
  //     icon: (
  //       <HddOutlined
  //         onClick={() =>
  //           history.push({
  //             pathname: '/my-node',
  //             search: `nodeId=${nodeId}`,
  //           })
  //         }
  //       />
  //     ),
  //     label: (
  //       <div
  //         onClick={() =>
  //           history.push({
  //             pathname: '/my-node',
  //             search: `nodeId=${nodeId}`,
  //           })
  //         }
  //       >
  //         我的节点
  //       </div>
  //     ),
  //   });
  // }

  return (
    <div className={styles['header-items']}>
      <div className={styles.left}>
        {
          <div
            className={classNames({
              [styles.logo]: hasAccess({ type: [Platform.AUTONOMY] }),
            })}
            onClick={() => {
              if (hasAccess({ type: [Platform.AUTONOMY] })) {
                history.push(`/edge?nodeId=${nodeId}&tab=workbench`);
              }
            }}
          >
            {platformConfig.header.logo ? platformConfig.header.logo : <Logo />}
          </div>
        }
        <span className={styles.subTitle}>{layoutService.subTitle}</span>
        {viewInstance.showMyNode(pathname) && (
          <>
            <span className={styles.line} />
            <div
              className={styles.myNodeTitle}
              onClick={() =>
                history.push({
                  pathname: '/my-node',
                  search: `nodeId=${nodeId}`,
                })
              }
            >
              <DatabaseOutlined />
              <span className={styles.nodeName}>{viewInstance.nodeName}</span>
              节点
            </div>
          </>
        )}
      </div>
      <div className={styles.right}>
        {/* {layoutService.showBackButton && (
          <>
            <span
              className={styles.community}
              onClick={() => history.push('/home?tab=project-management')}
            >
              <SwapOutlined />
              返回工作台
            </span>
            <span className={styles.line} />
          </>
        )} */}

        {platformConfig.guide && viewInstance.showGuide(pathname) && (
          <div className={styles.contentHeaderRight}>
            <EdgeAuthWrapper>
              <Button
                type="primary"
                shape="round"
                size="small"
                className={styles.smallGirlText}
                onClick={() => {
                  viewInstance.reExperience();
                }}
              >
                体验新手引导
              </Button>
            </EdgeAuthWrapper>
          </div>
        )}

        {platformConfig.header.rightLinks === true && (
          <>
            <span
              className={styles.community}
              onClick={() =>
                viewInstance.goto('https://github.com/orgs/secretflow/discussions')
              }
            >
              <GlobalOutlined />
              隐语开源社区
            </span>
            {/* <span className={styles.line} /> */}
            <span
              className={styles.help}
              onClick={() => viewInstance.goto('https://www.secretflow.org.cn/docs')}
            >
              <ReadOutlined />
              帮助中心
            </span>
            {/* {viewInstance.showGoToHome(pathname) && <span className={styles.line} />} */}
          </>
        )}
        {viewInstance.showMessage(pathname) && (
          <>
            <span
              className={styles.community}
              onClick={() =>
                history.push({
                  pathname: '/message',
                  search: `nodeId=${nodeId}&active=process`,
                })
              }
            >
              <BellOutlined />
              <Badge
                size="small"
                className={styles.messageBadge}
                offset={[4, -6]}
                count={layoutService.messageCount}
                overflowCount={10}
              >
                消息中心
              </Badge>
            </span>
          </>
        )}
        {<>{platformConfig.header.rightLinks}</>}
        <span className={styles.loginline} />
        <Dropdown
          menu={{
            items,
          }}
        >
          <div style={{ cursor: 'pointer' }} onClick={(e) => e.preventDefault()}>
            <Space>
              <Avatar
                size={28}
                // 用 icon 代替 Image 的 fallback
                // Antd: Avatar 组件中，可以设置 icon 或 children 作为图片加载失败的默认 fallback 行为.
                icon={<img width={'100%'} src={avatarOfflineLink || fallbackLink} />}
                src={avatarLink || null}
              />
              {loginService?.userInfo?.name}
              <CaretDownOutlined />
            </Space>
          </div>
        </Dropdown>
        <ChangePasswordModal
          visible={viewInstance.showChangePasswordModel}
          close={() => (viewInstance.showChangePasswordModel = false)}
        />
      </div>
    </div>
  );
};

export class HeaderModel extends Model {
  homeLayoutService = getModel(HomeLayoutService);
  guideTourService = getModel(GuideTourService);

  nodeName = '';

  showChangePasswordModel = false;

  goto(url: string) {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.click();
  }

  showGoToHome = (path: string) => {
    return path.startsWith('/node');
  };

  showMyNode = (path: string) => {
    const pathnameToShowNode = ['/node', '/message', '/edge'];
    return pathnameToShowNode.indexOf(path) > -1;
  };

  showMessage = (path: string) => {
    const pathnameToShowNode = ['/node', '/message', '/edge'];
    return pathnameToShowNode.indexOf(path) > -1;
  };

  showGuide = (path: string) => {
    const pathnameToShowGuide = ['/', '/home'];
    return pathnameToShowGuide.indexOf(path) > -1;
  };

  showChangePassword = () => {
    this.showChangePasswordModel = true;
  };

  reExperience = () => {
    this.guideTourService.reset();
    history.push({
      pathname: '/guide',
    });
  };
}
