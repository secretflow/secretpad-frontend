import type { GraphNode } from '@secretflow/dag';
import { Form, Button, Space } from 'antd';
import { debounce } from 'lodash';
import { parse } from 'query-string';
import { useEffect, useState } from 'react';
import { useLocation } from 'umi';

import { ProjectEditService } from '@/modules/layout/header-project-list/project-edit.service';
import { useModel } from '@/util/valtio-helper';

import { DefaultComponentInterpreterService } from '../component-interpreter/component-interpreter-service';
import type {
  AtomicParameter,
  Attribute,
  ComputeMode,
  ValueOf,
} from '../component-tree/component-protocol';

import type {
  AtomicConfigNode,
  ConfigItem,
  GraphNodeDetail,
  NodeDef,
  StructConfigNode,
} from './component-config-protocol';
import {
  getInputTables,
  getUpstreamKey,
  codeNameRenderKey,
} from './component-config-protocol';
import { ComponentConfigRegistry } from './component-config-registry';
import { DefaultComponentConfigService } from './component-config-service';
import { ConfigRenderRegistry } from './config-item-render/config-render-registry';
import styles from './index.less';
import { getDefaultValue, isStructConfigNode, typesMap } from './utils';

const layout = {
  labelCol: {
    span: 24,
  },
  wrapperCol: {
    span: 24,
  },
};

interface IConfigFormComponent {
  node: {
    nodeId: string;
    name: string;
    upstreamNodes: GraphNodeDetail[];
    graphNode: GraphNodeDetail;
    inputNodes: GraphNode[];
  };
  onClose: () => void;
}

export const ConfigFormComponent: React.FC<IConfigFormComponent> = (prop) => {
  const { node, onClose } = prop;
  const {
    name: nodeName,
    nodeId,
    upstreamNodes,
    graphNode: savedNode,
    inputNodes,
  } = node;
  const { pathname, search } = useLocation();
  const { mode } = parse(search);

  const [form] = Form.useForm();
  const [componentConfig, setConfig] = useState<AtomicConfigNode[] | undefined>(
    undefined,
  );
  const [graphNode, setGraphNode] = useState<GraphNodeDetail>();
  const [isEditable, setIsEditable] = useState(true);
  const [translation, setTranslation] = useState({});

  const interpreter = useModel(DefaultComponentInterpreterService);
  const configRegistry = useModel(ComponentConfigRegistry);
  const componentConfigService = useModel(DefaultComponentConfigService);
  const projectEditService = useModel(ProjectEditService);

  useEffect(() => {
    const fetchConfig = () => {
      const configNode = componentConfigService.getComponentConfig(
        node,
        mode as ComputeMode,
      );
      setConfig(configNode);
    };
    const getTranslation = () => {
      const { version } = configRegistry.getComponentConfig(
        node.name,
        mode as ComputeMode,
      ) as StructConfigNode;

      setTranslation(
        interpreter.getComponentTranslationMap(
          `${node.name}:${version}`,
          mode as ComputeMode,
        ) || {},
      );
    };
    getTranslation();
    setGraphNode(savedNode);
    fetchConfig();
  }, [node, nodeId, savedNode, mode]);

  useEffect(() => {
    if (pathname !== '/dag') setIsEditable(false);
    if (projectEditService.canEdit.configFormDisabled) {
      setIsEditable(false);
    } else {
      setIsEditable(true);
    }
  }, [pathname, projectEditService.canEdit.configFormDisabled]);
  useEffect(() => {
    const fetchGraphNode = async () => {
      const { nodeDef } = graphNode || {};

      // init values in form
      const initVal = await initFormVal();
      form.setFieldsValue(getGraphNodeAttrs(initVal.attrPaths, initVal.attrs));

      if (!nodeDef) return;
      const { attrs, attrPaths } = nodeDef;

      if (attrPaths && attrs) form.setFieldsValue(getGraphNodeAttrs(attrPaths, attrs));
    };

    const getGraphNodeAttrs = (attrPaths: string[], attrs: Attribute[]) => {
      const ret: Record<string, Attribute> = {};

      attrPaths.forEach((path, index) => {
        const { is_na, ...val } = attrs[index];

        let attrVal = Object.values(val)[0];

        if (
          codeNameRenderKey[nodeName as keyof typeof codeNameRenderKey] ===
          'UNION_KEY_SELECT'
        )
          if (Array.isArray(attrVal) && attrVal.length === 0) attrVal = [null];
        if (!is_na) ret[path] = attrVal;
      });

      return ret;
    };
    fetchGraphNode();
  }, [graphNode, form]);

  const initFormVal = async () => {
    const params: { attrPaths: string[]; attrs: Attribute[] } = {
      attrPaths: [],
      attrs: [],
    };

    // serialize the params according to type
    componentConfig?.map((node: ConfigItem) => {
      if (!isStructConfigNode(node)) {
        const name =
          node.prefixes && node.prefixes.length > 0
            ? node.prefixes.join('/') + '/' + node.name
            : node.name;

        params.attrPaths.push(name);
        const { type } = node;
        const param: Record<string, ValueOf<Attribute>> = {};
        const typeKey = typesMap[type];

        let attrVal: ValueOf<AtomicParameter> | undefined =
          typeKey === 'ss' ? [] : undefined;

        if (node.default_value) attrVal = node.default_value[typeKey];

        param[typeKey] = attrVal;

        params.attrs.push(param as Attribute);
      }
    });

    return params;
  };

  const onSaveConfig = async (val: Record<string, ValueOf<Attribute> | undefined>) => {
    const params: { attrPaths: string[]; attrs: Attribute[] } = {
      attrPaths: [],
      attrs: [],
    };
    // serialize the params according to type
    let isFinished = true;
    componentConfig?.map((_node) => {
      const name =
        _node.prefixes && _node.prefixes.length > 0
          ? _node.prefixes.join('/') + '/' + _node.name
          : _node.name;

      params.attrPaths.push(name);
      const { type } = _node as AtomicConfigNode;
      const param: Record<string, ValueOf<Attribute>> = {};
      const typeKey = typesMap[type];

      const attrVal =
        typeKey === 'ss' && !Array.isArray(val[name]) ? [val[name]] : val[name];
      const formedAttrVal = Array.isArray(attrVal) ? attrVal.filter((i) => i) : attrVal;
      param[typeKey] = formedAttrVal as ValueOf<Attribute>;
      let isNA = false;
      if (formedAttrVal === null || formedAttrVal === undefined) {
        isNA = true;
      }

      if (Array.isArray(formedAttrVal) && formedAttrVal.length === 0) {
        isNA = true;
      }
      if ((_node as AtomicConfigNode).isRequired && isNA) isFinished = false;

      param['is_na'] = isNA;

      params.attrs.push(param as Attribute);
    });

    const { search } = window.location;
    const { projectId, dagId } = parse(search);
    componentConfigService.saveComponentConfig({
      projectId: projectId as string,
      graphId: dagId as string,
      isFinished,
      node: {
        ...graphNode,
        codeName: nodeName,
        graphNodeId: nodeId,
        nodeDef: {
          ...graphNode?.nodeDef,
          ...params,
        } as NodeDef,
      },
    });
  };

  const onFormFinished = (val: Record<string, ValueOf<Attribute> | undefined>) => {
    onSaveConfig(val);
    // close config drawer
    onClose();
  };

  const handleFormChange = debounce(
    (_, allValues: Record<string, ValueOf<Attribute> | undefined>) => {
      form.validateFields().then(() => onSaveConfig(allValues));
    },
    500,
  );

  const exif = {
    renderKey: codeNameRenderKey[nodeName as keyof typeof codeNameRenderKey],
    upstreamTables:
      nodeName in getUpstreamKey
        ? getUpstreamKey[nodeName as keyof typeof getUpstreamKey](upstreamNodes)
        : getInputTables(inputNodes),
  };

  return (
    <div className={styles.configForm}>
      {/* {componentConfig && componentConfig.length > 0 && isEditable && (
        <Alert
          message="修改的内容需要保存才能生效，未保存退出则恢复至上次保存的配置"
          type="warning"
        />
      )} */}
      {componentConfig && componentConfig.length > 0 && (
        <Form
          {...layout}
          form={form}
          labelAlign={'left'}
          onFinish={() => onFormFinished(form.getFieldsValue())}
          disabled={!isEditable}
          onValuesChange={handleFormChange}
          validateMessages={{ required: '「${label}」是必填字段' }}
        >
          {componentConfig.map((config, index) => {
            return (
              <ConfigurationNodeRender
                node={config}
                key={index}
                index={index}
                exif={exif}
                translation={translation}
                disabled={!isEditable}
              />
            );
          })}

          {isEditable && (
            <div className={styles.footer}>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" size="small">
                    保存配置
                  </Button>
                </Space>
              </Form.Item>
            </div>
          )}
        </Form>
      )}
    </div>
  );
};

export const ConfigurationNodeRender: React.FC<{
  node: AtomicConfigNode;
  exif: Record<string, any>;
  index: number;
  translation: Record<string, string>;
  disabled?: boolean;
}> = ({
  node,
  exif,
  index,
  translation,
  disabled = false,
}: {
  node: AtomicConfigNode;
  exif: Record<string, any>;
  index: number;
  translation: Record<string, string>;
  disabled?: boolean;
}) => {
  const configRenderRegistry = useModel(ConfigRenderRegistry);
  const Render = configRenderRegistry.getRender(node, exif);
  const defaultVal = getDefaultValue(node);
  const { upstreamTables } = exif;

  const [value, setValue] = useState(defaultVal);

  return Render ? (
    <div className={styles.defaultRender}>
      <Render
        value={value}
        defaultVal={defaultVal}
        node={node}
        type={node.type}
        onChange={(val: ValueOf<Attribute> | undefined | null) => {
          setValue(val);
        }}
        upstreamTables={upstreamTables}
        index={index}
        translation={translation}
        disabled={disabled}
      />
    </div>
  ) : (
    <></>
  );
};
