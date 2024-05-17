import { Form, Select, Input } from 'antd';
import { parse } from 'query-string';
import { useState, useEffect } from 'react';
import { useLocation } from 'umi';

import { getProject } from '@/services/secretpad/ProjectController';

import { MultiTableFeatureSelection } from '../config-item-render/default-feature-selection/table-feature-selection';

import styles from './index.less';
import { QuickConfigPSIComponent } from './quick-config-psi';

export const QuickConfigRisk = () => {
  const form = Form.useFormInstance();
  const [tables, setTables] = useState<
    { datatableId: string; nodeName: string; datatableName: string }[]
  >([]);
  const [nodeOptions, setNodeOptions] = useState<
    {
      label: string;
      value: string;
    }[]
  >([]);

  const [selectedTableInfo, setSelectedTableInfo] = useState<
    {
      datatableId: string;
      datatableName: string;
      nodeId: string;
      nodeName: string;
    }[]
  >([]);

  const [tableList, setTableList] = useState<
    (API.ProjectDatatableBaseVO & {
      nodeId: string | undefined;
      nodeName: string | undefined;
    })[]
  >([]);

  const { search } = useLocation();
  const { projectId } = parse(search) as { projectId: string };

  const { s: selectedReceiver } = Form.useWatch('dataTableReceiver', form) || {};
  const { s: selectedSender } = Form.useWatch('dataTableSender', form) || {};

  useEffect(() => {
    const tableSelected = tableList.filter(
      (d) => d.datatableId === selectedReceiver || d.datatableId === selectedSender,
    ) as {
      datatableId: string;
      datatableName: string;
      nodeId: string;
      nodeName: string;
    }[];

    if (tableSelected.length > 1) setSelectedTableInfo(tableSelected);
    if (tableSelected.length > 0) {
      setNodeOptions(
        tableSelected.map((table) => ({
          value: table.nodeId as string,
          label: table.nodeName as string,
        })),
      );
    }
  }, [selectedReceiver, selectedSender, projectId]);

  useEffect(() => {
    const getTables = async () => {
      const dataTableOptions: {
        datatableId: string;
        nodeName: string;
        datatableName: string;
      }[] = [];
      const dataTableList: (API.ProjectDatatableBaseVO & {
        nodeId: string | undefined;
        nodeName: string | undefined;
      })[] = [];
      const { data } = await getProject({ projectId });
      if (!data) return;
      const { nodes } = data;
      if (!nodes) return;

      nodes.map((node) => {
        const { datatables, nodeId, nodeName } = node;
        if (!datatables) return;
        datatables.map((table) => {
          dataTableList.push({ ...table, nodeId, nodeName });
          if (table.datatableId && table.datatableName)
            dataTableOptions.push({
              datatableId: table.datatableId,
              nodeName: nodeName as string,
              datatableName: table.datatableName,
            });
        });
      });

      setTables(dataTableOptions);
      setTableList(dataTableList);
    };

    getTables();
  }, [projectId]);

  return (
    <>
      <QuickConfigPSIComponent
        type="MPC"
        tables={tables}
        tableList={tableList}
        form={form}
      />
      <Form.Item
        name="labelSelects"
        label={<div className={styles.configItemLabel}>选择标签</div>}
        required
        messageVariables={{ msg: '请选择标签列' }}
        rules={[
          {
            required: true,
            message: '${msg}',
            validator: (_, val) => {
              if (!val || val.length === 0) return Promise.reject(new Error('${msg}'));

              return Promise.resolve();
            },
          },
        ]}
        getValueProps={(value) => {
          return { value: value?.ss };
        }}
        getValueFromEvent={(value) => {
          return { ss: value };
        }}
      >
        <MultiTableFeatureSelection
          tableKeys={selectedTableInfo}
          size={'small'}
          rules={{ min: 1, max: 1 }}
        />
      </Form.Item>

      <Form.Item
        name="pred"
        label={<div className={styles.configItemLabel}>预测结果列名</div>}
        required
        messageVariables={{ msg: '请填写预测结果列名' }}
        initialValue={{ s: 'pred' }}
        rules={[
          {
            required: true,
            message: '${msg}',
            validator: (_, val) => {
              if (!val || !val.s) return Promise.reject(new Error('${msg}'));

              return Promise.resolve();
            },
          },
        ]}
        getValueProps={(value) => {
          return { value: value?.s };
        }}
        getValueFromEvent={(e) => {
          return { s: e.target.value };
        }}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="receiver"
        label={<div className={styles.configItemLabel}>结果接收方</div>}
        required
        messageVariables={{ label: '接收方' }}
        valuePropName="value"
        getValueProps={(value) => {
          return { value: value?.ss };
        }}
        tooltip={'逻辑回归预测结果的接收方'}
        getValueFromEvent={(value) => {
          return { ss: [value] };
        }}
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Select options={nodeOptions} />
      </Form.Item>
    </>
  );
};
