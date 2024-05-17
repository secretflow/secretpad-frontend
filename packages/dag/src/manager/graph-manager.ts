import type { Node, EdgeView, Edge } from '@antv/x6';
import { Graph } from '@antv/x6';
import { Keyboard } from '@antv/x6-plugin-keyboard';
import { Selection } from '@antv/x6-plugin-selection';

import { ActionType } from '../actions';
import DAGContext from '../context';
import { validateConnection } from '../utils';

import type { GraphMode } from './protocol';
import type { GraphManager } from './protocol';

export class DefaultGraphManager extends DAGContext implements GraphManager {
  dagId: string | null = null;
  graph: Graph | null = null;

  init(
    dagId: string,
    graphConfig: Graph.Options,
    mode: GraphMode = 'FULL',
    ...args: any[]
  ) {
    this.dagId = dagId;

    if (this.graph) {
      this.graph.dispose();
      this.graph = null;
    }

    if (!this.graph) {
      this.initGraph(graphConfig);

      if (mode === 'FULL') {
        this.initPlugins();
        this.initHotKeys();
      }

      this.initEvents(mode);
      this.executeAction([ActionType.render, ActionType.queryStatus]);
    }
  }

  initGraph(graphConfig: Graph.Options) {
    this.graph = new Graph({
      width: 1000,
      height: 800,
      panning: {
        enabled: true,
        eventTypes: ['leftMouseDown', 'mouseWheel'],
      },
      mousewheel: {
        enabled: true,
        modifiers: 'ctrl',
        factor: 1.1,
        maxScale: 1.5,
        minScale: 0.5,
      },
      highlighting: {
        magnetAvailable: {
          name: 'stroke',
          args: {
            attrs: {
              fill: '#fff',
              stroke: '#A4DEB1',
              'stroke-width': 4,
            },
          },
        },
        magnetAdsorbed: {
          name: 'stroke',
          args: {
            attrs: {
              fill: '#fff',
              stroke: '#31d0c6',
              'stroke-width': 4,
            },
          },
        },
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
      ...graphConfig,
    });
  }

  initPlugins = () => {
    if (this.graph) {
      this.graph.use(
        new Keyboard({
          global: false,
        }),
      );
      this.graph.use(
        new Selection({
          enabled: true,
          multiple: true,
          rubberEdge: true,
          rubberNode: true,
          modifiers: 'shift',
          rubberband: true,
        }),
      );
    }
  };

  initHotKeys = () => {
    const actionIsRun = [ActionType.runDown, ActionType.runUp, ActionType.runSingle];
    const actionWithoutSelection = [ActionType.tidyLayout];
    if (this.graph && this.dagId) {
      const actions = this.context.ActionHub.getData();
      for (const item of actions) {
        if (item.hotKey) {
          const { key } = item.hotKey;
          if (key) {
            this.graph.bindKey(key, (e) => {
              const nodeIds = this.graph
                ?.getSelectedCells()
                .filter((cell) => cell.isNode())
                .map((cell) => cell.id);
              const edgeIds = this.graph
                ?.getSelectedCells()
                .filter((cell) => cell.isEdge())
                .map((cell) => cell.id);
              e.preventDefault();
              if (this.graph) {
                // close modal
                const events = this.context.EventHub.getData();
                for (const event of events) {
                  if (event.onBlankClick) {
                    event.onBlankClick();
                  }
                }

                if (actionWithoutSelection.includes(item.type)) {
                  item.handle(this.graph, this.dagId!);
                  return;
                }
                item.handle(this.graph, this.dagId!, nodeIds, edgeIds);
                if (actionIsRun.includes(item.type)) {
                  setTimeout(() => {
                    this.executeAction(ActionType.queryStatus);
                  }, 1500);
                }
              }
            });
          }
        }
      }
    }
  };

  initEvents(mode: GraphMode = 'FULL') {
    if (!this.graph) {
      return;
    }
    this.graph.on('node:click', ({ node }) => {
      const events = this.context.EventHub.getData();
      for (const event of events) {
        if (event.onNodeClick) {
          event.onNodeClick(node);
        }
      }
    });

    this.graph.on('blank:click', () => {
      const events = this.context.EventHub.getData();

      for (const event of events) {
        if (event.onBlankClick) {
          event.onBlankClick();
        }
      }
    });

    this.graph.on('scale', () => {
      if (this.graph) {
        const events = this.context.EventHub.getData();
        for (const event of events) {
          if (event.onGraphScale) {
            event.onGraphScale(this.graph.zoom());
          }
        }
      }
    });

    this.graph.on('node:added', ({ node, options }) => {
      if (options.dry) {
        return;
      }
      this.executeAction(ActionType.addNode, node);
    });

    if (mode === 'LITE') return;

    this.graph.on('edge:removed', ({ edge }) => {
      const events = this.context.EventHub.getData();
      for (const event of events) {
        if (event.onEdgeRemoved) {
          event.onEdgeRemoved(edge);
        }
      }
    });

    this.graph.on('edge:connected', ({ edge }) => {
      this.executeAction(ActionType.addEdge, edge);

      const events = this.context.EventHub.getData();
      for (const event of events) {
        if (event.onEdgeConnected) {
          event.onEdgeConnected(edge);
        }
      }
    });

    this.graph.on('node:added', () => {
      this.graph?.drawBackground();
    });

    this.graph.on('node:moved', ({ node }) => {
      this.executeAction(ActionType.moveNode, node);
    });

    this.graph.on('selection:changed', ({ selected }) => {
      const events = this.context.EventHub.getData();
      for (const event of events) {
        if (event.onSelectionChanged) {
          event.onSelectionChanged(selected);
        }
      }
    });

    this.graph.on('edge:mouseenter', ({ cell, e }) => {
      if (!this.graph) {
        return;
      }
      const edge = cell as Edge;
      const edgeView = edge.findView(this.graph) as EdgeView;
      const { sourceAnchor, targetAnchor } = edgeView;
      const { clientX, clientY } = e;
      const p = this.graph.clientToLocal(clientX, clientY);

      if (p.distance(sourceAnchor) < 10 || p.distance(targetAnchor) < 10) {
        return;
      }

      cell.addTools([
        {
          name: 'button-remove',
          args: {
            distance: 0.5,
            onClick: ({ view }: { view: EdgeView }) => {
              this.executeAction(ActionType.removeCell, [], [view.cell.id]);
            },
          },
        },
        {
          name: 'source-arrowhead',
          args: {
            tagName: 'circle',
            attrs: {
              r: 4,
              fill: '#52c41a',
              stroke: '#52c41a',
            },
          },
        },
        {
          name: 'target-arrowhead',
          args: {
            tagName: 'circle',
            attrs: {
              r: 4,
              fill: '#52c41a',
              stroke: '#52c41a',
            },
          },
        },
      ]);
    });

    this.graph.on('edge:mouseleave', ({ cell }) => {
      cell.removeTools();
    });

    this.graph.on('edge:change:source', ({ edge, current }) => {
      const item = current as Edge.TerminalCellData;
      if (item && item.cell && item.port) {
        this.executeAction(ActionType.updateEdge, edge);
      }
    });

    this.graph.on('edge:change:target', ({ edge, current }) => {
      const item = current as Edge.TerminalCellData;
      if (item && item.cell && item.port) {
        this.executeAction(ActionType.updateEdge, edge);
      }
    });
  }

  async executeAction(type: ActionType | ActionType[], ...args: any[]) {
    const actions = this.context.ActionHub.getData();
    for (const item of actions) {
      if (this.dagId) {
        if (Array.isArray(type)) {
          if (type.includes(item.type)) {
            await item.handle(this.graph, this.dagId, ...args);
          }
        } else {
          if (type === item.type) {
            return await item.handle(this.graph, this.dagId, ...args);
          }
        }
      }
    }
  }

  getActionInfo(type: ActionType) {
    const actions = this.context.ActionHub.getData();
    for (const item of actions) {
      if (item.type === type) {
        return {
          label: item.label,
          hotKey: item.hotKey,
        };
      }
    }
    return null;
  }

  cancelAction(type: ActionType) {
    const actions = this.context.ActionHub.getData();
    for (const item of actions) {
      if (item.type === type && item.cancel) {
        return item.cancel();
      }
    }
  }

  cancelAllAction() {
    const actions = this.context.ActionHub.getData();
    for (const item of actions) {
      if (item.cancel) {
        item.cancel();
      }
    }
  }

  getGraphInstance() {
    return this.graph;
  }

  getSelectedCells() {
    if (this.graph) {
      return this.graph.getSelectedCells();
    }
    return [];
  }

  dispose() {
    if (this.graph) {
      this.graph.dispose();
      this.context.dataService.close();
      this.cancelAllAction();
      this.graph = null;
      this.dagId = null;
    }
  }
}
