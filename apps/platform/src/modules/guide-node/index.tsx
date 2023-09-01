import { Button } from 'antd';
import React from 'react';

import { CreateProjectModal } from '@/modules/create-project/create-project.view';
import { useModel } from '@/util/valtio-helper';

import { NodeSwitch } from './guide-node-switch';
import { GuideNodeContentServie } from './guide-node.service';
import styles from './index.less';

export const GuideNode: React.FC = () => {
  const [nodeId, setNodeId] = React.useState('');
  const [modalVisible, setModalVisible] = React.useState(false);

  const guideNodeContentServie = useModel(GuideNodeContentServie);

  const handleChange = (id: string) => {
    setNodeId(id);
  };

  React.useEffect(() => {
    initNodeData();
  }, []);

  const initNodeData = async () => {
    await guideNodeContentServie.getListNode();

    const _nodeId = guideNodeContentServie.nodeListInfo?.[0]?.nodeId as string;
    setNodeId(_nodeId);
  };

  const handleCreateProject = () => {
    setModalVisible(true);
  };

  const { nodeListInfo } = guideNodeContentServie;

  return (
    <div className={styles.main}>
      <NodeSwitch nodes={nodeListInfo} value={nodeId} onChange={handleChange} />
      <Button
        className={styles.createButton}
        type="primary"
        onClick={handleCreateProject}
      >
        👉 立即新建项目
      </Button>
      <CreateProjectModal
        visible={modalVisible}
        data={{ showBlank: false }}
        close={() => {
          setModalVisible(false);
        }}
      />
    </div>
  );
};
