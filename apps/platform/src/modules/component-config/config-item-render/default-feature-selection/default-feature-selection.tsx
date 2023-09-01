import { Form } from 'antd';
import { parse } from 'query-string';
import { useEffect, useState } from 'react';

import { getProject } from '@/services/secretpad/ProjectController';

import type { AtomicConfigNode } from '../../component-config-protocol';
import styles from '../../index.less';
import type { RenderProp } from '../config-render-protocol';

import { MultiTableFeatureSelection } from './table-feature-selection';

interface IDataTable {
  datatableId: string;
  datatableName: string;
  label: string;
  value: string | string[];
  nodeId: string;
}

export const DefaultMultiTableFeatureSelection: React.FC<RenderProp<string>> = (
  config,
) => {
  const { node, defaultVal, translation, upstreamTables = [], disabled } = config;
  const [tables, setTables] = useState<IDataTable[]>([]);

  useEffect(() => {
    const getTables = async () => {
      const dataTableList: IDataTable[] = [];
      const { search } = window.location;
      const { projectId } = parse(search) as { projectId: string };

      const { data } = await getProject({ projectId });
      if (!data) return;

      const { nodes } = data;
      if (!nodes) return;

      nodes.map((_node) => {
        const { datatables } = _node;
        if (!datatables) return;
        datatables.map((table) =>
          dataTableList.push({
            ...table,
            nodeId: _node?.nodeId,
          } as IDataTable),
        );
      });

      setTables(
        dataTableList.filter(
          ({ datatableId }) => (upstreamTables as string[]).indexOf(datatableId) > -1,
        ),
      );
    };

    getTables();
  }, [upstreamTables]);

  return (
    <Form.Item
      label={
        <div className={styles.configItemLabel}>
          {translation[node.name] || node.name}
        </div>
      }
      name={
        node.prefixes && node.prefixes.length > 0
          ? node.prefixes.join('/') + '/' + node.name
          : node.name
      }
      tooltip={translation[node.docString] || node.docString}
      messageVariables={{ label: translation[node.name] || node.name }}
      rules={[
        {
          required: (node as AtomicConfigNode).isRequired,
        },
        {
          validator: async (_, value) => {
            // it's required
            if (node.is_optional !== true && node.col_min_cnt_inclusive !== 0) {
              if (
                value?.filter((val: string | undefined | null) => {
                  if (val === null || val === undefined) {
                    return false;
                  }
                  return true;
                }).length <= 0
              ) {
                throw new Error('请选择特征');
              }
            }
          },
        },
      ]}
      initialValue={defaultVal}
      colon={false}
    >
      <MultiTableFeatureSelection
        tableKeys={tables}
        size={'small'}
        disabled={disabled}
      />
    </Form.Item>
  );
};
