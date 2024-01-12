import { Graph } from '@antv/x6';
import { useSize } from 'ahooks';
import classnames from 'classnames';
import './edge';
import './node';
import React from 'react';

import { nodes, edges } from './data';
import styles from './index.less';

export const GuidePipeline: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [graph, setGraph] = React.useState<Graph | null>(null);
  // const [openInfoDrawer, setOpenInfoDrawer] = React.useState<boolean>(false);

  const viewRef = React.useRef<HTMLDivElement>(null);
  const { width, height } = useSize(viewRef.current) || {};

  React.useEffect(() => {
    if (graph && width && height) {
      graph.resize(width, height);
      autoResize();
    }
  }, [graph, width, height]);

  React.useLayoutEffect(() => {
    if (containerRef.current) {
      initGraph(containerRef.current);
    }
    return () => {
      disposeGraph();
    };
  }, []);

  // const changeDrawerOpen = (open: boolean) => {
  //   setOpenInfoDrawer(open);
  // };

  const initGraph = (container: HTMLDivElement) => {
    const { clientWidth, clientHeight } = container;
    const _graph = new Graph({
      container,
      width: clientWidth,
      height: clientHeight,
      interacting: false,
      connecting: {
        router: {
          name: 'er',
          args: {
            offset: 'center',
          },
        },
      },
    });

    _graph.fromJSON({
      nodes,
      edges,
    });

    setGraph(_graph);

    autoResize();
  };

  const disposeGraph = () => {
    if (graph) {
      graph.dispose();
    }
  };

  const autoResize = () => {
    if (graph) {
      graph.zoomToFit({ maxScale: 1 });
      graph.centerContent();
      graph.positionPoint({ x: 131, y: 40 }, 0, 0);
    }
  };

  return (
    <>
      <div className={styles.bootomContent} ref={viewRef}>
        <div className={styles.container}>
          <div ref={containerRef} className={classnames(styles.graph, 'x6-graph')} />
        </div>
        <div className={styles.bootomBtn}></div>
      </div>
      {/* <ConceptInfo
        openInfoDrawer={openInfoDrawer}
        changeDrawerOpen={changeDrawerOpen}
      /> */}
    </>
  );
};
