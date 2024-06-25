import { Button, Form, Input, Select, Space, message } from 'antd';
import { Drawer } from 'antd';
import { debounce } from 'lodash';
import { parse } from 'query-string';
import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'umi';

import { useModel } from '@/util/valtio-helper';

import {
  DataTableStructure,
  DataTableStructureService,
} from '../component/dataTableStructure/data-table-structure.view';
import { HttpQueryExample } from '../component/httpQueryExample';
import { OdpsPartition } from '../component/odpsPartition/odps-partition.view';
import {
  UploadTable,
  UploadTableView,
} from '../component/upload-table/upload-table.view';

import { AddDataSheetService, DataSourceType } from './add-data-service';
import styles from './index.less';

export const DataAddDrawer = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const UploadInstance = useModel(UploadTableView);
  const [disabled, setDisabled] = useState(false);

  const dataTableStructureService = useModel(DataTableStructureService);

  const addDataSheetService = useModel(AddDataSheetService);
  const {
    queryDataSourceList,
    dataSourceList,
    dataSourceOptions,
    addDataSheetLoading,
    addDataSheet,
  } = addDataSheetService;

  const [form] = Form.useForm();
  const values = Form.useWatch([], form);
  const dataSourceFormValue = Form.useWatch('dataSource', form);
  const dataSourceFormValueType = dataSourceList.find(
    (item) => item.datasourceId === dataSourceFormValue,
  )?.type;
  const { search } = useLocation();
  const { nodeId } = parse(search);

  useEffect(() => {
    const hasValue =
      dataSourceFormValueType === DataSourceType.ODPS
        ? values?.odpsSheetName && values?.tableName
        : values?.address && values?.tableName;
    if (hasValue && values?.features?.length !== 0) {
      addDataSheetService.submitDisabled = false;
    } else {
      addDataSheetService.submitDisabled = true;
    }
  }, [values]);

  const getDataSourceList = useCallback(async () => {
    await queryDataSourceList(nodeId as string);
  }, [nodeId]);

  useEffect(() => {
    if (visible) {
      getDataSourceList();
      form.setFieldValue('features', [{}]);
    }
  }, [visible]);

  const handleClose = () => {
    onClose();
    form.resetFields();
    dataTableStructureService.featuresError = [];
  };

  const validateForm = async (options = {}) => {
    try {
      const validateRes = await form.validateFields(options);
      return validateRes;
    } catch (e: any) {
      const { errorFields } = e;
      const featuresError = errorFields.filter((i: any) => i.name[0] === 'features');
      dataTableStructureService.featuresError = featuresError;
      throw e;
    }
  };

  const handleOk = async () => {
    const validateRes = await validateForm();
    dataTableStructureService.featuresError = [];
    const currentDataSource = dataSourceList.find(
      (item) => item.datasourceId === validateRes.dataSource,
    );
    const formValues = {
      ...validateRes,
      datasourceName: currentDataSource?.name,
      datasourceType: currentDataSource?.type,
    };
    try {
      addDataSheetService.addDataSheetLoading = true;
      const { status } = await addDataSheet(
        formValues,
        currentDataSource?.type as DataSourceType,
      );
      addDataSheetService.addDataSheetLoading = false;
      if (status && status.code === 0) {
        message.success('添加成功');
        onClose();
      } else {
        message.error(status?.msg || '添加失败');
      }
    } catch (error) {
      addDataSheetService.addDataSheetLoading = false;
    }
  };

  const handelDataSourceChange = (value: string) => {
    if (dataSourceFormValueType === DataSourceType.LOCAL) {
      UploadInstance.reset();
    }
    dataTableStructureService.featuresError = [];
    dataTableStructureService.showFeatureErrorChecked = false;
    form.resetFields();
    form.setFieldsValue({
      features: [{}],
      dataSource: value,
    });
  };

  return (
    <Drawer
      title="添加数据"
      width={750}
      open={visible}
      onClose={handleClose}
      footer={
        <div className={styles.actions}>
          <Space>
            <Button onClick={handleClose}>取消</Button>
            {dataSourceFormValueType &&
            dataSourceFormValueType === DataSourceType.LOCAL ? (
              <Button
                disabled={UploadInstance.step === 0 || disabled}
                type="primary"
                loading={UploadInstance.submitting}
                onClick={debounce(async () => {
                  try {
                    await UploadInstance.submit();
                    onClose();
                  } catch (e) {
                    return;
                  }
                  UploadInstance.reset();
                }, 1000)}
              >
                提交
              </Button>
            ) : (
              <Button
                disabled={addDataSheetService.submitDisabled}
                type="primary"
                loading={addDataSheetLoading}
                onClick={handleOk}
              >
                确定
              </Button>
            )}
          </Space>
        </div>
      }
    >
      <Form form={form} layout="vertical" autoComplete="off" requiredMark="optional">
        <Form.Item
          name="dataSource"
          label="所属数据源"
          rules={[{ required: true, message: '请输入数据地址' }]}
        >
          <Select
            placeholder="请选择"
            options={dataSourceOptions}
            onChange={handelDataSourceChange}
          />
        </Form.Item>
        {dataSourceFormValueType === DataSourceType.OSS && (
          <Form.Item
            name="address"
            label="数据文件地址"
            rules={[{ required: true, message: '数据文件地址' }]}
          >
            <Input placeholder="请输入文件在OSS上相对预设路径的地址，预设路径随选择的OSS数据源变化" />
          </Form.Item>
        )}
        {dataSourceFormValueType === DataSourceType.HTTP && (
          <Form.Item
            name="address"
            label="HTTP地址"
            rules={[{ required: true, message: '请输入HTTP地址' }]}
          >
            <Input placeholder="请输入" />
          </Form.Item>
        )}
        {dataSourceFormValueType === DataSourceType.ODPS && (
          <Form.Item
            name="odpsSheetName"
            label="输入表名称"
            rules={[{ required: true, message: '请输入HTTP地址' }]}
          >
            <Input addonBefore="alifin_bikey." placeholder="请输入ODPS表名" />
          </Form.Item>
        )}

        {dataSourceFormValueType &&
          dataSourceFormValueType !== DataSourceType.LOCAL && (
            <>
              <Form.Item
                name="tableName"
                label="数据表名称"
                rules={[
                  { required: true, message: '请输入数据表名称' },
                  { max: 32, message: '数据表名称长度限制32字符' },
                  {
                    pattern: /^([a-zA-Z0-9-_\u4e00-\u9fa5]*)$/,
                    message: '名称可由中文/英文/数字/下划线/中划线组成',
                  },
                ]}
              >
                <Input placeholder="名称可由中文/英文/数字/下划线/中划线组成，长度限制32" />
              </Form.Item>
              {dataSourceFormValueType === DataSourceType.HTTP && <HttpQueryExample />}
              <Form.Item name="tableDesc" label="描述">
                <Input.TextArea placeholder="100字符以内" maxLength={100} />
              </Form.Item>
              <DataTableStructure />
              {dataSourceFormValueType === DataSourceType.ODPS && <OdpsPartition />}
            </>
          )}
        {dataSourceFormValueType &&
          dataSourceFormValueType === DataSourceType.LOCAL && (
            <UploadTable setDisabled={setDisabled} />
          )}
      </Form>
    </Drawer>
  );
};
