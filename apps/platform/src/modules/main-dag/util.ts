import type { Node, Edge } from '@antv/x6';
import { NodeStatus } from '@secretflow/dag';

import mainDag from '@/modules/main-dag/dag';

export const createPortTooltip = (
  container: Element,
  text: string,
  className: string,
) => {
  const selector = `.${className}`;
  container.addEventListener('mouseenter', (e: Event) => {
    const evt = e as MouseEvent;
    const tooltip = document.querySelector(selector) as HTMLElement;
    const content = tooltip?.querySelector('.ant-tooltip-inner') as HTMLElement;
    const arrow = tooltip.querySelector('.ant-tooltip-arrow') as HTMLElement;
    if (content) {
      content.innerText = text;
      setTimeout(() => {
        const width = content.offsetWidth;
        tooltip.style.left = `${evt.clientX - width / 2}px`;
        tooltip.style.top = `${evt.clientY - content.offsetHeight - 18}px`;
        arrow.style.left = `${width / 2}px`;
      }, 20);
    }
  });
  container.addEventListener('mouseleave', () => {
    setTimeout(() => {
      const tooltip = document.querySelector(selector) as HTMLElement;
      tooltip.style.left = '-1000px';
      tooltip.style.top = '-1000px';
    }, 30);
  });
};

export enum nodeStatus {
  RUNNING = NodeStatus.running,
  SUCCEED = NodeStatus.success,
  FAILED = NodeStatus.failed,
  STAGING = NodeStatus.default,
  INITIALIZED = NodeStatus.pending,
  STOPPED = NodeStatus.stopped,
  UNFINISHED = NodeStatus.unfinished,
}

export const validateConnection = (
  sourceNode: Node,
  targetNode: Node,
  sourceMagnet: Element,
  targetMagnet: Element,
  edges: Edge[],
) => {
  // 只能从 bottom 连接桩开始连接，连接到 top 连接桩
  if (!sourceMagnet || sourceMagnet.getAttribute('port-group') === 'top') {
    return false;
  }
  if (!targetMagnet || targetMagnet.getAttribute('port-group') !== 'top') {
    return false;
  }

  // 不能重复连线
  const port = targetMagnet.getAttribute('port') as string;
  if (edges.find((edge) => edge.getTargetPortId() === port)) {
    return false;
  }

  //连接桩类型校验
  let res = false;
  const sourcePortId = sourceMagnet.getAttribute('port') as string;
  const sourcePortType = sourceNode.getPort(sourcePortId)?.type;

  const targetPortId = targetMagnet.getAttribute('port') as string;
  const targetPortType = targetNode.getPort(targetPortId)?.type;

  for (const sourceType of sourcePortType) {
    // const res = targetPortType.indexOf(sourceType);
    if (targetPortType.indexOf(sourceType) > -1) {
      res = true;
      break;
    }
  }

  return res;
};
