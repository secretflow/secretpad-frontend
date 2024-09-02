import { DagreLayout } from '@antv/layout';
import type { Edge, Node } from '@antv/x6';
import { Graph } from '@antv/x6';
import { useSize } from 'ahooks';
import classnames from 'classnames';
import './edge';
import './node';
import type { Dispatch, SetStateAction } from 'react';
import React, { useEffect } from 'react';

import styles from './index.less';

interface IVoteInstNodesGraph {
  nodes: Node[];
  edges: Edge[];
  groupNodeIds: string[][];
  setGraphHeight: Dispatch<SetStateAction<number>>;
}

export const VoteInstNodesGraph: React.FC<IVoteInstNodesGraph> = ({
  nodes,
  edges,
  groupNodeIds,
  setGraphHeight,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [graph, setGraph] = React.useState<Graph | null>(null);

  const viewRef = React.useRef<HTMLDivElement>(null);
  const { width, height } = useSize(viewRef.current) || {};

  useEffect(() => {
    if (graph && width && height) {
      graph.resize(width, height);
    }
  }, [graph, width, height]);

  useEffect(() => {
    if (containerRef.current) {
      initGraph(containerRef.current, nodes, edges);
    }
    return () => {
      disposeGraph();
    };
  }, [nodes, edges]);

  const initGraph = (container: HTMLDivElement, nodes: Node[], edges: Edge[]) => {
    const { clientWidth, clientHeight } = container;
    const _graph = new Graph({
      container,
      width: clientWidth || 552,
      height: clientHeight || 200,
      interacting: false,
      autoResize: true,
      connecting: {
        connector: {
          name: 'rounded',
          args: {
            radius: 8,
          },
        },
      },
    });

    const dagreLayout = new DagreLayout({
      type: 'dagre',
      rankdir: 'LR',
      ranksep: 100,
      nodesep: 22,
    });

    const model = dagreLayout.layout({
      nodes,
      edges,
    });

    _graph.fromJSON(model);

    // 添加 节点 group 包围每组图
    const padding = 16;
    groupNodeIds.forEach((groupIds) => {
      const bbox = _graph.getCellsBBox(groupIds.map((id) => _graph.getCellById(id)));
      if (bbox) {
        const node = _graph.addNode({
          x: bbox.x - padding,
          y: bbox.y - padding,
          width: bbox.width + padding * 2,
          height: bbox.height + padding * 2,
          id: `group-${groupIds.join('-')}`,
          attrs: {
            body: {
              strokeWidth: 0,
              fill: '#00000005',
            },
          },
        });
        node.toBack();
      }
    });

    _graph.zoomToFit({
      minScale: 0.85,
    });

    _graph.positionContent('top');

    const graphBbox = _graph.getAllCellsBBox();

    if (setGraphHeight) {
      const { height } = _graph.localToClient(graphBbox);
      setGraphHeight(height);
    }

    setGraph(_graph);
  };

  const disposeGraph = () => {
    if (graph) {
      graph.dispose();
    }
  };

  return (
    <>
      <div className={styles.container}>
        <div ref={containerRef} className={classnames(styles.graph, 'x6-graph')} />
      </div>
    </>
  );
};
