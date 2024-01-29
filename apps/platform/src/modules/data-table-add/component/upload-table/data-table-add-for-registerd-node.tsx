/** DEPRECATED */
/** Data table will be added by dragging */
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Space,
  Button,
  Input,
  Descriptions,
  Upload,
  Select,
  Divider,
  message,
  Alert,
  Checkbox,
  Form,
  Typography,
} from 'antd';
import { useEffect, useRef, useState } from 'react';
import { CSVLink } from 'react-csv';

import { NodeService } from '@/modules/node';
import {
  createDataByDataSource,
  listDataSource,
} from '@/services/secretpad/DataController';
import { getModel, useModel } from '@/util/valtio-helper';

import styles from './index.less';
import { UploadTableView, schemaTypeList } from './upload-table.view';
import { analysisCsv } from './util';

const { Link } = Typography;

const downloadData = [
  { 特征名称: 'id1', 特征类型: 'string', 特征描述: '' },
  { 特征名称: 'x1', 特征类型: 'integer', 特征描述: '描述' },
  { 特征名称: 'x2', 特征类型: 'integer', 特征描述: '' },
  { 特征名称: 'x3', 特征类型: 'integer', 特征描述: '' },
  { 特征名称: 'x4', 特征类型: 'float', 特征描述: '' },
  { 特征名称: 'x5', 特征类型: 'float', 特征描述: '' },
  { 特征名称: 'x6', 特征类型: 'float', 特征描述: '' },
  { 特征名称: 'x7', 特征类型: 'float', 特征描述: '' },
  { 特征名称: 'x8', 特征类型: 'float', 特征描述: '' },
  { 特征名称: 'x9', 特征类型: 'float', 特征描述: '' },
  { 特征名称: 'x10', 特征类型: 'float', 特征描述: '' },
];
export const AddDataTableForRegisteredNode = () => {
  const csvRef = useRef<{
    link: HTMLLinkElement;
  }>(null);

  const triggerDownload = () => {
    if (csvRef.current) {
      csvRef.current.link.click();
    }
  };
  const [form] = Form.useForm();

  const viewInstance = useModel(UploadTableViewByDataSource);
  viewInstance.formInstance = form;

  const [dataSources, setDataSources] = useState<{ name: string; path: string }[]>([]);
  const [pathPrefix, setPathPrefix] = useState<string>('');
  const [dataSourceOptions, setDataSourceOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const selectedDataSource = Form.useWatch('datasourceId', form);

  useEffect(() => {
    const src = dataSources.find(({ name }) => name === selectedDataSource);
    if (src) {
      setPathPrefix(src.path);
    }
  }, [selectedDataSource, dataSources]);

  useEffect(() => {
    const getDataSource = async () => {
      const { status, data } = await listDataSource();
      if (status?.code === 0 && data) {
        setDataSources(data as { name: string; path: string }[]);

        const sourceOptions = data.map((dataSource) => {
          const { name } = dataSource as { name: string; path: string };
          if (name === 'default-data-source') {
            return { value: name, label: '默认数据源' };
          } else {
            return { value: name, label: name };
          }
        });

        setDataSourceOptions(sourceOptions);
      }
    };

    getDataSource();
  }, []);
  return (
    <>
      <Form
        form={form}
        layout="vertical"
        requiredMark="optional"
        className={styles.manualColInfo}
      >
        <Form.Item
          name="name"
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
        <Form.Item name="description" label={'描述'} required={false}>
          <Input.TextArea placeholder="请输入" showCount maxLength={200} rows={4} />
        </Form.Item>

        <div className={styles.dataSourceContainer}>
          <Descriptions title="" column={2}>
            <Descriptions.Item label="所属数据源">
              <Form.Item
                name="datasourceId"
                required
                initialValue={'default-data-source'}
                noStyle
              >
                <Select options={dataSourceOptions} size={'small'} />
              </Form.Item>
            </Descriptions.Item>
            <Descriptions.Item label="数据源类型">节点本地数据</Descriptions.Item>
          </Descriptions>
        </div>
        <Form.Item
          name="tablePath"
          label={'数据路径'}
          required
          rules={[{ required: true, message: '请输入数据表路径' }]}
        >
          <Input placeholder="请输入" addonBefore={pathPrefix} />
        </Form.Item>

        <div style={{ display: 'flex' }}>
          <div style={{ flex: 1 }}>
            <Space>
              <span style={{ fontWeight: 600 }}>数据表结构</span>
              <Link onClick={triggerDownload}>样例文件下载</Link>
              <CSVLink filename="示例文件.csv" data={downloadData} ref={csvRef} />
            </Space>
          </div>

          <span>
            <Upload
              name="file"
              accept=".csv"
              showUploadList={false}
              beforeUpload={async (file, fileList) =>
                viewInstance.handleColCsvUpload(file, fileList)
              }
              customRequest={() => {
                return;
              }}
            >
              <a style={{ color: '#1677ff' }}>上传数据表结构</a>
            </Upload>
          </span>
        </div>

        {viewInstance.schemaErrors.length > 0 && (
          <div style={{ padding: '5px 0' }}>
            <Alert
              message={
                viewInstance.schemaErrors.length === 1 &&
                viewInstance.schemaErrors[0].errors[0] === '请添加特征' ? (
                  <div style={{ display: 'flex' }}>
                    {viewInstance.schemaErrors[0].errors[0]}
                  </div>
                ) : (
                  <div style={{ display: 'flex' }}>
                    <span style={{ flex: 1 }}>
                      其中有
                      {viewInstance.schemaErrors.length}
                      个字段错误，请检查
                    </span>
                    <span>
                      <Checkbox
                        checked={viewInstance.showErrorSchemas}
                        onChange={(e) =>
                          (viewInstance.showErrorSchemas = e.target.checked)
                        }
                      >
                        仅看错误
                      </Checkbox>
                    </span>
                  </div>
                )
              }
              type="error"
              showIcon
            />
          </div>
        )}

        <div className={styles.descriptionHeader}>
          <Descriptions
            column={3}
            style={{
              background: '#fafafa',
              fontWeight: 600,
              height: 45,
            }}
          >
            <Descriptions.Item style={{ width: 140 }}>特征名称</Descriptions.Item>
            <Descriptions.Item style={{ width: 100 }}>
              <Divider type="vertical" />
              类型
            </Descriptions.Item>
            <Descriptions.Item>
              <Divider type="vertical" />
              描述（可选）
            </Descriptions.Item>
          </Descriptions>
        </div>
        <Form.List
          name="datatableSchema"
          rules={[
            {
              validator: async (_, datatableSchema) => {
                if (!datatableSchema || datatableSchema.length < 1) {
                  return Promise.reject(new Error('请添加特征'));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          {(fields, { add, remove }) => (
            <>
              <Form.Item>
                <div
                  style={{
                    padding: '8px 0',
                    background: 'rgba(0,0,0,.02)',
                    borderTop: '1px solid rgba(0,0,0,.03)',
                  }}
                >
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    style={{ width: '100%' }}
                    icon={<PlusOutlined />}
                  >
                    添加特征
                  </Button>
                </div>
              </Form.Item>
              {fields.map(({ key, name, ...restField }, index) => {
                let display = 'flex';
                // 如果有错误，并且勾选了仅看错误项
                if (
                  viewInstance.schemaErrors.length > 0 &&
                  viewInstance.showErrorSchemas
                ) {
                  if (viewInstance.schemaErrors.find((i: any) => i.name[1] == index)) {
                    display = 'flex';
                  } else {
                    display = 'none';
                  }
                }
                return (
                  <Space
                    key={key}
                    align="baseline"
                    size="middle"
                    style={{
                      display,
                      marginBottom: 8,
                      padding: '0 15px',
                    }}
                  >
                    <Form.Item
                      {...restField}
                      name={[name, 'featureName']}
                      validateTrigger="onBlur"
                      rules={[
                        { required: true, message: '请输入特征名称' },
                        {
                          max: 64,
                          message:
                            '特征名称长度限制64字符,请缩短特征名,需要同步修改本地数据文件schema',
                        },
                        {
                          pattern: /^([a-zA-Z0-9-_]*)$/,
                          message: '名称可由英文/数字/下划线/中划线组成',
                        },
                        {
                          validator: (rule, value) => {
                            const values = form.getFieldValue('datatableSchema');
                            const features = values.filter(
                              (i: any) => i?.featureName === value,
                            );
                            if (features.length > 1) return Promise.reject();
                            return Promise.resolve();
                          },
                          message: '存在重复特征',
                        },
                      ]}
                    >
                      <Input placeholder="请输入" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'featureType']}
                      rules={[{ required: true, message: '请选择特征类型' }]}
                    >
                      <Select style={{ width: 94 }} placeholder="请选择">
                        {schemaTypeList.map(
                          (item: { value: string; label: string }) => (
                            <Select.Option key={item.value} value={item.value}>
                              {item.label}
                            </Select.Option>
                          ),
                        )}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'featureDescription']}
                      rules={[{ max: 200, message: '描述长度限制200字符' }]}
                      initialValue={''}
                    >
                      <Input placeholder="请输入" style={{ width: 200 }} />
                    </Form.Item>

                    <DeleteOutlined
                      className={styles.deleteIcon}
                      onClick={() => remove(name)}
                    />
                  </Space>
                );
              })}
            </>
          )}
        </Form.List>
      </Form>
    </>
  );
};
export class UploadTableViewByDataSource extends UploadTableView {
  step = 0;
  csvInfo = [];
  uploadStatus: 'RESET' | 'UPLOADING' | 'DONE' | 'FAILED' = 'RESET';
  submitting = false;

  schemaErrors: { errors: string[]; name: string[] }[] = [];

  showErrorSchemas = false;

  fileUploadAborted = false;

  nodeService = getModel(NodeService);

  initColConfigForm = (
    schema: { featureName: string; featureType: string; featureDescription: string }[],
  ) => {
    this.formInstance?.setFieldValue('datatableSchema', schema);

    // setFieldValue后的值不能被form立刻监听到
    setTimeout(() => {
      this.validateForm();
    }, 0);
  };

  handleColCsvUpload = async (file: File, fileList: File[]) => {
    this.formInstance?.resetFields(['datatableSchema']);
    try {
      const csvData = await analysisCsv(file);
      const {
        meta: { fields },
        data,
      } = csvData;
      const checkResult = this.checkColCsvFormat(fields);
      if (!checkResult) {
        message.error('请检查CSV格式');
        return;
      }
      const cols = data
        .map((info: any) => {
          return {
            featureName: info['特征名称'],
            featureType:
              schemaTypeList.find((i) => i.label === info['特征类型'])?.value ||
              'float',
            featureDescription: info['特征描述'],
          };
        })
        .filter((i) => i.featureName);
      this.initColConfigForm(cols);
    } catch (e) {
      console.log(e);
      message.error('请检查CSV格式');
    }
  };

  onFinishedFailed = (e) => {
    const { errorFields } = e;
    const schemaError = errorFields.filter((i: any) => i.name[0] === 'datatableSchema');
    this.schemaErrors = schemaError;
  };

  submit = async () => {
    try {
      this.submitting = true;
      await this.formInstance?.validateFields();

      const { status } = await createDataByDataSource({
        ...this.formInstance?.getFieldsValue(),
        nodeId: this.nodeService.currentNode?.nodeId,
      });

      this.submitting = false;

      if (status?.code === 0) {
        message.success('上传成功');
      } else {
        message.error(status?.msg || '上传失败');
      }
    } catch (e) {
      this.submitting = false;
      this.onFinishedFailed(e);
      throw e;
    }
  };

  reset = () => {
    this.fileInfo = undefined;
    this.csvInfo = [];
    this.formInstance?.resetFields();
    this.formInstance?.setFieldValue('datatableSchema', []);
    this.schemaErrors = [];
  };
}
