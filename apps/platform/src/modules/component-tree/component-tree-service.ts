import { NodeStatus } from '@secretflow/dag';
import { Emitter } from '@secretflow/utils';
import { message } from 'antd';

import {
  listComponents,
  getComponent,
  batchGetComponent,
} from '@/services/secretpad/GraphController';
import { getModel, Model } from '@/util/valtio-helper';

import { ComponentConfigRegistry } from '../component-config/component-config-registry';
import { DefaultComponentConfigService } from '../component-config/component-config-service';
import { DefaultComponentInterpreterService as ComponentInterpreterService } from '../component-interpreter/component-interpreter-service';

import type { Component, ComponentTreeItem, ComputeMode } from './component-protocol';

export class DefaultComponentTreeService extends Model {
  protected readonly onComponentDraggedEmitter = new Emitter<{
    component: Component;
    status: NodeStatus;
    e: React.MouseEvent<HTMLDivElement, MouseEvent>;
  }>();

  onComponentDragged = this.onComponentDraggedEmitter.on;
  componentList: Record<ComputeMode, Component[]> = { TEE: [], MPC: [] };
  componentConfigMap: Record<ComputeMode, Record<string, Component>> = {
    TEE: {},
    MPC: {},
  };

  componentConfigRegistry = getModel(ComponentConfigRegistry);
  componentInterpreter = getModel(ComponentInterpreterService);
  componentConfigService = getModel(DefaultComponentConfigService);

  isLoaded = false;

  constructor() {
    super();
    this.getComponentList();
  }

  async getComponentList() {
    const { data, status: componentListStatus } = await listComponents();
    if (!data || componentListStatus?.code !== 0) {
      message.error(componentListStatus?.msg || '获取组件失败');
      return;
    }
    this.componentList = {
      TEE: data['trustedflow']?.comps || ([] as Component[]),
      MPC: data['secretflow']?.comps || ([] as Component[]),
    };

    const { data: specMpcList, status } = await batchGetComponent(
      this.componentList['MPC'].map((node) => ({
        app: 'secretflow',
        name: node.name,
        domain: node.domain,
      })),
    );

    const { data: specTeeList, status: teeStatus } = await batchGetComponent(
      this.componentList['TEE'].map((node) => ({
        app: 'trustedflow',
        name: node.name,
        domain: node.domain,
      })),
    );

    if (specMpcList) {
      specMpcList.forEach((componentConfig: Component) => {
        this.componentConfigMap['MPC'][
          `${componentConfig.domain}/${componentConfig.name}`
        ] = componentConfig;
        this.componentConfigRegistry.registerConfigNode(componentConfig, 'MPC');
      });
    }

    if (specTeeList) {
      specTeeList.forEach((componentConfig: Component) => {
        this.componentConfigMap['TEE'][
          `${componentConfig.domain}/${componentConfig.name}`
        ] = componentConfig;
        this.componentConfigRegistry.registerConfigNode(componentConfig, 'TEE');
      });
    }

    this.isLoaded = true;
  }

  async getComponentConfig(
    componentName: {
      name: string;
      domain: string;
    },
    mode: ComputeMode,
  ): Promise<Component | undefined> {
    const mapRes =
      this.componentConfigMap[mode][`${componentName.domain}/${componentName.name}`];
    if (mapRes) return mapRes;

    // const { data: component } = await getComponent(componentName);
    // return component as Component;
  }

  async dragComponent(
    node: { title: string; category: string },
    mode: ComputeMode,
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) {
    const componentConfig = await this.getComponentConfig(
      {
        name: node.title,
        domain: node.category,
      },
      mode,
    );
    const isConfigNeeded = this.componentConfigService.isConfigNeeded(
      `${node.category}/${node.title}`,
      mode,
    );

    componentConfig &&
      this.onComponentDraggedEmitter.fire({
        component: componentConfig,
        status: isConfigNeeded ? NodeStatus.unfinished : NodeStatus.default,
        e,
      });
  }

  convertToTree(mode: ComputeMode): ComponentTreeItem[] {
    return this.componentList[mode].reduce<ComponentTreeItem[]>((acc, component) => {
      const { domain: category, name: label, desc, version } = component;
      const treeItem = {
        category,
        title: { val: label },
        docString: desc,
        isLeaf: true,
        key: label,
        version,
      };

      if (category) {
        const dir = acc.find(({ key }) => category === key);
        if (dir) {
          if (!dir.children) dir.children = [];
          dir.children.push(treeItem);
        } else {
          acc.push({
            category: '',
            title: { val: category },
            key: category,
            isLeaf: false,
            docString: '',
            children: [treeItem],
          });
        }
      } else {
        acc.push(treeItem);
      }

      const order = [
        'read_data',
        'feature',
        'preprocessing',
        'stats',
        'ml.train',
        'ml.predict',
        'ml.eval',
      ];

      acc.sort((a, b) => order.indexOf(a.title.val) - order.indexOf(b.title.val));

      return acc;
    }, []);
  }
}
