import { PlusCircleFilled, DeleteOutlined } from '@ant-design/icons';
import { useDeepCompareEffect } from 'ahooks';
import { Button, Divider, Form, Input, Select, Switch } from 'antd';
import { parse } from 'query-string';
import { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'umi';

import type { AtomicConfigNode } from '@/modules/component-config/component-config-protocol';
import { getGraphNodeOutput } from '@/services/secretpad/GraphController';
import {
  getProject,
  getProjectAllOutTable,
  getProjectDatatable,
} from '@/services/secretpad/ProjectController';

import type { IDataTable, IOutputDataTable } from '../types';

import styles from './index.less';

const valueTypeOptions = [
  { value: 'COLUMN', label: '列' },
  { value: 'CONST', label: '常量' },
];
const opOptions = [
  {
    value: 'EQ',
    label: '==',
  },
  {
    value: 'NE',
    label: '!=',
  },

  { value: 'LT', label: '<' },
  { value: 'GT', label: '>' },
  { value: 'LE', label: '<=' },
  { value: 'GE', label: '>=' },
];

export const caseWhenSerializer = (val, clsName) => {
  const name = 'custom_value';
  const cw = val;
  const { whens, else_value, output_column, as_label, float_epsilon } = cw || {};
  if (whens && whens.length > 0) {
    const convertedWhens = whens.map((w) => {
      const connections = [];
      const { conds, when, then } = w;
      const convertedConds = [when];
      conds?.forEach((cond) => {
        const { connection, ...rest } = cond;
        if (connection) connections.push(connection);
        if (rest) convertedConds.push(rest);
      });

      return { conds: convertedConds, then, connections };
    });

    const ret = { custom_protobuf_cls: clsName };
    ret[name] = {
      whens: convertedWhens,
      else_value,
      output_column,
      as_label,
      float_epsilon,
    };

    return ret;
  }
  return { ...{ custom_value: cw }, custom_protobuf_cls: clsName };
};

export const caseWhenUnserializer = (val?) => {
  const name = 'custom_value';
  if (!val || !val[name])
    return {
      whens: [
        {
          then: { type: 'CONST_FLOAT' },
          when: { cond_value: { type: 'CONST_FLOAT' }, op: 'EQ' },
        },
      ],
      else_value: { type: 'CONST_FLOAT', value: undefined },
      output_column: undefined,
      as_label: false,
      float_epsilon: 10e-7,
    };

  const value = val[name];
  const { whens, ...rest } = value;

  const convertedWhens = whens.map((w) => {
    const { connections, conds, then } = w;
    let when;

    if (conds && conds.length > 0) {
      when = conds[0];
      conds.shift();
    }

    if (connections && connections.length > 0) {
      connections.forEach((connection, index) => {
        if (conds[index]) conds[index].connection = connection;
      });
    }

    return when ? { when, conds, then } : { conds, then };
  });
  return { whens: convertedWhens, ...rest };
};

export const CaseWhenRender = (prop: { node: AtomicConfigNode }) => {
  const { node, upstreamTables = [] } = prop;

  const [tables, setTables] = useState<IDataTable[]>([]);
  const [outputTables, setOutputTables] = useState<IOutputDataTable[]>([]);
  const [columns, setColumns] = useState<{ label: string; value: string }[]>([]);
  const [columnInfo, setColumnInfo] = useState<{ colName: string; colType: string }[]>(
    [],
  );
  const { search } = useLocation();
  const { projectId, dagId } = parse(search) as { projectId: string; dagId: string };

  useDeepCompareEffect(() => {
    const getTables = async () => {
      const dataTableList: IDataTable[] = [];

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

  const { name } = node;

  const fromInputIndex = 0;

  const fromTable = useMemo(() => {
    if (fromInputIndex !== undefined && upstreamTables[fromInputIndex]) {
      const tableName = upstreamTables[fromInputIndex];

      return outputTables.find(({ datatableName }) => datatableName === tableName);
    }
  }, [fromInputIndex, upstreamTables, outputTables]);

  useEffect(() => {
    const getColumns = async (tableList) => {
      const tableInfos: { colName: string; colType: string }[] = [];
      // const tableColInfos: { colName: string; colType: string }[] = [];
      await Promise.all(
        tableList.map(async (s) => {
          if (!s) return;
          const { datatableId, nodeId, graphNodeId } = s;
          const tableFields: { colName: string; colType: string }[] = [];
          // const tableColInfo: { colName: string; colType: string }[] = [];
          if (!nodeId && graphNodeId) {
            const { data } = await getGraphNodeOutput({
              projectId,
              graphId: dagId,
              graphNodeId,
              outputId: datatableId,
            });

            if (data?.meta?.rows?.length) {
              data.meta.rows.forEach(
                ({ fieldTypes, fields }: { fieldTypes: string; fields: string }) => {
                  if (fieldTypes && fields) {
                    const fieldList = fields.split(',');
                    const fieldTypeList = fieldTypes.split(',');
                    tableFields.push(
                      ...fieldList.map((f, i) => ({
                        colName: f,
                        colType: fieldTypeList[i],
                      })),
                    );

                    // tableFields.push(...fieldList);
                  }
                },
              );
            }
          } else {
            const { data } = await getProjectDatatable({
              datatableId,
              nodeId,
              projectId,
              type: 'CSV',
            });
            if (!data) return;
            const { configs } = data;

            configs.map((c) => {
              tableFields.push({ colName: c.colName, colType: c.colType });
            });

            // tableFields.push(...colsName);
          }

          // tableColInfos.push(...tableColInfo);
          tableInfos.push(...tableFields);
        }),
      );

      return tableInfos;
    };

    const getTotalCols = async () => {
      const fromTableCols = await getColumns([fromTable]);
      if (fromTableCols.length < 1) {
        const inputTableCols = await getColumns(tables);

        setColumns(
          inputTableCols.map((option: { colName: string; colType: string }) => ({
            value: option.colName,
            label: option.colName,
          })),
        );
        setColumnInfo(inputTableCols);
        return;
      }
      setColumns(
        fromTableCols.map((option: { colName: string; colType: string }) => ({
          value: option.colName,
          label: option.colName,
        })),
      );
      setColumnInfo(fromTableCols);
      return;
    };

    getTotalCols();
  }, [fromTable, tables, upstreamTables]);

  return (
    <Form.Item name={name} noStyle>
      <Form.List name={[name, 'whens']} initialValue={[{}]}>
        {(fields, { add, remove }, { errors }) => (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div className={styles.font}>Case</div>{' '}
              <div>
                <Button
                  icon={<PlusCircleFilled className={styles.icon} />}
                  type="link"
                  onClick={() => {
                    add();
                  }}
                  size={'small'}
                />
              </div>
            </div>
            {fields.map((field, index) => {
              return (
                <div key={field.key}>
                  <div className={styles.row}>
                    <Form.Item
                      {...field}
                      label={<span className={styles.font}>WHEN</span>}
                      name={[field.name, 'when', 'cond_column']}
                      style={{ width: '65%' }}
                      labelCol={{ span: 9 }}
                      colon={false}
                      rules={[
                        {
                          required: true,
                          message: '',
                        },
                      ]}
                    >
                      <Select
                        options={columns}
                        placeholder={'列名'}
                        showSearch
                        optionFilterProp="children"
                        filterOption={(
                          input: string,
                          option?: { label: string; value: string },
                        ) =>
                          (option?.label ?? '')
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                      />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      name={[field.name, 'when', 'op']}
                      initialValue={'EQ'}
                      noStyle
                    >
                      <Select options={opOptions} />
                    </Form.Item>
                    <Button
                      icon={<DeleteOutlined className={styles.icon} />}
                      type="link"
                      onClick={() => remove(field.name)}
                      size={'small'}
                      disabled={fields.length === 1}
                    />
                  </div>
                  <div className={styles.row}>
                    <Form.Item
                      noStyle
                      dependencies={[
                        [name, 'whens', field.name, 'when', 'cond_column'],
                      ]}
                    >
                      {({ getFieldValue }) => {
                        const col = getFieldValue([
                          name,
                          'whens',
                          field.name,
                          'when',
                          'cond_column',
                        ]);

                        const { colType } =
                          columnInfo.find(({ colName }) => colName === col) || {};
                        let valType = 'CONST_STR';
                        if (colType) {
                          if (colType.toLowerCase().includes('int'))
                            valType = 'CONST_INT';

                          if (colType.toLowerCase().includes('float'))
                            valType = 'CONST_FLOAT';
                        }

                        return (
                          <Form.Item
                            {...field}
                            name={[field.name, 'when', 'cond_value', 'type']}
                            style={{ width: '26%' }}
                            preserve={false}
                          >
                            <ValueTypeSelectWithoutType type={valType} />
                          </Form.Item>
                        );
                      }}
                    </Form.Item>
                    <Form.Item
                      noStyle
                      dependencies={[
                        [name, 'whens', field.name, 'when', 'cond_value', 'type'],
                        [name, 'whens', field.name, 'when', 'cond_column'],
                      ]}
                    >
                      {({ getFieldValue }) => {
                        const type = getFieldValue([
                          name,
                          'whens',
                          field.name,
                          'when',
                          'cond_value',
                          'type',
                        ]);
                        const col = getFieldValue([
                          name,
                          'whens',
                          field.name,
                          'when',
                          'cond_column',
                        ]);

                        const { colType } =
                          columnInfo.find(({ colName }) => colName === col) || {};
                        let valType = 'CONST_STR';
                        if (colType) {
                          if (colType.toLowerCase().includes('int'))
                            valType = 'CONST_INT';

                          if (colType.toLowerCase().includes('float'))
                            valType = 'CONST_FLOAT';
                        }
                        return (
                          <ValueInput
                            namePrefix={[field.name, 'when', 'cond_value']}
                            type={type === 'COLUMN' ? 'COLUMN' : valType}
                            cols={columns}
                            required={true}
                            {...field}
                          />
                        );
                      }}
                    </Form.Item>
                  </div>
                  <Form.List name={[field.name, 'conds']}>
                    {(subFields, subOpt, { errors }) => {
                      const { add: addCond, remove: removeCond } = subOpt;
                      return (
                        <>
                          {/* <Form.ErrorList errors={errors} /> */}
                          {subFields.map((sub) => (
                            <div key={sub.key}>
                              <div className={styles.row}>
                                <Form.Item
                                  {...field}
                                  name={[sub.name, 'connection']}
                                  initialValue={'AND'}
                                  noStyle
                                >
                                  <Select
                                    options={[
                                      { value: 'AND', label: 'AND' },
                                      { value: 'OR', label: 'OR' },
                                    ]}
                                    style={{ width: '30%' }}
                                  />
                                </Form.Item>
                                <Form.Item
                                  {...field}
                                  name={[sub.name, 'cond_column']}
                                  noStyle
                                >
                                  <Select
                                    options={columns}
                                    style={{ width: '30%' }}
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(
                                      input: string,
                                      option?: { label: string; value: string },
                                    ) =>
                                      (option?.label ?? '')
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                    }
                                  />
                                </Form.Item>

                                <Form.Item
                                  {...field}
                                  name={[sub.name, 'op']}
                                  validateTrigger={['onChange', 'onBlur']}
                                  initialValue={'EQ'}
                                  noStyle
                                >
                                  <Select
                                    options={opOptions}
                                    style={{ width: '30%' }}
                                  />
                                </Form.Item>
                                <DeleteOutlined
                                  onClick={() => removeCond(sub.name)}
                                  className={styles.icon}
                                />
                              </div>

                              <div className={styles.row}>
                                <Form.Item
                                  noStyle
                                  dependencies={[
                                    [
                                      name,
                                      'whens',
                                      field.name,
                                      'conds',
                                      sub.name,
                                      'cond_column',
                                    ],
                                  ]}
                                >
                                  {({ getFieldValue }) => {
                                    const col = getFieldValue([
                                      name,
                                      'whens',
                                      field.name,
                                      'conds',
                                      sub.name,
                                      'cond_column',
                                    ]);

                                    const { colType } =
                                      columnInfo.find(
                                        ({ colName }) => colName === col,
                                      ) || {};
                                    let valType = 'CONST_STR';
                                    if (colType) {
                                      if (colType.toLowerCase().includes('int'))
                                        valType = 'CONST_INT';

                                      if (colType.toLowerCase().includes('float'))
                                        valType = 'CONST_FLOAT';
                                    }

                                    return (
                                      <Form.Item
                                        {...field}
                                        name={[sub.name, 'cond_value', 'type']}
                                        style={{ width: '26%' }}
                                        preserve={false}
                                      >
                                        <ValueTypeSelectWithoutType type={valType} />
                                      </Form.Item>
                                    );
                                  }}
                                </Form.Item>

                                <Form.Item
                                  noStyle
                                  dependencies={[
                                    [
                                      name,
                                      'whens',
                                      field.name,
                                      'conds',
                                      sub.name,
                                      'cond_column',
                                    ],
                                    [
                                      name,
                                      'whens',
                                      field.name,
                                      'conds',
                                      sub.name,
                                      'cond_value',
                                      'type',
                                    ],
                                  ]}
                                >
                                  {({ getFieldValue }) => {
                                    const type = getFieldValue([
                                      name,
                                      'whens',
                                      field.name,
                                      'conds',
                                      sub.name,
                                      'cond_value',
                                      'type',
                                    ]);
                                    const col = getFieldValue([
                                      name,
                                      'whens',
                                      field.name,
                                      'conds',
                                      sub.name,
                                      'cond_column',
                                    ]);

                                    const { colType } =
                                      columnInfo.find(
                                        ({ colName }) => colName === col,
                                      ) || {};
                                    let valType = 'CONST_STR';
                                    if (colType) {
                                      if (colType.toLowerCase().includes('int'))
                                        valType = 'CONST_INT';

                                      if (colType.toLowerCase().includes('float'))
                                        valType = 'CONST_FLOAT';
                                    }
                                    return (
                                      <ValueInput
                                        namePrefix={[sub.name, 'cond_value']}
                                        type={type === 'COLUMN' ? 'COLUMN' : valType}
                                        cols={columns}
                                        required={true}
                                        {...field}
                                      />
                                    );
                                  }}
                                </Form.Item>
                              </div>
                            </div>
                          ))}
                          <Button
                            type="link"
                            onClick={() => addCond()}
                            size={'small'}
                            style={{ padding: 0, marginBottom: 8 }}
                          >
                            添加条件{' '}
                          </Button>
                        </>
                      );
                    }}
                  </Form.List>

                  <div>
                    {/* <div className={styles.font}>THEN</div> */}
                    <Form.Item
                      {...field}
                      label={<span className={styles.font}>THEN</span>}
                      required
                      style={{ marginBottom: -8 }}
                    />
                    <div className={styles.row}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'then', 'type']}
                        initialValue={'CONST_FLOAT'}
                      >
                        <ValueTypeSelect />
                      </Form.Item>

                      <Form.Item noStyle shouldUpdate>
                        {({ getFieldValue }) => {
                          const type = getFieldValue([
                            name,
                            'whens',
                            field.name,
                            'then',
                            'type',
                          ]);

                          return (
                            <ValueInput
                              namePrefix={[field.name, 'then']}
                              type={type}
                              cols={columns}
                              required={true}
                              {...field}
                            />
                          );
                        }}
                      </Form.Item>
                    </div>
                    <Divider style={{ margin: '16px 0' }} />
                  </div>
                </div>
              );
            })}
          </>
        )}
      </Form.List>
      <div className={styles.font}>ELSE</div>

      <div className={styles.row}>
        <Form.Item
          noStyle
          name={[name, 'else_value', 'type']}
          initialValue={'CONST_FLOAT'}
        >
          <ValueTypeSelect />
        </Form.Item>

        <Form.Item noStyle shouldUpdate>
          {({ getFieldValue }) => {
            const type = getFieldValue([name, 'else_value', 'type']);
            return (
              <ValueInput
                namePrefix={[name, 'else_value']}
                type={type}
                cols={columns}
                required={false}
              />
            );
          }}
        </Form.Item>
      </div>
      <Form.Item
        label={<span className={styles.font}>END AS</span>}
        name={[name, 'output_column']}
        rules={[{ required: true, message: '请输入列名' }]}
      >
        <Input
          style={{ width: '100%' }}
          placeholder="输入列名，可新增特征也可覆盖原有特征"
        />
      </Form.Item>

      <Form.Item
        label={<span className={styles.font}>float epsilon</span>}
        tooltip={
          '在相等判断中，如果两个float的差距小于epsilon，就认为这两个float是相等的'
        }
        name={[name, 'float_epsilon']}
        initialValue={10e-7}
        rules={[
          {
            pattern: /^[0-9]+(.([0-9]*))?$/, ///^[0-9]+.{0,1}[0-9]*$/,
            message: '请输入数字',
          },
        ]}
      >
        <Input style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        label={<span className={styles.font}>输出为标签列</span>}
        name={[name, 'as_label']}
        initialValue={false}
        valuePropName="checked"
        labelCol={{ span: 20 }}
        colon={false}
        wrapperCol={{ span: 4 }}
      >
        <Switch />
      </Form.Item>
    </Form.Item>
  );
};

const ValueTypeSelect = (props: {
  value?: string;
  onChange?: (value: string) => void;
}) => {
  const { value, onChange } = props;
  const [selected, setSelected] = useState<string>();

  const constOptions = [
    { label: 'float', value: 'CONST_FLOAT' },
    {
      label: 'int',
      value: 'CONST_INT',
    },
    { label: 'str', value: 'CONST_STR' },
  ];

  const triggerChange = (changedVal: string) => {
    onChange?.(changedVal);
  };

  return value === 'COLUMN' || selected === 'COLUMN' ? (
    <Select
      options={valueTypeOptions}
      value={value}
      onChange={(val: string) => {
        if (val === 'CONST') {
          setSelected('CONST_FLOAT');
          triggerChange('CONST_FLOAT');
        }
      }}
    />
  ) : (
    <div style={{ display: 'flex', width: '55%' }}>
      <Select
        options={valueTypeOptions}
        value={'CONST'}
        onChange={(val: string) => {
          if (val === 'COLUMN') {
            setSelected(val);
            triggerChange(val);
          }
        }}
      />
      <Select
        options={constOptions}
        value={value}
        onChange={(val: string) => {
          setSelected(val);
          triggerChange(val);
        }}
      />
    </div>
  );
};

const ValueTypeSelectWithoutType = (props: {
  value?: string;
  onChange?: (value: string) => void;
  type: string;
}) => {
  const { value, onChange, type } = props;
  const [selected, setSelected] = useState<string>('CONST');

  const triggerChange = (changedVal: string) => {
    onChange?.(changedVal);
  };
  useEffect(() => {
    if (value !== 'COLUMN') {
      triggerChange(type);
      setSelected('CONST');
    } else {
      setSelected(value);
    }
  }, [type, value]);

  return (
    <Select
      options={valueTypeOptions}
      value={selected === 'COLUMN' ? 'COLUMN' : 'CONST'}
      onChange={(val: string) => {
        if (val === 'COLUMN') {
          setSelected(val);
          triggerChange(val);
        } else {
          setSelected(type);
          triggerChange(type);
        }
      }}
    />
  );
};

const ValueInput = (prop: {
  namePrefix: (string | number)[];
  type: string;
  cols: { value: string; label: string }[];
  required: boolean;
}) => {
  const { namePrefix, type, cols, required = false, ...field } = prop;
  const map = {
    CONST_FLOAT: 'f',
    CONST_INT: 'i',
    CONST_STR: 's',
    COLUMN: 'column_name',
  };

  return type !== 'COLUMN' ? (
    <Form.Item
      {...field}
      name={[...namePrefix, map[type]]}
      rules={[
        {
          required: required,
          message: '',
        },
        {
          pattern: type !== 'CONST_STR' ? /^(-|\+)?\d+(\.\d+)?$/ : undefined,
          message: '请输入数字',
        },
      ]}
      style={{ width: '71%' }}
      preserve={false}
    >
      <Input key={type + namePrefix.join('-')} placeholder={'请填写常量'} />
    </Form.Item>
  ) : (
    <Form.Item
      {...field}
      name={[...namePrefix, map[type]]}
      rules={[{ required: required, message: '' }]}
      style={{ width: '71%' }}
      preserve={false}
    >
      <Select
        options={cols}
        placeholder={'请选择'}
        showSearch
        optionFilterProp="children"
        filterOption={(input: string, option?: { label: string; value: string }) =>
          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
      />
    </Form.Item>
  );
};
