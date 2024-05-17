import { NodeStatus } from '@secretflow/dag';
import { Emitter } from '@secretflow/utils';
import { message } from 'antd';

import {
  listComponents,
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

    const list = specMpcList?.filter((node) => node.name !== 'ss_pvalue');
    // list.push({
    //   domain: 'data_prep',
    //   name: 'psi',
    //   desc: 'PSI between two parties.',
    //   version: '0.0.4',
    //   attrs: [
    //     {
    //       name: '求交方式',
    //       desc: '求交方式',
    //       type: 'AT_UNION_GROUP',
    //       union: {
    //         // 默认值
    //         default_selection: 'inner join 不允许关联键重复',
    //       },
    //     },
    //     {
    //       prefixes: ['求交方式'],
    //       name: 'inner join 不允许关联键重复',
    //       desc: 'inner join 不允许关联键重复',
    //       type: 'ATTR_TYPE_UNSPECIFIED', // ？
    //       atomic: {},
    //     },
    //     {
    //       prefixes: ['求交方式'],
    //       name: 'left join 允许关联键重复',
    //       desc: 'left join 允许关联键重复',
    //       // 这样渲染不出 “左表节点” 的 title
    //       // type: 'AT_PARTY',
    //       // atomic: {
    //       //   list_max_length_inclusive: -1,
    //       // },
    //       type: 'AT_UNION_GROUP',
    //       atomic: {},
    //     },
    //     {
    //       prefixes: ['left join 允许关联键重复'],
    //       name: '左表节点',
    //       desc: '左表节点',
    //       // 这样渲染不出 “左表节点” 的 title
    //       type: 'AT_PARTY',
    //       atomic: {
    //         list_max_length_inclusive: -1,
    //       },
    //     },
    //     {
    //       name: 'protocol',
    //       desc: 'PSI protocol.',
    //       type: 'AT_STRING',
    //       atomic: {
    //         is_optional: true,
    //         default_value: {
    //           s: 'PROTOCOL_RR22',
    //         },
    //         allowed_values: {
    //           ss: ['PROTOCOL_RR22', 'PROTOCOL_ECDH', 'PROTOCOL_KKRT'],
    //         },
    //       },
    //     },
    //     {
    //       name: 'disable_alignment',
    //       desc: 'It true, output is not promised to be aligned. Warning: enable this option may lead to errors in the following components. DO NOT TURN ON if you want to append other components.',
    //       type: 'AT_BOOL',
    //       atomic: {
    //         is_optional: true,
    //         default_value: {},
    //       },
    //     },
    //     {
    //       name: 'skip_duplicates_check',
    //       desc: 'If true, the check of duplicated items will be skiped.',
    //       type: 'AT_BOOL',
    //       atomic: {
    //         is_optional: true,
    //         default_value: {},
    //       },
    //     },
    //     {
    //       name: 'check_hash_digest',
    //       desc: 'Check if hash digest of keys from parties are equal to determine whether to early-stop.',
    //       type: 'AT_BOOL',
    //       atomic: {
    //         is_optional: true,
    //         default_value: {},
    //       },
    //     },
    //     {
    //       name: 'left_side',
    //       desc: 'Required if advanced_join_type is selected.',
    //       type: 'AT_PARTY',
    //       atomic: {
    //         list_max_length_inclusive: -1,
    //       },
    //     },
    //     {
    //       name: 'join_type',
    //       desc: 'Advanced Join types allow duplicate keys.',
    //       type: 'AT_STRING',
    //       atomic: {
    //         is_optional: true,
    //         default_value: {
    //           s: 'ADVANCED_JOIN_TYPE_UNSPECIFIED',
    //         },
    //         allowed_values: {
    //           ss: [
    //             'ADVANCED_JOIN_TYPE_UNSPECIFIED',
    //             'ADVANCED_JOIN_TYPE_INNER_JOIN',
    //             'ADVANCED_JOIN_TYPE_LEFT_JOIN',
    //             'ADVANCED_JOIN_TYPE_RIGHT_JOIN',
    //             'ADVANCED_JOIN_TYPE_FULL_JOIN',
    //             'ADVANCED_JOIN_TYPE_DIFFERENCE',
    //           ],
    //         },
    //       },
    //     },
    //     {
    //       name: 'fill_value_int',
    //       desc: 'For int type data. Use this value for filling null.',
    //       type: 'AT_INT',
    //       atomic: {
    //         is_optional: true,
    //         default_value: {},
    //       },
    //     },
    //     {
    //       name: 'ecdh_curve',
    //       desc: 'Curve type for ECDH PSI.',
    //       type: 'AT_STRING',
    //       atomic: {
    //         is_optional: true,
    //         default_value: {
    //           s: 'CURVE_FOURQ',
    //         },
    //         allowed_values: {
    //           ss: ['CURVE_25519', 'CURVE_FOURQ', 'CURVE_SM2', 'CURVE_SECP256K1'],
    //         },
    //       },
    //     },
    //   ],
    //   inputs: [
    //     {
    //       name: 'receiver_input',
    //       desc: 'Individual table for receiver',
    //       types: ['sf.table.individual'],
    //       attrs: [
    //         {
    //           name: 'key',
    //           desc: 'Column(s) used to join.',
    //           col_min_cnt_inclusive: 1,
    //         },
    //       ],
    //     },
    //     {
    //       name: 'sender_input',
    //       desc: 'Individual table for sender',
    //       types: ['sf.table.individual'],
    //       attrs: [
    //         {
    //           name: 'key',
    //           desc: 'Column(s) used to join.',
    //           col_min_cnt_inclusive: 1,
    //         },
    //       ],
    //     },
    //   ],
    //   outputs: [
    //     {
    //       name: 'psi_output',
    //       desc: 'Output vertical table',
    //       types: ['sf.table.vertical_table'],
    //     },
    //   ],
    // });

    list.push({
      domain: 'ml.eval',
      name: 'ss_pvalue',
      desc: 'PSI between two parties.',
      version: '0.0.4',
      inputs: [
        {
          name: 'input1',
          desc: 'The first input table',
          types: ['sf.table.individual', 'sf.table.vertical_table'],
        },
        {
          name: 'input2',
          desc: 'The second input table',
          types: ['sf.table.individual', 'sf.table.vertical_table'],
        },
      ],
      attrs: [
        {
          name: 'union',
          desc: 'union',
          type: 'AT_CUSTOM_PROTOBUF',
          custom_protobuf_cls: 'union',
        },
      ],
      outputs: [
        {
          name: 'output_ds',
          desc: 'Output table',
          types: ['sf.table.individual', 'sf.table.vertical_table'],
        },
      ],
    });

    if (list) {
      list.forEach((componentConfig: Component) => {
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
    const mergedDomainMap: { [key: string]: string } = {
      feature: '特征预处理',
      preprocessing: '特征预处理',
      read_data: '数据准备',
      data_prep: '数据准备',
    };
    const list = this.componentList[mode].reduce<ComponentTreeItem[]>(
      (acc, component) => {
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
          const dir = acc.find(({ key }) =>
            mergedDomainMap[category]
              ? mergedDomainMap[category] === key
              : category === key,
          );
          if (dir) {
            if (!dir.children) dir.children = [];
            dir.children.push(treeItem);
          } else {
            acc.push({
              category: '',
              title: {
                val: mergedDomainMap[category] ? mergedDomainMap[category] : category,
              },
              key: mergedDomainMap[category] ? mergedDomainMap[category] : category,
              isLeaf: false,
              docString: '',
              children: [treeItem],
            });
          }
        } else {
          acc.push(treeItem);
        }

        return acc;
      },
      [],
    );

    const domainOrder = [
      '数据准备',
      'data_filter',
      '特征预处理',
      'stats',
      'ml.train',
      'ml.predict',
      'ml.eval',
    ];

    const childrenOrder: { [key: string]: string[] } = {
      数据准备: ['datatable', 'psi', 'train_test_split'],
      特征预处理: [
        'binary_op',
        'case_when',
        'feature_calculate',
        'fillna',
        'onehot_encode',
        'substitution',
        'vert_binning',
        'vert_woe_binning',
        'vert_bin_substitution',
        'binning_modifications',
      ],
    };

    // Order the components list for better UX
    list.map((domain: ComponentTreeItem) => {
      if (childrenOrder[domain.key] && domain.children) {
        const order = childrenOrder[domain.key];
        domain.children.sort(
          (a, b) => order.indexOf(a.title.val) - order.indexOf(b.title.val),
        );
      }
    });

    list.sort(
      (a, b) => domainOrder.indexOf(a.title.val) - domainOrder.indexOf(b.title.val),
    );

    return list;
  }
}
