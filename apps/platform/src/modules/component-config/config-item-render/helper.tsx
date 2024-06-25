import { Form, type FormInstance } from 'antd';

import type { ConfigItem, ConfigType } from '../component-config-protocol';

interface IParams {
  prefixes?: string[];
  componentConfig: ConfigItem[];
  component: React.ReactNode;
  form?: FormInstance;
  type: ConfigType;
  name?: string;
}

export const getComponentByRenderStrategy = (params: IParams) => {
  const { prefixes, componentConfig, component, form, type, name } = params;

  const parentName = prefixes?.[prefixes.length - 1];
  const parentType = componentConfig.find(
    (config: ConfigItem) => config.name === parentName,
  )?.type;

  const grandParentName = prefixes?.[prefixes.length - 2];
  const grandParentType = componentConfig.find(
    (config: ConfigItem) => config.name === grandParentName,
  )?.type;

  const dependency = Form.useWatch(prefixes?.join('/'), form);

  const _prefixes = [...(prefixes || [])];
  _prefixes?.pop();
  const grandDependency = Form.useWatch(_prefixes?.join('/'), form);

  /** 节点没有 prefixes，直接渲染 */
  if (!prefixes?.length) {
    return component;
  }

  /** 节点本身的类型是 struct，不渲染 */
  if (type === 'AT_STRUCT_GROUP') {
    return <></>;
  }

  /**
   * 该节点的父节点是 union，自己没有类型/struct，不渲染
   * 否则，那就根据那个父节点的 value 渲染
   */

  if (parentType === 'AT_UNION_GROUP' && (!type || type === 'AT_STRUCT_GROUP')) {
    return <></>;
  } else if (parentType === 'AT_UNION_GROUP') {
    return dependency === name ? component : <></>;
  }

  /**
   * 节点有 prefixes，就要根据 prefixes 的内容，按需联动 = 隐藏/展示
   * 假如说该节点的父节点的父节点是 union，那就根据那个父节点的 value 渲染
   */

  if (grandParentType === 'AT_UNION_GROUP') {
    if (grandDependency === prefixes?.[prefixes?.length - 1]) {
      return component;
    }

    return <></>;
  }

  return component;
};
