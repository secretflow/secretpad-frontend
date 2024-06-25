import type { Edge } from '@antv/x6';
import type { GraphNode, Node } from '@secretflow/dag';
import type { GraphEventHandlerProtocol } from '@secretflow/dag';
import { ActionType } from '@secretflow/dag';
import { Emitter } from '@secretflow/utils';
import { message } from 'antd';

import { DefaultComponentTreeService } from '@/modules/component-tree/component-tree-service';
import { dagLogDrawer } from '@/modules/dag-log/log.drawer.layout';
import { DefaultModalManager } from '@/modules/dag-modal-manager';
import { ModelSubmissionDrawerItem } from '@/modules/dag-model-submission/submission-drawer';
import type { ModelInfo } from '@/modules/dag-model-submission/submission-service';
import { getModel, Model } from '@/util/valtio-helper';

import mainDag from './dag';
import {
  highlightSelectionByIds,
  isModel,
  isPost,
  isPre,
  isPredict,
  resetGraphStyles,
  sortNodes,
  updateGraphNodesStyles,
  getModelSameBranchNodes,
} from './util';

export class SubmitGraphService extends Model implements GraphEventHandlerProtocol {
  onModelSubmitChangedEmitter = new Emitter<ModelInfo>();
  onModelSubmitChanged = this.onModelSubmitChangedEmitter.on;

  graphManager = mainDag.graphManager;

  modalManager = getModel(DefaultModalManager);
  componentService = getModel(DefaultComponentTreeService);

  selectNodeIdsObj: {
    modelNodeIds: string[];
    preNodesIds: string[];
    nextNodesIds: string[];
    predictNodesIds: string[];
  } = {
    modelNodeIds: [],
    preNodesIds: [],
    nextNodesIds: [],
    predictNodesIds: [],
  };

  resetSelectNodeIdsObj = () => {
    this.selectNodeIdsObj = {
      modelNodeIds: [],
      preNodesIds: [],
      nextNodesIds: [],
      predictNodesIds: [],
    };
  };

  onCenterNode = (nodeId: string) => {
    mainDag.graphManager.executeAction(ActionType.centerNode, nodeId);
  };

  onNodeClick: ((node: Node<Node.Properties>) => void) | undefined = async (node) => {
    const data = node.getData<GraphNode>();
    const graph = mainDag.graphManager.getGraphInstance();
    if (!graph) return;
    const { styles = {} } = data;
    const { isOpaque = false, nodeParties = [] } = styles;
    if (isOpaque !== true) {
      this.modalManager.openModal(dagLogDrawer.id, {
        nodeData: data,
        from: 'pipeline',
        nodeParties,
      });
      this.autoSelectModel(node);
      this.resetSelectionEdge();
      this.emitModelSubmitChanged();
    }
  };

  /** 自动选中模型算子 */
  autoSelectModel = (node: Node) => {
    const graph = mainDag.graphManager.getGraphInstance();
    if (!graph) return;
    if (isModel(node)) {
      // 如果 node 是模型并且被选中。点击 清空选择，然后选择模型的上下游
      if (this.selectNodeIdsObj.modelNodeIds.includes(node.id)) {
        this.clearGraphSelection();
        // this.modalManager.closeModal(ModelSubmissionDrawerItem.id);
        highlightSelectionByIds(this.getSelectIds());
        this.modalManager.closeModal(dagLogDrawer.id);
        return;
      }
      // 重置可选算子
      this.clearGraphSelection();
      this.onCenterNode(node.getData().id);
      const sameBrachNodes = getModelSameBranchNodes(node);
      if (sameBrachNodes) {
        // 需要打包训练算子，不需要打包预测算子, 也不需要打包后处理算子
        const newSameBrachNodes = {
          modelNode: sameBrachNodes?.modelNode,
          preNodes: sameBrachNodes?.preNodes,
          // nextNodes: sameBrachNodes?.nextNodes,
        };
        updateGraphNodesStyles(Object.values(newSameBrachNodes).flat(), {
          isOpaque: false,
        });
        this.selectNodeIdsObj = {
          modelNodeIds: sameBrachNodes.modelNode.map((item) => item.id),
          preNodesIds: sameBrachNodes.preNodes.map((item) => item.id),
          nextNodesIds: [],
          predictNodesIds: [],
        };
        highlightSelectionByIds(this.getSelectIds());
        this.modalManager.openModal(ModelSubmissionDrawerItem.id);
      }
    }
    // else if (isModelParamsModification(node)) {
    //   // 如果选择的是 线性模型参数修改算子 则需要选中他上游的模型算子，以及前处理算子
    //   // 如果 node 是线性模型参数修改算子并且被选中。点击 清空选择，然后选择模型的上下游
    //   if (this.selectNodeIdsObj.nextNodesIds.includes(node.id)) {
    //     this.clearGraphSelection();
    //     // this.modalManager.closeModal(ModelSubmissionDrawerItem.id);
    //     highlightSelectionByIds(this.getSelectIds());
    //     this.modalManager.closeModal(dagLogDrawer.id);
    //     return;
    //   }
    //   // 重置可选算子
    //   this.clearGraphSelection();
    //   this.onCenterNode(node.getData().id);
    //   const sameBrachNodes = getModelSameBranchNodes(node);
    //   if (sameBrachNodes) {
    //     updateGraphNodesStyles(Object.values(sameBrachNodes).flat(), {
    //       isOpaque: false,
    //     });
    //     this.selectNodeIdsObj = {
    //       modelNodeIds: sameBrachNodes.modelNode.map((item) => item.id),
    //       preNodesIds: sameBrachNodes.preNodes.map((item) => item.id),
    //       nextNodesIds: sameBrachNodes.nextNodes.map((item) => item.id),
    //       predictNodesIds: [],
    //     };
    //     highlightSelectionByIds(this.getSelectIds());
    //     this.modalManager.openModal(ModelSubmissionDrawerItem.id);
    //   }
    // }
    else if (isPredict(node)) {
      if (this.selectNodeIdsObj.predictNodesIds.includes(node.id)) {
        this.clearGraphSelection();
        highlightSelectionByIds(this.getSelectIds());
        this.modalManager.closeModal(dagLogDrawer.id);
        return;
      }

      // 重置可选算子
      this.clearGraphSelection();
      this.onCenterNode(node.getData().id);
      const sameBrachNodes = getModelSameBranchNodes(node);
      if (sameBrachNodes) {
        updateGraphNodesStyles(Object.values(sameBrachNodes).flat(), {
          isOpaque: false,
        });
        this.selectNodeIdsObj = {
          // modelNodeIds: sameBrachNodes.modelNode.map((item) => item.id),
          preNodesIds: sameBrachNodes.preNodes.map((item) => item.id),
          nextNodesIds: sameBrachNodes.nextNodes.map((item) => item.id),
          predictNodesIds: sameBrachNodes.predictNode.map((item) => item.id),
          modelNodeIds: [],
        };
        highlightSelectionByIds(this.getSelectIds());
        this.modalManager.openModal(ModelSubmissionDrawerItem.id);
      }
    } else {
      /** 点击的不是模型训练算子也不是模型预测算子 则 获取当前选中的模型算子 判断当前点击的是 上游还是下游 */
      const modelNode = graph
        .getNodes()
        .find(
          (item) =>
            item.id === this.selectNodeIdsObj.modelNodeIds[0] ||
            item.id === this.selectNodeIdsObj.predictNodesIds[0],
        );
      if (!modelNode) return;

      /** node 是否是模型的前序节点算子 */
      if (graph.isPredecessor(modelNode, node)) {
        message.warning('当前组件为模型的上游，不可取消选择，请先取消模型组件');
      }

      /** node 是否是模型的后序节点算子 可取消选中 */
      if (graph.isSuccessor(modelNode, node)) {
        const currentNodeId = node.id;
        // 已经选中，则取消选中，没有选中，则选中
        if (this.selectNodeIdsObj.nextNodesIds.includes(currentNodeId)) {
          this.selectNodeIdsObj.nextNodesIds =
            this.selectNodeIdsObj.nextNodesIds.filter((item) => item !== currentNodeId);
        } else {
          this.selectNodeIdsObj.nextNodesIds = [
            ...this.selectNodeIdsObj.nextNodesIds,
            currentNodeId,
          ];
        }
      }

      /** 重新设置选中节点 */
      highlightSelectionByIds(this.getSelectIds());
    }
  };

  /** 获取画布选中节点id */
  getSelectIds = () => {
    return Object.values(this.selectNodeIdsObj).flat();
  };

  /** 根据 selectNodeIdsObj 获取画布节点 */
  getGraphNodesBySelectIds = () => {
    const graph = mainDag.graphManager.getGraphInstance();
    if (!graph) return [];
    const valuesIds = Object.values(this.selectNodeIdsObj).flat();
    return graph.getNodes().filter((item) => valuesIds.includes(item.id));
  };

  /** 清空画布选中算子，重置画布为只允许选择模型训练和模型预测算子状态 */
  clearGraphSelection = () => {
    this.resetSelectNodeIdsObj();
    resetGraphStyles();
  };

  /** 重置边的状态 */
  resetSelectionEdge = () => {
    const selectNodes = this.getGraphNodesBySelectIds();
    const getSelectIds = this.getSelectIds();
    const graph = mainDag.graphManager.getGraphInstance();
    if (!graph) return;
    graph.getEdges().forEach((edge: Edge) => {
      edge.setAttrByPath(['line', 'opacity'], '0.25');
    });
    selectNodes.forEach((item: Node) => {
      const edges = graph.getOutgoingEdges(item) || [];
      edges.forEach((edge: Edge) => {
        if (getSelectIds.includes(edge.getData().target)) {
          edge.setAttrByPath(['line', 'opacity'], '1');
        }
      });
    });
  };

  emitModelSubmitChanged = () => {
    const graph = mainDag.graphManager.getGraphInstance();
    if (!graph) return;
    const result: ModelInfo = {
      modelNode: [],
      preNodes: [],
      postNodes: [],
      predictNode: [],
    };
    const currentSelectedNodes = this.getGraphNodesBySelectIds() as Node[];
    const newSelectNodes = sortNodes(currentSelectedNodes);
    newSelectNodes.forEach((node) => {
      const nodeData = node.getData();
      if (isModel(node)) {
        result.modelNode.push(nodeData);
      } else if (isPre(node)) {
        result.preNodes.push(nodeData);
      } else if (isPost(node)) {
        result.postNodes.push(nodeData);
      } else if (isPredict(node)) {
        // 如果选择了预测算子，需要将预测算子上面的训练算子也传给服务端，这里算子是根据画布选中节点来处理的，所以这里需要使用 getModelSameBranchNodes 额外获取一下训练算子
        result.predictNode.push(nodeData);
        const sameBrachNodes = getModelSameBranchNodes(node);
        result.modelNode.push(sameBrachNodes?.modelNode[0]?.getData());
      }
    });
    this.onModelSubmitChangedEmitter.fire(result);
  };

  onBlankClick() {
    highlightSelectionByIds(this.getSelectIds());
  }
}

mainDag.addGraphEvents(getModel(SubmitGraphService));
