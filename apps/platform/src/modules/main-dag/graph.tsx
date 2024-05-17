import type { Node } from '@antv/x6';
import { Portal, ShowMenuContext, splitPortId } from '@secretflow/dag';
import { useSize } from 'ahooks';
import { Empty, Tooltip } from 'antd';
import classnames from 'classnames';
import { parse } from 'query-string';
import React from 'react';
import { useLocation } from 'umi';

import templateImg from '@/assets/dag-background.svg';
import { ProjectEditService } from '@/modules/layout/header-project-list/project-edit.service';
import { DefaultPipelineService } from '@/modules/pipeline/pipeline-service';
import { getModel, Model, useModel } from '@/util/valtio-helper';

import { DefaultComponentInterpreterService } from '../component-interpreter/component-interpreter-service';
import type { ComputeMode } from '../component-tree/component-protocol';
import { DefaultComponentTreeService } from '../component-tree/component-tree-service';
import { DagLogService } from '../dag-log/dag-log.service';
import { DefaultModalManager } from '../dag-modal-manager';
import { RecordListDrawerItem } from '../pipeline-record-list/record-list-drawer-view';

import mainDag from './dag';
import styles from './index.less';
import { createPortTooltip, validateConnection } from './util';

// const ProgressContext = React.createContext(30);
const X6ReactPortalProvider = Portal.getProvider(); // 注意，一个 graph 只能申明一个 portal provider

export const GraphComponents: React.FC<{
  viewInstance?: GraphView;
  dagInstatnce?: DAG;
}> = (props: { viewInstance?: GraphView; dagInstatnce?: DAG }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const viewInstance = props?.viewInstance || useModel(GraphView);
  const dagInstatnce = props?.dagInstatnce || mainDag;
  const modalManager = useModel(DefaultModalManager);
  const projectEditService = useModel(ProjectEditService);
  const pipelineService = useModel(DefaultPipelineService);

  const { search, pathname } = useLocation();
  const { dagId, mode } = parse(search);

  const viewRef = React.useRef<HTMLDivElement>(null);
  const { width, height } = useSize(viewRef.current) || {};

  React.useEffect(() => {
    const getGraphInit = async () => {
      dagInstatnce.dispose();
      if (dagId && containerRef.current) {
        modalManager.closeAllModalsBut(RecordListDrawerItem.id);
        await pipelineService.changePipelineCanEdit(dagId as string);
        viewInstance.initGraph(
          dagId as string,
          containerRef.current,
          mode as ComputeMode,
          projectEditService.canEdit.graphHotKeyDisabled ? 'LITE' : 'FULL',
        );
      }
    };
    getGraphInit();
  }, [dagId, mode]);

  React.useEffect(() => {
    const graph = dagInstatnce.graphManager.getGraphInstance();
    if (graph && width && height) {
      graph.resize(width, height);
    }
  }, [width, height]);

  return (
    <div className={styles.container} ref={viewRef}>
      {!dagId && (
        <div className={styles.empty}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无训练流，请在左侧面板新建一个"
          />
        </div>
      )}
      <ShowMenuContext.Provider
        value={pathname === '/dag' && !projectEditService.canEdit.menuContextDisabled}
      >
        <X6ReactPortalProvider />
      </ShowMenuContext.Provider>
      <div ref={containerRef} className={classnames(styles.graph, 'x6-graph')} />
      <Tooltip
        title="content"
        overlayClassName="main-widget-tooltip"
        open={true}
        arrow={true}
        placement="top"
        overlayStyle={{ height: 'fit-content' }}
      >
        <span style={{ position: 'relative', left: -1000, top: -1000 }} />
      </Tooltip>
    </div>
  );
};

export class GraphView extends Model {
  componentService = getModel(DefaultComponentTreeService);

  componentInterpreter = getModel(DefaultComponentInterpreterService);

  logService = getModel(DagLogService);

  onViewUnMount() {
    mainDag.dispose();
  }

  initGraph(
    dagId: string,
    container: HTMLDivElement,
    mode: ComputeMode,
    menuContext: 'FULL' | 'LITE',
  ) {
    if (container) {
      const { clientWidth, clientHeight } = container;
      mainDag.init(
        dagId,
        {
          container: container,
          width: clientWidth,
          height: clientHeight,
          background: { image: templateImg as any, position: '50% 30%' },
          onPortRendered: async ({ contentContainer, port, node }) => {
            const { codeName } = node.getData();
            const [domain, name] = codeName.split('/');
            const { type, index } = splitPortId(port.id);
            const component = await this.componentService.getComponentConfig(
              {
                domain,
                name,
              },
              mode,
            );

            if (component) {
              const interpretion = this.componentInterpreter.getComponentTranslationMap(
                {
                  domain,
                  name,
                  version: component.version,
                },
                mode,
              );
              const ioType = type === 'input' ? 'inputs' : 'outputs';
              const des = component?.[ioType]?.[index].desc;
              createPortTooltip(
                contentContainer,
                (interpretion ? interpretion[des] : undefined) || des,
                'main-widget-tooltip',
              );
            }
          },
          connecting: {
            snap: {
              radius: 50,
            },
            allowBlank: false,
            allowLoop: false,
            highlight: true,
            connector: 'dag-connector',
            connectionPoint: 'anchor',
            anchor: 'center',
            validateMagnet({ magnet }) {
              return magnet.getAttribute('port-group') !== 'top';
            },
            validateConnection({ sourceCell, targetCell, sourceMagnet, targetMagnet }) {
              return validateConnection(
                sourceCell as Node,
                targetCell as Node,
                sourceMagnet!,
                targetMagnet!,
                this.getEdges(),
              );
            },
            createEdge() {
              return this.createEdge({
                shape: 'dag-edge',
                attrs: {
                  line: {
                    strokeDasharray: '5 5',
                  },
                },
                zIndex: -1,
              });
            },
          },
        },
        menuContext,
      );
    }
  }
}
