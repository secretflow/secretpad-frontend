import { EditOutlined } from '@ant-design/icons';
import { Form, InputNumber, Table } from 'antd';
import type { GetRef, InputNumberRef } from 'antd';
import React, { useContext, useEffect, useRef, useState } from 'react';

import { useModel } from '@/util/valtio-helper';

import { LinearModelParamsModificationsRenderView } from '..';
import styles from '../index.less';
import type { ParametersDatum } from '../types';

const MIN_FLOAT32 = -3.4e38;
const MAX_FLOAT32 = 3.4e38;

type FormInstance<T> = GetRef<typeof Form<T>>;

const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface EditableRowProps {
  index: number;
}

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: keyof ParametersDatum;
  record: ParametersDatum;
  handleSave: (record: ParametersDatum) => void;
}

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

const EditableCell: React.FC<EditableCellProps> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<InputNumberRef>(null);
  const form = useContext(EditableContext)!;

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();

      toggleEdit();

      // 假如值没有变，不用触发 handleSave
      if (values[dataIndex] === record[dataIndex]) {
        return;
      }

      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.warn('Out of float32 range!', errInfo);

      toggleEdit();
      handleSave({ ...record, ...errInfo.values });
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} 为 float32 类型且必填`,
          },
        ]}
      >
        <InputNumber
          controls={false}
          style={{ minWidth: 120 }}
          ref={inputRef}
          onPressEnter={save}
          onBlur={save}
          min={MIN_FLOAT32}
          max={MAX_FLOAT32}
        />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingRight: 24 }}
        onClick={toggleEdit}
      >
        {children}
        <EditOutlined style={{ marginLeft: 8 }} onClick={toggleEdit} />
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

const components = {
  body: {
    row: EditableRow,
    cell: EditableCell,
  },
};

const defaultColumns = [
  {
    title: 'feature',
    key: 'featureName',
    dataIndex: 'featureName',
  },
  {
    title: '所属节点',
    key: 'party',
    dataIndex: 'party',
  },
  {
    title: 'weight',
    key: 'featureWeight',
    dataIndex: 'featureWeight',
    editable: true,
  },
];

export const LinearModelParametersTable = () => {
  const { parametersData, setParametersData, record, disabled } = useModel(
    LinearModelParamsModificationsRenderView,
  );

  const [dataSource, setDataSource] = useState<ParametersDatum[]>([]);

  useEffect(() => {
    setDataSource(parametersData?.featureWeights || []);
  }, [parametersData]);

  const handleSave = (row: ParametersDatum) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setDataSource(newData);
    setParametersData({
      ...parametersData!,
      featureWeights: newData,
    });
    record({
      ...parametersData!,
      featureWeights: newData,
    });
  };

  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: ParametersDatum) => ({
        record,
        editable: disabled ? false : col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });

  return (
    <div className={styles.binningTable}>
      <Table
        bordered
        columns={columns}
        components={components}
        dataSource={dataSource}
      />
    </div>
  );
};
