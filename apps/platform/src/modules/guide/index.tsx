import React from 'react';

import { Model, getModel, useModel } from '@/util/valtio-helper';

import GuideGirlBg from '../../assets/guide-girl.png';
import { GuidePipeline } from '../guide-pipeline/guide-pipeline';
import { HomeLayoutService } from '../layout/home-layout/home-layout.service';

import { GuideHeader } from './guide-header';
import styles from './index.less';

export const GuidePageLayoutComponent = () => {
  const viewInstance = useModel(GuidePageLayoutView);

  React.useEffect(() => {
    viewInstance.homeLayoutService.setSubTitle(viewInstance.pageTitle);
  }, []);

  return (
    <div className={styles.main}>
      <div className={styles.mainHeader}>
        <GuideHeader />
        <div className={styles.bg}>
          <img src={GuideGirlBg} />
        </div>
      </div>
      <div className={styles.mainContent}>
        <GuidePipeline />
      </div>
    </div>
  );
};

export class GuidePageLayoutView extends Model {
  pageTitle = (
    <p style={{ color: 'rgba(0,0,0,0.6)', fontWeight: 400, fontSize: '16px' }}>
      科技护航数据安全 开源加速数据流通
    </p>
  );

  homeLayoutService = getModel(HomeLayoutService);
}
