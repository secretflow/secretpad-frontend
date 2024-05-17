import { useDeepCompareEffect } from 'ahooks';
import { Form } from 'antd';
import { parse } from 'query-string';
import { useState, useMemo } from 'react';

import {
  getProject,
  getProjectAllOutTable,
} from '@/services/secretpad/ProjectController';

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
interface IOutputDataTable {
  datatableId: string;
  datatableName: string;
  graphNodeId: string;
  nodeId: string;
}

export const DefaultMultiTableFeatureSelection: React.FC<RenderProp<string>> = (
  config,
) => {
  const { node, defaultVal, translation, upstreamTables = [], disabled } = config;
  const { fromInputIndex, prefixes, name, docString } = node;
  const [tables, setTables] = useState<IDataTable[]>([]);
  const [outputTables, setOutputTables] = useState<IOutputDataTable[]>([]);

  useDeepCompareEffect(() => {
    const getTables = async () => {
      const dataTableList: IDataTable[] = [];
      const { search } = window.location;
      const { projectId, dagId } = parse(search) as {
        projectId: string;
        dagId: string;
      };

      const { data } = await getProject({ projectId });
      const { data: outputData } = await getProjectAllOutTable({
        projectId,
        graphId: dagId,
      });

      if (outputData?.nodes) {
        setOutputTables(
          outputData.nodes.reduce<IOutputDataTable[]>(
            (ret, { outputs, graphNodeId }) =>
              outputs && graphNodeId
                ? ret.concat(
                    outputs.map((output) => ({
                      graphNodeId,
                      datatableId: output,
                      datatableName: output,
                      nodeId: '',
                    })),
                  )
                : ret,
            [],
          ),
        );
      }
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

  const fromTable = useMemo(() => {
    if (fromInputIndex !== undefined && upstreamTables[fromInputIndex]) {
      const tableName = upstreamTables[fromInputIndex];

      return outputTables.find(({ datatableName }) => datatableName === tableName);
    }
  }, [fromInputIndex, upstreamTables, outputTables]);

  return (
    <Form.Item
      label={<div className={styles.configItemLabel}>{translation[name] || name}</div>}
      name={prefixes && prefixes.length > 0 ? prefixes.join('/') + '/' + name : name}
      tooltip={translation[docString] || docString}
      messageVariables={{ label: translation[name] || name }}
      rules={[
        {
          required: (node as AtomicConfigNode).isRequired,
        },
        {
          validator: async (_, value) => {
            // it's required
            if (
              node.is_optional !== true &&
              node.col_min_cnt_inclusive &&
              node.col_min_cnt_inclusive !== 0
            ) {
              if (
                value?.filter((val: string | undefined | null) => {
                  if (val === null || val === undefined) {
                    return false;
                  }
                  return true;
                }).length < node.col_min_cnt_inclusive
              ) {
                throw new Error(`请至少选择${node.col_min_cnt_inclusive}个特征`);
              }
            }

            if (node.col_max_cnt_inclusive && node.col_max_cnt_inclusive !== 0) {
              if (
                value?.filter((val: string | undefined | null) => {
                  if (val === null || val === undefined) {
                    return false;
                  }
                  return true;
                }).length > node.col_max_cnt_inclusive
              ) {
                throw new Error(`至多选择${node.col_max_cnt_inclusive}个特征`);
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
        outputTableKeys={outputTables}
        size={'small'}
        fromTableKey={fromTable}
        disabled={disabled}
        rules={{
          min: node.col_min_cnt_inclusive || 0,
          max: node.col_max_cnt_inclusive,
        }}
      />
    </Form.Item>
  );
};
