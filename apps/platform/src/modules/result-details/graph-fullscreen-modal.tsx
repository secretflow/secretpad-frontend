import { ActionType } from '@secretflow/dag';
import { Modal } from 'antd';
import React from 'react';

import { DefaultModalManager } from '@/modules/dag-modal-manager';
import { useModel, Model, getModel } from '@/util/valtio-helper';

import styles from './index.less';
import resultPreviewDag from './result-preview-dag';

export const FullscreenGraphModalComponent = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  const viewInstance = useModel(FullscreenGraphModal);
  const modalManager = useModel(DefaultModalManager);

  const { visible, data, close } = modalManager.modals[fullscreenGraphModal.id];

  return (
    <Modal
      open={visible}
      maskClosable={true}
      closable={false}
      onOk={() => {
        if (close) {
          close();
        }
      }}
      style={{ top: 40 }}
      wrapClassName={styles.previewModal}
      footer={null}
      onCancel={() => {
        const graphNode = document.querySelector('.x6-graph') as HTMLElement;
        graphNode.style.height = `240px`;
        graphNode.style.width = `637px`;
        viewInstance.centerNode(data);
        document.querySelector('#minimap-id')?.appendChild(graphNode);

        if (close) {
          close();
        }
      }}
    >
      <div ref={containerRef} className={styles.graph} id="modal-id"></div>
    </Modal>
  );
};

export const fullscreenGraphModal = {
  id: 'fullscreen-graph',
  visible: false,
};

export class FullscreenGraphModal extends Model {
  graphManager = resultPreviewDag.graphManager;

  centerNode = (nodeId: string) => {
    this.graphManager.executeAction(ActionType.centerNode, nodeId);
  };
}

getModel(DefaultModalManager).registerModal(fullscreenGraphModal);
