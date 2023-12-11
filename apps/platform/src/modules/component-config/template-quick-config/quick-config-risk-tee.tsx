import { Form, Input, Switch } from 'antd';
import { parse } from 'query-string';
import { useState, useEffect } from 'react';
import { useLocation } from 'umi';

import { getProject } from '@/services/secretpad/ProjectController';

import { MultiTableFeatureSelection } from '../config-item-render/default-feature-selection/table-feature-selection';

import styles from './index.less';
import { QuickConfigPSIComponent } from './quick-config-psi';

export const QuickConfigTee = () => {
  const form = Form.useFormInstance();
  const [tables, setTables] = useState<
    { datatableId: string; nodeName: string; datatableName: string }[]
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
      <QuickConfigPSIComponent tables={tables} tableList={tableList} form={form} />

      <Form.Item
        name="featureSelects"
        label={<div className={styles.configItemLabel}>选择特征</div>}
        required
        messageVariables={{ msg: '请选择特征列' }}
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
        <MultiTableFeatureSelection tableKeys={selectedTableInfo} size={'small'} />
      </Form.Item>

      <Form.Item
        name="labelSelect"
        label={<div className={styles.configItemLabel}>选择标签列</div>}
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
          rules={{ max: 1, min: 1 }}
        />
      </Form.Item>

      <Form.Item
        name="trainIdSelect"
        label={<div className={styles.configItemLabel}>选择训练id列</div>}
        messageVariables={{ msg: '请选择训练id列' }}
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
          rules={{ min: 1 }}
        />
      </Form.Item>

      <Form.Item
        name="saveId"
        label={<div className={styles.configItemLabel}>保存Id列</div>}
        valuePropName="checked"
        rootClassName={styles.switchItem}
        tooltip={
          '是否将 id 列保存到输出预测表中；如果为 true，则输入feature_dataset必须包含 id 列'
        }
        wrapperCol={{ span: 4 }}
        labelCol={{ span: 20 }}
      >
        <Switch defaultChecked={false} />
      </Form.Item>

      <Form.Item
        name="predictIdSelect"
        label={<div className={styles.configItemLabel}>选择预测id列</div>}
        messageVariables={{ msg: '请选择预测id列' }}
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
          rules={{ max: 1, min: 0 }}
        />
      </Form.Item>

      <Form.Item
        name="saveLabel"
        label={<div className={styles.configItemLabel}>保存label列</div>}
        valuePropName="checked"
        rootClassName={styles.switchItem}
        wrapperCol={{ span: 4 }}
        labelCol={{ span: 20 }}
        tooltip={
          '是否将真实的标签列保存到输出预测文件中；如果为 true，则输入feature_dataset必须包含标签列'
        }
      >
        <Switch defaultChecked={false} />
      </Form.Item>

      <Form.Item
        name="label"
        label={<div className={styles.configItemLabel}>预测值 标签</div>}
        required
        messageVariables={{ label: '预测值标签' }}
        initialValue={{ ss: ['label'] }}
        getValueProps={(value) => ({ value: value?.ss[0] })}
        getValueFromEvent={(e) => ({ ss: [e.target.value] })}
        tooltip={'标签值列名'}
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Input autoComplete="off" />
      </Form.Item>

      <Form.Item
        name="score"
        label={<div className={styles.configItemLabel}>预测值 预测得分</div>}
        required
        messageVariables={{ label: '预测值预测得分' }}
        tooltip={'预测得分列名'}
        initialValue={{ ss: ['pred'] }}
        getValueProps={(value) => ({ value: value?.ss[0] })}
        getValueFromEvent={(e) => ({ ss: [e.target.value] })}
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Input autoComplete="off" />
      </Form.Item>
    </>
  );
};
