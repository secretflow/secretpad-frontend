import { ExportOutlined, PartitionOutlined } from '@ant-design/icons';
import { Tag } from 'antd';
import React from 'react';
import { history } from 'umi';

import { GuideNode } from '@/modules/guide-node';
import { GuideTourService } from '@/modules/guide-tour/guide-tour-service';
import { useModel } from '@/util/valtio-helper';

import styles from './header.less';

export const GuideHeader: React.FC = () => {
  const guideTourService = useModel(GuideTourService);

  return (
    <div className={styles.main}>
      <div className={styles.edit}>
        <div
          className={styles.editIcon}
          onClick={() => {
            guideTourService.finishAll();
            history.push('/home?tab=project-management');
          }}
        >
          <ExportOutlined rotate={180} />
          退出体验
        </div>
      </div>
      <div className={styles.create}>
        <div className={styles.title}>Hi，欢迎来到Secretpad-Center平台</div>
        <div className={styles.titleDesc}>科技护航数据安全，开源加速数据流通</div>
        <div className={styles.nodeContent}>
          <GuideNode />
        </div>
      </div>
    </div>
  );
};
