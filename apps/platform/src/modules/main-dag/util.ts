import { NodeStatus } from '@secretflow/dag';

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
