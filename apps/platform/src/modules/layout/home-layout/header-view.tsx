import {
  GlobalOutlined,
  ReadOutlined,
  SwapOutlined,
  HddOutlined,
} from '@ant-design/icons';
import { Button } from 'antd';
import { parse } from 'query-string';
import { history, useLocation } from 'umi';

import Logo from '@/assets/logo.svg';
import { GuideTourService } from '@/modules/guide-tour/guide-tour-service';
import platformConfig from '@/platform.config';
import { getModel, Model, useModel } from '@/util/valtio-helper';

import { HomeLayoutService } from './home-layout.service';
import styles from './index.less';

export const HeaderComponent = () => {
  const viewInstance = useModel(HeaderModel);
  const layoutService = useModel(HomeLayoutService);
  const { search } = useLocation();
  const { nodeId } = parse(search);

  return (
    <div className={styles['header-items']}>
      <div className={styles.left}>
        {platformConfig.header.logo ? platformConfig.header.logo : <Logo />}
        <span className={styles.subTitle}>{layoutService.subTitle}</span>
      </div>
      <div className={styles.right}>
        {layoutService.showBackButton && (
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
        )}

        {platformConfig.guide && viewInstance.showGuide() && (
          <div className={styles.contentHeaderRight}>
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
            <span className={styles.line} />
            <span
              className={styles.help}
              onClick={() => viewInstance.goto('https://www.secretflow.org.cn/docs')}
            >
              <ReadOutlined />
              帮助中心
            </span>
            {viewInstance.showGoToHome() && <span className={styles.line} />}
          </>
        )}
        {viewInstance.showGoToHome() && (
          <>
            <span
              className={styles.community}
              onClick={() =>
                history.push({
                  pathname: '/my-node',
                  search: `nodeId=${nodeId}`,
                })
              }
            >
              <HddOutlined />
              我的节点
            </span>
          </>
        )}
        {<>{platformConfig.header.rightLinks}</>}
      </div>
    </div>
  );
};

export class HeaderModel extends Model {
  homeLayoutService = getModel(HomeLayoutService);
  guideTourService = getModel(GuideTourService);

  goto(url: string) {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.click();
  }

  showGoToHome = () => {
    return window.location.pathname.startsWith('/node');
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
