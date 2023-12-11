import {
  GlobalOutlined,
  ReadOutlined,
  BellOutlined,
  CaretDownOutlined,
  LogoutOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import { Badge, Button, Dropdown, Image as AntdImage, Space } from 'antd';
import { parse } from 'query-string';
import { useEffect, useState } from 'react';
import { history, useLocation } from 'umi';

import centerOfflineImgLink from '@/assets/center-offline.png';
import centerLocalImgLink from '@/assets/center.png';
import edgeOfflineImgLink from '@/assets/edge-offline.png';
import edgeLocalImgLink from '@/assets/edge.png';
import Logo from '@/assets/logo.svg';
import fallbackLink from '@/assets/offline-user.png';
import { EdgeAuthWrapper } from '@/components/edge-wrapper-auth';
import { GuideTourService } from '@/modules/guide-tour/guide-tour-service';
import type { User } from '@/modules/login/login.service';
import { LoginService } from '@/modules/login/login.service';
import platformConfig from '@/platform.config';
import { logout } from '@/services/secretpad/AuthController';
import { get } from '@/services/secretpad/NodeController';
import type { AvatarInfo } from '@/util/platform';
import { getImgLink } from '@/util/platform';
import { getModel, Model, useModel } from '@/util/valtio-helper';

import { HomeLayoutService } from './home-layout.service';
import styles from './index.less';

type IAvatarMapping = Record<User['platformType'], AvatarInfo>;

const avatarMapping: IAvatarMapping = {
  CENTER: {
    onlineLink: 'https://mianyang-test.oss-cn-shanghai.aliyuncs.com/center.png',
    localLink: centerLocalImgLink,
    offlineLink: centerOfflineImgLink,
    localStorageTag: 'secretpad-center',
  },
  EDGE: {
    onlineLink: 'https://mianyang-test.oss-cn-shanghai.aliyuncs.com/edge.png',
    localLink: edgeLocalImgLink,
    offlineLink: edgeOfflineImgLink,
    localStorageTag: 'secretpad-edge',
  },
};

export const HeaderComponent = () => {
  const viewInstance = useModel(HeaderModel);
  const layoutService = useModel(HomeLayoutService);
  const loginService = useModel(LoginService);
  const { search } = useLocation();
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
    if (viewInstance.showMyNode()) {
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

      // get online or local img
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
        {platformConfig.header.logo ? platformConfig.header.logo : <Logo />}
        <span className={styles.subTitle}>{layoutService.subTitle}</span>
        {viewInstance.showMyNode() && (
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

        {platformConfig.guide && viewInstance.showGuide() && (
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
            {/* {viewInstance.showGoToHome() && <span className={styles.line} />} */}
          </>
        )}
        {viewInstance.showMessage() && (
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
              <AntdImage
                width={28}
                preview={false}
                src={avatarLink || fallbackLink}
                // 一般只有在请求在线图片链接失败的时候会用到 avatarOfflineLink
                // fallbackLink 是本地调试断网的时候，兜底用的
                fallback={avatarOfflineLink || fallbackLink}
              />
              {loginService?.userInfo?.name}
              <CaretDownOutlined />
            </Space>
          </div>
        </Dropdown>
      </div>
    </div>
  );
};

export class HeaderModel extends Model {
  homeLayoutService = getModel(HomeLayoutService);
  guideTourService = getModel(GuideTourService);

  nodeName = '';

  goto(url: string) {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.click();
  }

  showGoToHome = () => {
    return window.location.pathname.startsWith('/node');
  };

  showMyNode = () => {
    const pathnameToShowNode = ['/node', '/message'];
    return pathnameToShowNode.indexOf(window.location.pathname) > -1;
  };

  showMessage = () => {
    const pathnameToShowNode = ['/node', '/message'];
    return pathnameToShowNode.indexOf(window.location.pathname) > -1;
  };

  showGuide = () => {
    const pathnameToShowGuide = ['/', '/home'];
    return pathnameToShowGuide.indexOf(window.location.pathname) > -1;
  };

  reExperience = () => {
    this.guideTourService.reset();
    history.push({
      pathname: '/guide',
    });
  };
}
