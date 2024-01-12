import {
  DownloadOutlined,
  PartitionOutlined,
  FileSyncOutlined,
} from '@ant-design/icons';
import { Tag } from 'antd';

import { ProjectType } from '@/modules/create-project/p2p-create-project/compute-func-data';

import styles from './index.less';

export const ProjectTypeMap = {
  [ProjectType.ALL]: {
    tagIcon: <DownloadOutlined style={{ color: '#E6FFFB' }} />,
    tagText: '全家桶',
    style: {
      backgroundImage: 'linear-gradient(180deg, #F5FFFD 0%, #E6FFFB 100%)',
    },
  },
  [ProjectType.DAG]: {
    tagIcon: (
      <PartitionOutlined style={{ color: '#A878FF', transform: `rotate(-90deg)` }} />
    ),
    tagText: '联合建模',
    style: {
      backgroundImage: 'linear-gradient(180deg, #FEFCFF 0%, #F9F0FF 100%)',
    },
  },
  [ProjectType.PSI]: {
    tagIcon: <FileSyncOutlined style={{ color: '#FAAD14' }} />,
    tagText: '隐私求交',
    style: {
      backgroundImage: 'linear-gradient(180deg, #FFFFFE 0%, #FFF7E6 100%)',
    },
  },
};

export const ProjectTypeTag = ({ type }: { type: ProjectType }) => {
  const itemObj = ProjectTypeMap[type];
  if (!type) return <>{'--'}</>;
  if (!itemObj) return <>{'--'}</>;
  return (
    <Tag className={styles.projectTypeTag} icon={itemObj.tagIcon} style={itemObj.style}>
      {itemObj.tagText}
    </Tag>
  );
};
