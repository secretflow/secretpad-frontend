import { FullscreenOutlined, AimOutlined } from '@ant-design/icons';
import { ActionType, Portal, ShowMenuContext } from '@secretflow/dag';
import classnames from 'classnames';
import React, { useState } from 'react';
import { useLocation } from 'umi';

import { DefaultModalManager } from '@/modules/dag-modal-manager';
import { Model, useModel } from '@/util/valtio-helper';

import type { ComputeMode } from '../component-tree/component-protocol';

import { fullscreenGraphModal } from './graph-fullscreen-modal';
import styles from './index.less';
import resultPreviewDag from './result-preview-dag';

// const ProgressContext = React.createContext(30);
const X6ReactPortalProvider = Portal.getProvider(); // 注意，一个 graph 只能申明一个 portal provider

export const PreviewGraphComponents: React.FC<{
  graph: API.GraphDetailVO;
  id: string | string[];
  projectMode: ComputeMode;
  value?: boolean;
}> = (props) => {
  const { graph, id, projectMode, value } = props;
  const { pathname } = useLocation();

  /** id: record.domainDataId 或者是 算子taskId 数组 */
  let newNodeTaskIds: string[] = [];
  if (Array.isArray(id)) {
    // 如果是数组的话，ID必须是节点taskId
    newNodeTaskIds = [...id];
  } else {
    const [, nodeTaskId] = (id as string)?.match(/(.*)-output-([0-9]+)$/) || [];
    newNodeTaskIds = [nodeTaskId];
  }

  const containerRef = React.useRef<HTMLDivElement>(null);
  const [nodeCenterId, setNodeCenterId] = useState('');

  const viewInstance = useModel(GraphView);
  const modalManager = useModel(DefaultModalManager);

  React.useLayoutEffect(() => {
    renderGraph();

    return () => {
      viewInstance.disposeGraph();
    };
  }, [graph]);

  const renderGraph = () => {
    if (containerRef.current) {
      const dagId = 'preview';
      /** nodeId is the id of center node */
      if (graph && newNodeTaskIds.length !== 0) {
        viewInstance.initGraph(
          dagId,
          containerRef.current,
          newNodeTaskIds,
          graph.nodes,
          graph.edges,
          projectMode,
        );
        const node = graph.nodes?.find((n) => n.taskId === newNodeTaskIds[0]);
        setNodeCenterId(node?.graphNodeId || '');
        setTimeout(() => {
          viewInstance.centerNode(node?.graphNodeId || '');
        }, 100);
      }
    }
  };

  const zoomIn = () => {
    modalManager.openModal(fullscreenGraphModal.id, nodeCenterId);
    const graphNode = document.querySelector('.x6-graph') as HTMLElement;
    graphNode.style.height = '100%';
    graphNode.style.width = '100%';
    viewInstance.centerNode();

    setTimeout(() => {
      document.querySelector('#modal-id')?.appendChild(graphNode);
    }, 100);
  };

  const focusNode = () => {
    viewInstance.centerNode(nodeCenterId);
  };

  return (
    <div className={styles.dagBox}>
      <div className={styles.graphContainer} id="minimap-id">
        <ShowMenuContext.Provider
          value={value === undefined ? pathname === '/dag' : value}
        >
          <X6ReactPortalProvider />
        </ShowMenuContext.Provider>
        <div
          ref={containerRef}
          className={classnames(styles.graph, 'x6-graph')}
          style={{ cursor: 'zoom-in' }}
          onClick={zoomIn}
        />
      </div>
      <div className={styles.zoomIn} onClick={zoomIn}>
        <div className={styles.zoomInIcon}>
          <FullscreenOutlined />
        </div>
        放大
      </div>
      <div className={styles.aim} onClick={focusNode}>
        <div className={styles.aimIcon}>
          <AimOutlined />
        </div>
        聚焦
      </div>
    </div>
  );
};

export class GraphView extends Model {
  initGraph = (
    dagId: string,
    container: HTMLDivElement,
    highlightNodeId: string | string[],
    nodes: API.GraphNodeDetail[] = [],
    edges: API.GraphEdge[] = [],
    mode: ComputeMode,
  ) => {
    if (container) {
      const { clientWidth, clientHeight } = container;
      resultPreviewDag.init(
        dagId,
        {
          container: container,
          width: clientWidth,
          height: clientHeight,
        },
        'LITE',
        highlightNodeId,
        nodes,
        edges,
        mode,
      );
    }
  };

  centerNode = (nodeId?: string) => {
    resultPreviewDag.graphManager.executeAction(ActionType.centerNode, nodeId);
  };

  disposeGraph() {
    resultPreviewDag.dispose();
  }
}
