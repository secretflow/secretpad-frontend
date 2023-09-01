import React from 'react';
import { history } from 'umi';

import SmallGirlImg from '@/assets/small-girl.png';
import { GuideTourService } from '@/modules/guide-tour/guide-tour-service';
import { HomeLayoutService } from '@/modules/layout/home-layout/home-layout.service';
import { ManagedNodeComponent } from '@/modules/managed-node/managed-node.view';
import { ProjectListComponent } from '@/modules/project-list';
import PlatformConfigs from '@/platform.config';
import { getModel, Model, useModel } from '@/util/valtio-helper';

import styles from './index.less';

export const ProjectContentComponent: React.FC = () => {
  const viewInstance = useModel(ProjectContentView);

  // const hour = new Date().getHours();
  // let time = '';
  // if (hour < 12) {
  //   time = '上午';
  // } else if (hour > 18) {
  //   time = '晚上';
  // } else if (hour >= 12) {
  //   time = '下午';
  // }

  return (
    <div className={styles.content}>
      <div className={styles.contentHeader}>
        <div className={styles.contentHeaderleft}>
          {PlatformConfigs?.home?.HomePageTitle}
        </div>
        {PlatformConfigs.guide && (
          <div className={styles.contentHeaderRight}>
            <div
              className={styles.contentHeaderRightText}
              onClick={viewInstance.reExperience}
            >
              <img src={SmallGirlImg} className={styles.smallGirl} />
              <div className={styles.smallGirlText}>再体验一遍新手引导</div>
            </div>
          </div>
        )}
      </div>
      <div className={styles.projectContent}>
        <div className={styles.projectContentLeft}>
          <ProjectListComponent />
        </div>
        <div className={styles.projectContentRight}>
          <ManagedNodeComponent />
        </div>
      </div>
    </div>
  );
};

export class ProjectContentView extends Model {
  pageTitle = PlatformConfigs.slogan || '科技护航数据安全  开源加速数据流通';

  homeLayoutService = getModel(HomeLayoutService);

  guideTourService = getModel(GuideTourService);

  onViewMount() {
    this.homeLayoutService.setSubTitle(this.pageTitle);
  }

  reExperience = () => {
    this.guideTourService.reset();
    history.push({
      pathname: '/guide',
    });
  };
}
