import type { TourProps } from 'antd';
import { Tour } from 'antd';
import React, { useRef } from 'react';

import ClickComponentGIF from '@/assets/click-component.gif';
import ComponentConfigGIF from '@/assets/component-config.gif';
import ComponentTreeGIF from '@/assets/component-tree.gif';
import ComponentTabGIF from '@/assets/dag-component.gif';
import ExecuteAllGIF from '@/assets/execute-all.gif';
import ResultAndRecordGIf from '@/assets/resultandrecord.gif';
import ViewResultGIF from '@/assets/view-result.gif';
import { componentConfigDrawer } from '@/modules/component-config/config-modal';
import { DefaultModalManager } from '@/modules/dag-modal-manager';
import {
  GuideTourKeys,
  GuideTourService,
} from '@/modules/guide-tour/guide-tour-service';
import mainDag from '@/modules/main-dag/dag';
import { getModel, Model, useModel } from '@/util/valtio-helper';

import styles from './index.less';

export const DAGGuideTourComponent: React.FC = () => {
  const viewInstance = useModel(DAGGuideTour);

  const componentTabRef = useRef<HTMLDivElement>(null);

  const steps: TourProps['steps'] = [
    {
      title: '点击切换到组件库,看看我们有哪些组件吧',
      description: <img src={ComponentTabGIF} className={styles.gifs} />,
      prevButtonProps: {
        style: {
          display: 'none',
        },
      },
      nextButtonProps: {
        children: <span>下一步</span>,
        onClick: () => {
          const tabs = document.querySelectorAll('.ant-tabs-tab-btn');
          for (let i = 0; i < tabs.length; i++) {
            const tab = tabs[i] as HTMLElement;
            if (tab.innerText === '组件库') {
              tab.click();
            }
          }
        },
      },
      target: () => {
        const tabs = document.querySelectorAll('.ant-tabs-tab-btn');
        for (let i = 0; i < tabs.length; i++) {
          const tab = tabs[i] as HTMLElement;
          if (tab.innerText === '组件库') {
            return tab.parentNode as HTMLElement;
          }
        }
        return componentTabRef.current as HTMLElement;
      },
    },
    {
      title: '右侧的训练流都是由这里拖拽的组件搭建的哦',
      description: <img src={ComponentTreeGIF} className={styles.gifs} />,
      prevButtonProps: {
        style: {
          display: 'none',
        },
      },
      nextButtonProps: {
        children: <span>下一步</span>,
      },
      target: () => {
        const div = document.querySelector('.component-tree-for-tour');
        if (div) return div as HTMLElement;
        return componentTabRef.current as HTMLElement;
      },
    },
    {
      title: '点击组件后就可以唤出组件的配置面板,进行组件配置',
      description: <img src={ClickComponentGIF} className={styles.gifs} />,
      prevButtonProps: {
        style: {
          display: 'none',
        },
      },
      nextButtonProps: {
        children: <span>下一步</span>,
        onClick: async () => {
          const nodes = mainDag.dataService.getNodes();
          const node = nodes.find((i) => i.label === '全表统计');
          if (!node) return;
          viewInstance.modalManager.openModal(componentConfigDrawer.id, {
            ...node,
          });
        },
      },
      target: () => {
        const nodes = document.querySelectorAll('.dag-node .label');
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i] as HTMLElement;
          if (node.innerText === '全表统计') {
            return node.parentNode?.parentNode as HTMLElement;
          }
        }
        return componentTabRef.current as HTMLElement;
      },
    },
    {
      title: '这里是组件配置面板 ,有任何要编辑的内容都可以在这里操作~',
      description: <img src={ComponentConfigGIF} className={styles.gifs} />,
      prevButtonProps: {
        style: {
          display: 'none',
        },
      },
      nextButtonProps: {
        children: <span>下一步</span>,
      },
      target: () => {
        const node = document.querySelector(
          '.component-panel-for-tour .ant-drawer-content-wrapper',
        );
        if (node) return node as HTMLElement;
        return componentTabRef.current as HTMLElement;
      },
    },
    {
      title: '🎉恭喜完成所有操作，点击执行试试~',
      description: <img src={ExecuteAllGIF} className={styles.gifs} />,
      prevButtonProps: {
        style: {
          display: 'none',
        },
      },
      nextButtonProps: {
        onClick: viewInstance.closeTourOne,
        children: <span>知道了</span>,
      },
      target: () => {
        const nodes = document.querySelectorAll('.toolbar-for-guide-tour button');
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i] as HTMLElement;
          if (node.innerText === '全部执行') {
            return node;
          }
        }
        return componentTabRef.current as HTMLElement;
      },
    },
  ];

  const steps2: TourProps['steps'] = [
    {
      title: '执行成功，后续可以点击这里查看结果',
      description: <img src={ViewResultGIF} className={styles.gifs} />,
      prevButtonProps: {
        style: {
          display: 'none',
        },
      },
      nextButtonProps: {
        children: <span>下一步</span>,
      },
      target: () => {
        const nodes = document.querySelectorAll('.dag-node .label');
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i] as HTMLElement;
          if (node.innerText === '二分类评估') {
            return node.parentNode?.parentNode as HTMLElement;
          }
        }
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i] as HTMLElement;
          if (node.innerText === '全表统计') {
            return node.parentNode?.parentNode as HTMLElement;
          }
        }
        return componentTabRef.current as HTMLElement;
      },
    },
    {
      title: '🎉这里可以查看所有的历史记录与结果哦',
      description: <img src={ResultAndRecordGIf} className={styles.gifs} />,
      prevButtonProps: {
        style: {
          display: 'none',
        },
      },
      nextButtonProps: {
        onClick: viewInstance.closeTourTwo,
        children: <span>知道了</span>,
      },
      target: () => {
        const node = document.querySelector('.toolbar2-for-guide-tour');
        if (node) return node as HTMLElement;
        return componentTabRef.current as HTMLElement;
      },
    },
  ];

  return (
    <div className={styles.guideTour}>
      <Tour
        open={!viewInstance.guideTourService.DAGGuideTourOne}
        onClose={() => viewInstance.closeTourOne()}
        type="primary"
        steps={steps}
        placement="right"
        prefixCls="dag-tour"
      />

      <Tour
        open={
          !viewInstance.guideTourService.DAGGuideTourTwo &&
          viewInstance.guideTourService.DAGGuideTourOne
        }
        onClose={() => viewInstance.closeTourTwo()}
        mask={false}
        type="primary"
        steps={steps2}
        placement="right"
        prefixCls="dag-tour"
      />
    </div>
  );
};

export class DAGGuideTour extends Model {
  token = '';

  guideTourService = getModel(GuideTourService);
  modalManager = getModel(DefaultModalManager);

  closeTourOne = () => {
    this.guideTourService.finishTour(GuideTourKeys.DAGGuideTourOne);
    this.modalManager.closeModal(componentConfigDrawer.id);
  };

  closeTourTwo = () => {
    this.guideTourService.finishTour(GuideTourKeys.DAGGuideTourTwo);
  };
}
