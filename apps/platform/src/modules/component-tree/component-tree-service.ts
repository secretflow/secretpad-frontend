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

import type { Component } from './component-protocol';
import type { ComponentTreeItem } from './component-tree-protocol';

export class DefaultComponentTreeService extends Model {
  protected readonly onComponentDraggedEmitter = new Emitter<{
    component: Component;
    status: NodeStatus;
    e: React.MouseEvent<HTMLDivElement, MouseEvent>;
  }>();

  onComponentDragged = this.onComponentDraggedEmitter.on;
  componentList: Component[] = [];
  componentConfigMap: Record<string, Component> = {};

  componentConfigRegistry = getModel(ComponentConfigRegistry);
  componentInterpreter = getModel(ComponentInterpreterService);
  componentConfigService = getModel(DefaultComponentConfigService);

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
    this.componentList = data.comps as Component[];

    const { data: specList, status } = await batchGetComponent(
      this.componentList.map((node) => ({
        name: node.name,
        domain: node.domain,
      })),
    );

    if (status && status.code !== 0) {
      message.error(status.msg);
    }

    if (specList) {
      specList.forEach((componentConfig: Component) => {
        this.componentConfigMap[`${componentConfig.domain}/${componentConfig.name}`] =
          componentConfig;
        this.componentConfigRegistry.registerConfigNode(componentConfig);
      });
    }
  }

  async getComponentConfig(componentName: {
    name: string;
    domain: string;
  }): Promise<Component | undefined> {
    const mapRes =
      this.componentConfigMap[`${componentName.domain}/${componentName.name}`];
    if (mapRes) return mapRes;

    const { data: component } = await getComponent(componentName);
    return component as Component;
  }

  async dragComponent(
    node: { title: string; category: string },
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) {
    const componentConfig = await this.getComponentConfig({
      name: node.title,
      domain: node.category,
    });
    const isConfigNeeded = this.componentConfigService.isConfigNeeded(
      `${node.category}/${node.title}`,
    );

    componentConfig &&
      this.onComponentDraggedEmitter.fire({
        component: componentConfig,
        status: isConfigNeeded ? NodeStatus.unfinished : NodeStatus.default,
        e,
      });
  }

  convertToTree(): ComponentTreeItem[] {
    return this.componentList.reduce<ComponentTreeItem[]>((acc, component) => {
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
