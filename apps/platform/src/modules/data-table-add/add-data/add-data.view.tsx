import {
  Button,
  Descriptions,
  Form,
  Input,
  Select,
  Space,
  message,
  notification,
} from 'antd';
import { Drawer } from 'antd';
import { debounce } from 'lodash';
import { parse } from 'query-string';
import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'umi';

import { AccessWrapper, hasAccess, Platform } from '@/components/platform-wrapper';
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
  const [notificationApi, contextHolder] = notification.useNotification();
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
    nodeNameOptions,
    queryNodeNameList,
    queryOdpsSourceDetail,
  } = addDataSheetService;

  const isAutonomy = hasAccess({ type: [Platform.AUTONOMY] });

  const [form] = Form.useForm();
  const values = Form.useWatch([], form);
  const dataSourceFormValue = Form.useWatch('dataSource', form);
  const dataSourceFormValueType = dataSourceList.find(
    (item) => item.datasourceId === dataSourceFormValue,
  )?.type;
  const { search } = useLocation();
  const { ownerId } = parse(search);

  useEffect(() => {
    const hasNodeIds = isAutonomy ? (values?.nodeIds || []).length !== 0 : true;
    const hasValue =
      dataSourceFormValueType === DataSourceType.ODPS
        ? values?.odpsSheetName && values?.tableName
        : values?.address && values?.tableName;
    if (hasValue && values?.features?.length !== 0 && hasNodeIds) {
      addDataSheetService.submitDisabled = false;
    } else {
      addDataSheetService.submitDisabled = true;
    }
  }, [values]);

  const getDataSourceList = useCallback(async () => {
    await queryDataSourceList(ownerId as string);
  }, [ownerId]);

  useEffect(() => {
    if (visible) {
      getDataSourceList();
      form.setFieldValue('features', [{}]);
    }
  }, [visible]);

  const getOdpsSourceProject = useCallback(async () => {
    await queryOdpsSourceDetail({
      ownerId: ownerId as string,
      datasourceId: dataSourceFormValue,
      type: DataSourceType.ODPS,
    });
  }, [ownerId, dataSourceFormValue]);

  const getNodeNameList = useCallback(async () => {
    await queryNodeNameList(ownerId as string, dataSourceFormValue);
  }, [ownerId, dataSourceFormValue]);

  useEffect(() => {
    if (dataSourceFormValue) {
      if (hasAccess({ type: [Platform.AUTONOMY] })) {
        getNodeNameList();
        const dataSourceType = dataSourceList.find(
          (item) => item.datasourceId === dataSourceFormValue,
        )?.type;
        dataSourceType === DataSourceType.ODPS && getOdpsSourceProject();
      }
    } else {
      addDataSheetService.nodeNameOptions = [];
    }
  }, [dataSourceFormValue]);

  // useEffect(() => {
  //   if (form && dataSourceFormValueType === DataSourceType.OSS) {
  //     form.setFieldValue('tableNullStrs', '""');
  //   }
  // }, [form, dataSourceFormValueType]);

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

    const nullStrs =
      currentDataSource?.type === DataSourceType.OSS ||
      currentDataSource?.type === DataSourceType.ODPS
        ? {
            nullStrs: validateRes.tableNullStrs
              ? JSON.parse(`[${validateRes.tableNullStrs}]`)
              : [],
          }
        : {};

    const formValues = {
      ...validateRes,
      ...nullStrs,
      datasourceName: currentDataSource?.name,
      datasourceType: currentDataSource?.type,
      nodeIds: isAutonomy ? values.nodeIds : [ownerId],
    };
    try {
      addDataSheetService.addDataSheetLoading = true;
      const { status, data } = await addDataSheet(
        formValues,
        currentDataSource?.type as DataSourceType,
      );
      addDataSheetService.addDataSheetLoading = false;
      if (status && status.code === 0) {
        message.success('添加成功');
        // autonomy 模式下，并且是添加oss数据。要展示多节点创建失败的情况
        if (isAutonomy && currentDataSource?.type === DataSourceType.OSS) {
          // 部分节点创建成功
          //  TODO: 部分节点创建
          const errorNodesObj = data?.failedCreatedNodes || {};
          const errorNodeList = Object.keys(errorNodesObj).map((id) => ({
            nodeId: id,
            errorMessage: errorNodesObj[id],
          }));
          if (errorNodeList.length !== 0) {
            notificationApi.info({
              message: '部分节点创建失败',
              duration: null,
              description: (
                <Space direction="vertical">
                  {errorNodeList.map((node) => {
                    return (
                      <Descriptions key={node.nodeId}>
                        <Descriptions.Item label={node.nodeId}>
                          {node.errorMessage}
                        </Descriptions.Item>
                      </Descriptions>
                    );
                  })}
                </Space>
              ),
            });
            return;
          }
        }
        onClose();
      } else {
        message.error(status?.msg || '添加失败');
        onClose();
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
    <>
      {contextHolder}
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
              rules={[{ required: true, message: '请输入ODPS表名' }]}
            >
              <Input
                addonBefore={addDataSheetService.odpsProjectName}
                placeholder="请输入ODPS表名"
              />
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
                <AccessWrapper accessType={{ type: [Platform.AUTONOMY] }}>
                  <Form.Item
                    name="nodeIds"
                    label="所属节点"
                    rules={[{ required: true, message: '请选择所属节点' }]}
                  >
                    <Select
                      placeholder="请选择"
                      options={nodeNameOptions}
                      mode="multiple"
                    />
                  </Form.Item>
                </AccessWrapper>
                {dataSourceFormValueType === DataSourceType.HTTP && (
                  <HttpQueryExample />
                )}
                <Form.Item name="tableDesc" label="描述">
                  <Input.TextArea placeholder="100字符以内" maxLength={100} />
                </Form.Item>

                {dataSourceFormValueType === DataSourceType.OSS ||
                dataSourceFormValueType === DataSourceType.ODPS ? (
                  <Form.Item
                    name="tableNullStrs"
                    tooltip={'不填充则纯空为空字符，默认""为空缺值'}
                    label={<>空缺值</>}
                    initialValue={'""'}
                    rules={[
                      {
                        validator: (_, val) => {
                          try {
                            JSON.parse(`[${val}]`);
                            return Promise.resolve();
                          } catch (error) {
                            return Promise.reject(`空缺值填写错误，请检查`);
                          }
                        },
                      },
                    ]}
                  >
                    <Input.TextArea
                      placeholder={'""（可输入多个，用,隔开，例：",,","-999"）'}
                      rows={2}
                    />
                  </Form.Item>
                ) : null}
                <DataTableStructure />
                {dataSourceFormValueType === DataSourceType.ODPS && <OdpsPartition />}
              </>
            )}
          {dataSourceFormValueType &&
            dataSourceFormValueType === DataSourceType.LOCAL && (
              <UploadTable
                setDisabled={setDisabled}
                nodeNameOptions={nodeNameOptions}
              />
            )}
        </Form>
      </Drawer>
    </>
  );
};
