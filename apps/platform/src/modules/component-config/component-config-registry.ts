import type {
  AtomicParameterNode,
  Component,
  ParameterNode,
  UnionParameterNode,
  IoDef,
  ComputeMode,
} from '@/modules/component-tree/component-protocol';
import { Model } from '@/util/valtio-helper';

import type {
  AtomicConfigNode,
  ConfigItem,
  StructConfigNode,
} from './component-config-protocol';

export class ComponentConfigRegistry extends Model {
  readonly root: Record<ComputeMode, StructConfigNode> = {
    TEE: {
      name: 'ROOT',
      children: [],
    },
    MPC: { name: 'ROOT', children: [] },
  };

  registerConfigNode(component: Component, mode: ComputeMode) {
    if (this.hasConfigNode(component, mode)) return;
    const { name, domain, version, attrs = [], inputs } = component;
    const parent: StructConfigNode = {
      name: `${domain}/${name}`,
      domain,
      version,
      children: [],
    };

    if (inputs) {
      const inputsNode = this.createInputConfigNode(inputs);
      inputsNode && parent.children.push(inputsNode);
    }

    if (attrs) {
      for (const param of attrs) {
        const { prefixes } = param;
        if (prefixes) {
          this.getNodeByPath(prefixes, parent, param, 0);
        } else {
          parent.children.push(this.createNode(param));
        }
      }
    }

    this.root[mode].children.push(parent);
  }

  private hasConfigNode(component: Component, mode: ComputeMode) {
    return this.root[mode].children.find((i) => i.name === component.name);
  }

  getNodeByPath(
    prefixes: string[],
    root: StructConfigNode,
    param: ParameterNode,
    depth: number,
  ): ConfigItem | undefined {
    if (prefixes.length === 0) return;

    const prefix = prefixes[depth];
    const child = root.children.find(({ name }) => name === prefix) as StructConfigNode;

    if (!child) {
      root.children.push(this.createNode(param));
      return;
    }

    return this.getNodeByPath(prefixes, child, param, depth + 1);
  }

  private createInputConfigNode(input: IoDef[]) {
    const inputs: StructConfigNode = {
      name: 'input',
      children: [],
    };
    input.map((i, inputIndex) => {
      if (i.attrs) {
        const { name: inputName, attrs } = i;

        attrs.map((attr) => {
          let isRequired = true;
          const {
            name: colName,
            desc,
            col_max_cnt_inclusive,
            col_min_cnt_inclusive = 0,
          } = attr;

          if (col_min_cnt_inclusive === 0) isRequired = false;

          const node = {
            name: colName,
            docString: desc,
            type: 'AT_SF_TABLE_COL',
            prefixes: ['input', inputName],
            fromInputIndex: inputIndex,
            col_max_cnt_inclusive,
            col_min_cnt_inclusive,
            isRequired,
          } as AtomicConfigNode;

          inputs.children.push(node);
        });
      }
    });

    return inputs.children.length ? inputs : undefined;
  }

  createNode(param: ParameterNode): ConfigItem {
    let isRequired = true;
    const { type, name, desc: docString, prefixes, custom_protobuf_cls } = param;

    switch (type) {
      case 'AT_UNION_GROUP':
        return {
          name,
          prefixes,
          children: [],
          docString,
          isRequired: true,
          selectedName: (param as UnionParameterNode)?.union?.default_selection,
          type: 'AT_UNION_GROUP',
        };
      case 'AT_STRUCT_GROUP':
        return {
          name,
          prefixes,
          children: [],
          docString,
          isRequired: false,
          type: 'AT_STRUCT_GROUP',
        };
      case 'AT_CUSTOM_PROTOBUF':
        return {
          name,
          prefixes,
          type,
          custom_protobuf_cls,
          isRequired: true,
          docString,
        };
      default:
        // is_optional：undefined，默认为必填
        // is_optional: true，不必填
        isRequired = (param as AtomicParameterNode).atomic?.is_optional !== true;

        return {
          type,
          prefixes,
          name,
          docString,
          isRequired,
          ...(param as AtomicParameterNode).atomic,
        } as AtomicConfigNode;
    }
  }

  getComponentConfig(componentName: string, mode: ComputeMode): ConfigItem | undefined {
    return this.root[mode].children.find(
      ({ name }: Pick<ConfigItem, 'name'>) => name === componentName,
    );
  }
}
