import { Modal, Alert } from 'antd';
import { intersection } from 'lodash';
import { parse } from 'query-string';
import React, { useState, useEffect } from 'react';
import { useLocation } from 'umi';

import { getProjectDatatable } from '@/services/secretpad/ProjectController';

import { FieldBlock } from './fields-block';
import style from './index.less';
import { TableSelector } from './table-selector';
import type { FieldInfoType, TableInfoType } from './type';

export const MultiFieldSelectModal = (props: IProps) => {
  const {
    visible,
    hideModal,
    submit,
    tableInfos,
    multiple,
    fields,
    disabled,
    outputTableInfos,
    fromTableInfo,
    rules,
  } = props;
  const [selectedTable, setSelectedTable] = useState<TableInfoType | undefined>();
  const [selectedFields, setSelectedFields] = useState<FieldInfoType[]>([]);
  const [selectedTables, setSelectedTables] = useState<TableInfoType[] | undefined>();
  const [showWarn, setShowWarn] = useState(false);
  const [showError, setShowError] = useState<undefined | string>(undefined);
  const { search } = useLocation();
  const { projectId } = parse(search) as { projectId: string };

  useEffect(() => {
    if (!visible) return;
    const getFields = async () => {
      if (fields.length > 0) {
        setSelectedFields(fields);
      } else {
        if (selectedTable) {
          const { data } = await getProjectDatatable({
            nodeId: selectedTable.nodeId,
            datatableId: selectedTable.datatableId,
            projectId,
            type: 'CSV',
          });
          if (!data) return;
          setSelectedFields(data.configs);
        }
      }
    };
    getFields();
  }, [fields, selectedTable, visible, projectId]);

  useEffect(() => {
    if (!visible) return;
    const getFields = async () => {
      if (fields.length > 0) {
        setSelectedFields(fields);
      } else {
        const configs: FieldInfoType[] = [];
        selectedTables?.forEach(async (table) => {
          const { data } = await getProjectDatatable({
            nodeId: table.nodeId,
            datatableId: table.datatableId,
            projectId,
            type: 'CSV',
          });
          if (!data) return;
          configs.push(data.configs);
        });
        setSelectedFields(configs);
      }
    };
    getFields();
  }, [fields, projectId, selectedTables, visible]);

  useEffect(() => {
    if (multiple) {
      setSelectedTables(fromTableInfo ? [fromTableInfo, ...tableInfos] : tableInfos);
    } else {
      setSelectedTable(
        fromTableInfo || Array.isArray(tableInfos) ? tableInfos[0] : tableInfos,
      );
    }
  }, [tableInfos, multiple]);

  useEffect(() => {
    // validate selected features
    if (!rules) return;
    setShowError(undefined);
    const { max, min, excludes } = rules;
    if (selectedFields.length < min) setShowError(`请至少选择${min}列`);
    if (max && selectedFields.length > max) setShowError(`至多选择${max}列`);
    if (
      excludes &&
      intersection(
        excludes,
        selectedFields.map(({ colName }) => colName),
      ).length > 0
    )
      setShowError(`${excludes.join(',')}列不可选择`);
  }, [selectedFields]);

  const onSubmit = () => {
    setShowWarn(false);
    if (submit)
      submit(selectedFields.map(({ colName }: { colName: string }) => colName));
    hideModal();
  };

  return (
    <Modal
      okText="保存"
      cancelText="取消"
      title="设置字段"
      open={visible}
      width={800}
      maskClosable={false}
      okButtonProps={{ disabled: disabled || showError !== undefined }}
      onOk={onSubmit}
      onCancel={hideModal}
      className={style.selectModal}
      destroyOnClose
    >
      {showWarn && (
        <Alert
          message="点击确定后立即生效，同在组件配置立即确定"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          closable
        />
      )}
      <TableSelector
        tableInfos={tableInfos}
        selectedTable={selectedTable}
        setSelectedTable={setSelectedTable}
        multiple={props.multiple}
        selectedTables={selectedTables}
        outputTableInfos={outputTableInfos}
        setSelectedTables={(tables) => {
          setShowWarn(true);
          setSelectedTables(tables);
        }}
      />
      {showError && (
        <Alert
          message={showError}
          type={'error'}
          showIcon
          closable={false}
          style={{ marginTop: 8 }}
        />
      )}
      <FieldBlock
        schema={multiple ? selectedTables : selectedTable}
        selectedFields={selectedFields}
        setSelectedFields={setSelectedFields}
        disabled={disabled}
        rules={rules}
      />
    </Modal>
  );
};

export interface IProps {
  tableInfos: TableInfoType[];
  outputTableInfos?: TableInfoType[];
  fromTableInfo?: TableInfoType;
  visible: boolean;
  fields: Record<'colName', string>[];
  submit: ((values: string[]) => void) | undefined;
  hideModal: () => void;
  warnInfo?: string;
  dataType?: string;
  multiple?: boolean;
  disabled?: boolean;
  rules?: { max?: number; min: number; excludes?: string[] };
}
