// import { debounce } from 'lodash';
import { Alert, Button, Form, Space, Switch } from 'antd';
import type { FormInstance } from 'antd/lib';
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
  CustomConfigNode,
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
import { componentPanelStyleConfigs } from './component-panel-style-registry';
import type { AttrConfig } from './component-panel-style-registry';
import type { NodeAllInfo } from './config-item-render/config-render-protocol';
import { ConfigRenderRegistry } from './config-item-render/config-render-registry';
import { customSerializerRegistry } from './config-item-render/custom-serializer-registry';
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

const hideSaveBtnCustomProtobufClsList = [
  // 分箱修改算子
  'Binning_modifications',
  // 线性模型参数修改算子
  'linear_model_pb2',
];

/** 采样组件：自定义高级配置按钮 */
export const CustomAdvancedBtnForSample = (props: {
  form: FormInstance;
  onChange: (checked: boolean) => void;
  value: boolean;
}) => {
  const { form, onChange, value } = props;
  const sample_algorithm = Form.useWatch('sample_algorithm', form);
  if (['random', 'stratify'].includes(sample_algorithm)) {
    return <AdvanceBtn onChange={onChange} value={value} />;
  } else {
    return <></>;
  }
};

/** 高级配置按钮 基本样式 */
export const AdvanceBtn = ({
  onChange,
  value,
}: {
  onChange: (checked: boolean) => void;
  value: boolean;
}) => {
  return (
    <div style={{ marginBottom: 10 }}>
      <Space>
        <span style={{ fontWeight: 400 }}>高级配置</span>
        <Switch
          size="small"
          value={value}
          style={{ padding: 0, margin: '8px 0' }}
          onChange={onChange}
        />
      </Space>
    </div>
  );
};

export const getAttrPath = (attr: ConfigItem) => {
  return attr.prefixes && attr.prefixes.length > 0
    ? attr.prefixes.join('/') + '/' + attr.name
    : attr.name;
};

interface IConfigFormComponent {
  node: NodeAllInfo;
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
  const [componentConfig, setConfig] = useState<ConfigItem[] | undefined>(undefined);
  const [graphNode, setGraphNode] = useState<GraphNodeDetail>();
  const [isEditable, setIsEditable] = useState(true);
  const [isShowSaveBtn, setIsShowSaveBtn] = useState(true);
  const [translation, setTranslation] = useState({});

  const interpreter = useModel(DefaultComponentInterpreterService);
  const configRegistry = useModel(ComponentConfigRegistry);
  const componentConfigService = useModel(DefaultComponentConfigService);
  const projectEditService = useModel(ProjectEditService);

  const exif = {
    renderKey: codeNameRenderKey[nodeName as keyof typeof codeNameRenderKey],
    upstreamTables:
      nodeName in getUpstreamKey
        ? getUpstreamKey[nodeName as keyof typeof getUpstreamKey](
            upstreamNodes,
            graphNode,
          )
        : graphNode?.inputs?.length
        ? graphNode?.inputs.concat(getInputTables(inputNodes))
        : getInputTables(inputNodes),
  };

  useEffect(() => {
    const fetchConfig = () => {
      const configNode = componentConfigService.getComponentConfig(
        node,
        mode as ComputeMode,
      );
      setConfig(configNode);
    };
    const getTranslation = () => {
      const { version } =
        (configRegistry.getComponentConfig(
          node.name,
          mode as ComputeMode,
        ) as StructConfigNode) || {};

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
  }, [node, nodeId, savedNode, mode, nodeName]);

  useEffect(() => {
    if (pathname !== '/dag') setIsEditable(false);
    if (projectEditService.canEdit.configFormDisabled) {
      setIsEditable(false);
    } else {
      setIsEditable(true);
    }
  }, [pathname, projectEditService.canEdit.configFormDisabled]);

  useEffect(() => {
    /** 1. fetch 组件信息的时候，unserializer 反序列化，转换成表单需要的格式 */
    const fetchGraphNode = async () => {
      const { nodeDef } = graphNode || {};

      const initVal = await initFormVal();

      form.setFieldsValue(getGraphNodeAttrs(initVal.attrPaths, initVal.attrs));

      if (!nodeDef) return;

      const { attrs, attrPaths } = nodeDef;

      if (attrPaths && attrs) form.setFieldsValue(getGraphNodeAttrs(attrPaths, attrs));
    };

    // fetch 组件信息 所需 （2）getGraphNodeAttrs
    const getGraphNodeAttrs = (attrPaths: string[], attrs: Attribute[]) => {
      const ret: Record<string, Attribute> = {};

      attrPaths.forEach((path, index) => {
        const { is_na, custom_protobuf_cls, ...val } = attrs[index];

        // custom proto
        if (custom_protobuf_cls) {
          const attrVal = val;
          const { unserializer } =
            customSerializerRegistry[
              custom_protobuf_cls as keyof typeof customSerializerRegistry
            ];

          ret[path] = unserializer(attrVal);
        } else {
          let attrVal = Object.values(val)[0];

          if (
            codeNameRenderKey[nodeName as keyof typeof codeNameRenderKey] ===
            'UNION_KEY_SELECT'
          )
            if (Array.isArray(attrVal) && attrVal.length === 0) attrVal = [null];
          if (!is_na) ret[path] = attrVal;
        }
      });

      // { output/output_ds: [] }
      return ret;
    };

    fetchGraphNode();
  }, [graphNode, form]);

  // fetch 组件信息 所需 （1）initFormVal
  const initFormVal = async () => {
    const params: { attrPaths: string[]; attrs: Attribute[] } = {
      attrPaths: [],
      attrs: [],
    };

    // serialize the params according to type
    componentConfig?.map((config: ConfigItem) => {
      if (!isStructConfigNode(config)) {
        const name = getAttrPath(config);

        params.attrPaths.push(name);
        const { type } = config;

        if (
          hideSaveBtnCustomProtobufClsList.includes(
            (config as CustomConfigNode).custom_protobuf_cls,
          )
        ) {
          setIsShowSaveBtn(false);
        } else {
          setIsShowSaveBtn(true);
        }

        if (type === 'AT_CUSTOM_PROTOBUF') {
          const typeKey = config['custom_protobuf_cls'];
          const param: Record<string, ValueOf<Attribute>> = {};
          const { unserializer } =
            customSerializerRegistry[typeKey as keyof typeof customSerializerRegistry];

          const initVal = unserializer();

          param[typeKey] = initVal;

          params.attrs.push(param as Attribute);
        } else {
          const param: Record<string, ValueOf<Attribute>> = {};
          // typeKey = ss
          const typeKey = typesMap[type];

          // attrVal = []
          let attrVal: ValueOf<AtomicParameter> | undefined =
            typeKey === 'ss' ? [] : undefined;

          if (config.default_value) attrVal = config.default_value[typeKey];

          // {ss: []}
          param[typeKey] = attrVal;

          // attrs: [{ss: []}]
          params.attrs.push(param as Attribute);
        }
      }
    });

    return params;
  };

  /** 2. 把表单格式，serializer 序列化，转换成 node info */
  const onSaveConfig = async (val: Record<string, ValueOf<Attribute> | undefined>) => {
    /** （1）处理成传给服务端的配置 */
    const params: { attrPaths: string[]; attrs: Attribute[] } = {
      attrPaths: [],
      attrs: [],
    };

    /** （2）校验配置是否完成 */
    // serialize the params according to type
    let isFinished = true;

    const valKeys = Object.keys(val);

    componentConfig?.forEach((config: ConfigItem) => {
      const { type } = config;

      const name = getAttrPath(config);

      if (!valKeys.includes(name)) return;

      params.attrPaths.push(name);

      if (type === 'AT_CUSTOM_PROTOBUF') {
        const { custom_protobuf_cls } = config as unknown as CustomConfigNode;
        const { serializer } =
          customSerializerRegistry[
            custom_protobuf_cls as keyof typeof customSerializerRegistry
          ];
        const formattedVal = serializer(val[name], custom_protobuf_cls);

        params.attrs.push(formattedVal as Attribute);

        isFinished = true;
        return;
      }

      const param: Record<string, ValueOf<Attribute>> = {};
      const typeKey = typesMap[type];

      // 去掉了 attrVal.filter((i) => i)，考虑到值有可能是 boolean 或 0 的情况
      const formedAttrVal =
        typeKey === 'ss' && !Array.isArray(val[name]) ? [val[name]] : val[name];

      param[typeKey] = formedAttrVal as ValueOf<Attribute>;

      let isNA = false;

      if (formedAttrVal === null || formedAttrVal === undefined) {
        isNA = true;
      }

      if (Array.isArray(formedAttrVal) && formedAttrVal.length === 0) {
        isNA = true;
      }

      /**
       * 假如当前配置节点是 isRequired，但是数据为空 isNA，就是未配置状态：isFinished = false
       */
      if ((config as AtomicConfigNode).isRequired && isNA) {
        isFinished = false;
      }

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

  // const handleFormChange = debounce(
  //   (_, allValues: Record<string, ValueOf<Attribute> | undefined>) => {
  //     form.validateFields().then(() => onSaveConfig(allValues));
  //   },
  //   500,
  // );

  const [advancedConfigs, setAdvancedConfigs] = useState<ConfigItem[]>([]);
  const [renderConfigs, setRenderConfigs] = useState<ConfigItem[]>([]);
  const [isShowAdvancedBtn, setIsShowAdvancedBtn] = useState(false);
  const [advancedConfigOpen, setAdvancedConfigOpen] = useState(false);

  const panelStyleConfigs = componentPanelStyleConfigs.getData(mode as ComputeMode);

  const CustomAdvancedBtn =
    panelStyleConfigs[nodeName]?.['extraOptions']?.['getCustomAdvancedBtn']?.();

  /** 设置高级配置按钮显隐 */
  useEffect(() => {
    if (CustomAdvancedBtn) {
      setIsShowAdvancedBtn(false);
    } else {
      if (advancedConfigs.length > 0) {
        setIsShowAdvancedBtn(true);
      } else {
        setIsShowAdvancedBtn(false);
      }
    }
  }, [CustomAdvancedBtn, advancedConfigs]);

  /** 重设配置项顺序、显示、高级配置的关系 */
  useEffect(() => {
    if (componentConfig && panelStyleConfigs[nodeName]?.['attrs']) {
      // 去掉 isShow 为 false 的
      const filteredConfigs = componentConfig.filter((config) => {
        const key = getAttrPath(config);

        const attrConfig = panelStyleConfigs[nodeName]['attrs'][key];
        return attrConfig?.['isShow'] === undefined ? true : attrConfig['isShow'];
      });

      const orderedConfigs = [...filteredConfigs];

      // 给元素重新排序
      for (let i = 0; i < filteredConfigs.length; i++) {
        const config = filteredConfigs[i];
        const key = getAttrPath(config);

        const attrConfig = panelStyleConfigs[nodeName]['attrs'][key];

        if (attrConfig?.['order'] !== undefined) {
          const originalPosition = orderedConfigs.findIndex(
            (cfg) => cfg.name === config.name,
          );

          const newPosition = attrConfig?.['order'];
          // 移除原位置的元素并保存
          const item = orderedConfigs.splice(originalPosition, 1)[0];
          // 在新位置插入被移除的元素
          orderedConfigs.splice(newPosition, 0, item);
        }
      }

      // 过滤掉高级配置
      const commonConfigs = orderedConfigs.filter((config) => {
        const key = getAttrPath(config);
        const attrConfig = panelStyleConfigs[nodeName]['attrs'][key];
        return !(attrConfig?.['isAdvancedConfig'] === undefined
          ? false
          : attrConfig['isAdvancedConfig']);
      });

      // 获取高级配置
      const adConfigs = orderedConfigs.filter((config) => {
        const key = getAttrPath(config);
        const attrConfig = panelStyleConfigs[nodeName]['attrs'][key];
        return attrConfig?.['isAdvancedConfig'] === undefined
          ? false
          : attrConfig['isAdvancedConfig'];
      });

      setAdvancedConfigs(adConfigs);
      setRenderConfigs(commonConfigs);
    } else {
      setRenderConfigs(componentConfig || []);
      setAdvancedConfigs([]);
    }
  }, [componentConfig, nodeName]);

  return (
    <div className={styles.configForm}>
      {renderConfigs && renderConfigs.length > 0 && isEditable && (
        <Alert
          key={'warning'}
          message="修改的内容需要保存才能生效，未保存退出则恢复至上次保存的配置"
          type="warning"
        />
      )}

      {renderConfigs && renderConfigs.length > 0 && (
        <Form
          {...layout}
          form={form}
          labelAlign={'left'}
          onFinish={() => onFormFinished(form.getFieldsValue())}
          disabled={!isEditable}
          // onValuesChange={handleFormChange}
          validateMessages={{ required: '「${label}」是必填字段' }}
          preserve={false}
        >
          {renderConfigs.map((config, index) => {
            const key = getAttrPath(config);
            const attrConfig = panelStyleConfigs[nodeName]?.['attrs']?.[key];

            return (
              <ConfigurationNodeRender
                form={form}
                componentConfig={componentConfig || []}
                config={renderConfigs[index]}
                node={node}
                key={index}
                index={index}
                exif={exif}
                attrConfig={attrConfig}
                translation={translation}
                disabled={!isEditable}
              />
            );
          })}

          {isShowAdvancedBtn ? (
            <AdvanceBtn
              onChange={() => {
                setAdvancedConfigOpen(!advancedConfigOpen);
              }}
              value={advancedConfigOpen}
            />
          ) : null}

          {CustomAdvancedBtn ? (
            <CustomAdvancedBtn
              form={form}
              onChange={() => {
                setAdvancedConfigOpen(!advancedConfigOpen);
              }}
              value={advancedConfigOpen}
            />
          ) : null}

          {advancedConfigs &&
            advancedConfigs.length > 0 &&
            advancedConfigs.map((config, index) => {
              const key = getAttrPath(config);
              const attrConfig = panelStyleConfigs[nodeName]?.['attrs']?.[key];

              return (
                <ConfigurationNodeRender
                  style={{
                    display: advancedConfigOpen ? 'block' : 'none',
                  }}
                  form={form}
                  componentConfig={componentConfig || []}
                  config={advancedConfigs[index]}
                  node={node}
                  key={`advanced-${index}`}
                  index={renderConfigs.length + index}
                  exif={exif}
                  translation={translation}
                  disabled={!isEditable}
                  attrConfig={attrConfig}
                />
              );
            })}

          {isEditable && isShowSaveBtn && (
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

export const ConfigurationNodeRender = ({
  form,
  node,
  config,
  exif,
  index,
  translation,
  style,
  disabled = false,
  componentConfig,
  attrConfig,
}: {
  form: FormInstance;
  config: ConfigItem;
  node: NodeAllInfo;
  exif: Record<string, any>;
  index: number;
  translation: Record<string, string>;
  disabled?: boolean;
  style?: Record<any, any>;
  componentConfig: ConfigItem[];
  attrConfig?: AttrConfig;
}) => {
  const configRenderRegistry = useModel(ConfigRenderRegistry);
  const Render = configRenderRegistry.getRender(config, exif);

  const defaultVal = getDefaultValue(config);
  const { upstreamTables } = exif;

  const [value, setValue] = useState(defaultVal);

  return Render ? (
    <div className={styles.defaultRender} style={{ ...style }}>
      <Render
        form={form}
        value={value}
        defaultVal={defaultVal}
        componentConfig={componentConfig}
        node={config}
        nodeAllInfo={node}
        type={config.type!}
        onChange={(val: ValueOf<Attribute> | undefined | null) => {
          setValue(val);
        }}
        upstreamTables={upstreamTables}
        index={index}
        translation={translation}
        disabled={disabled}
        attrConfig={attrConfig}
      />
    </div>
  ) : (
    <></>
  );
};
