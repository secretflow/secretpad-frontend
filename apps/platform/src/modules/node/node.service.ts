import { Emitter } from '@secretflow/utils';

import API from '@/services/secretpad';
import { Model } from '@/util/valtio-helper';

/**
 * This is the service for Node, to fetch the list of nodes registered and track current
 * node in edge platform
 */
export class NodeService extends Model {
  /**
   * Current node of node service.
   */
  currentNode?: API.NodeVO;

  /**
   * Event emitter for change of current node.
   */
  eventEmitter: Emitter<API.NodeVO>;

  constructor() {
    super();
    this.eventEmitter = new Emitter();
  }

  /**
   * List all the nodes registered
   *
   * @return {Promise<API.NodeVO[]>} the list of nodes
   */

  async listNode(): Promise<API.NodeVO[]> {
    const result = await API.NodeController.listNode();
    const nodeList = result?.data || [];
    return nodeList;
  }

  /**
   * List edge the nodes registered
   * @return {Promise<API.NodeVO[]>} the list of edge nodes
   */
  async edgeListNode(nodeId: string): Promise<API.NodeVO[]> {
    const result = await API.NodeController.listNode();
    const nodeList = result?.data || [];
    return nodeList;
  }

  /**
   * Set current node used in edge platform，and emit the event that current node changed
   * @param {API.NodeVO} node current node
   * @return {void}
   */
  setCurrentNode(node: API.NodeVO): void {
    this.currentNode = node;
    this.eventEmitter.fire(node);
  }
}
