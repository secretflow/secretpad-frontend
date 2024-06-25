import { PaperClipOutlined } from '@ant-design/icons';
import { InboxOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd';
import { Typography } from 'antd';
import { Alert, Checkbox, message } from 'antd';
import { Descriptions, Form, Input, Select, Space, Upload } from 'antd';
import React, { useRef, useEffect } from 'react';
import { CSVLink } from 'react-csv';

import { NodeService } from '@/modules/node';
import { createData } from '@/services/secretpad/DataController';
import { getModel, Model, useModel } from '@/util/valtio-helper';

import styles from './index.less';
import UploadTableFileList from './upload-list';
import type { FileInfo } from './upload-list';
import { analysisCsv, fetchProgress, parseDataTableColumns } from './util';

interface IProps {
  setDisabled: (val: boolean) => void;
}

const { Dragger } = Upload;
const { Link } = Typography;

export const schemaTypeList = [
  { value: 'int', label: 'integer' },
  { value: 'float', label: 'float' },
  { value: 'str', label: 'string' },
];

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

export const UploadTable: React.FC<IProps> = ({ setDisabled }) => {
  const [form] = Form.useForm();
  const values = Form.useWatch([], form);

  useEffect(() => {
    if (values?.tbl_name && values?.schema?.length !== 0) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [values]);

  const viewInstance = useModel(UploadTableView);
  const nodeService = useModel(NodeService);

  viewInstance.formInstance = form;
  const csvRef = useRef<{
    link: HTMLLinkElement;
  }>(null);

  const triggerDownload = () => {
    if (csvRef.current) {
      csvRef.current.link.click();
    }
  };

  return (
    <div className={styles.uploadContent}>
      {
        //   数据表上传
      }

      {viewInstance.step === 0 && (
        <div className={styles.uploadDraggerWrapper}>
          <div className={styles.uploadDragger}>
            <Dragger
              name="file"
              accept=".csv"
              withCredentials
              action="/api/v1alpha1/data/upload"
              data={{
                'Node-Id': nodeService.currentNode?.nodeId || '',
              }}
              headers={{
                'Node-Id': nodeService.currentNode?.nodeId || '',
                'User-Token': localStorage.getItem('User-Token') || '',
              }}
              showUploadList={false}
              beforeUpload={async (file, fileList) => {
                viewInstance.fileUploadAborted = false;
                return viewInstance.beforeUpload(file, fileList);
              }}
              onChange={(a) => viewInstance.uploadingHandler(a)}
              maxCount={1}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className={styles.tip1}>点击或拖拽「数据文件」到这里</p>
              <p className={styles.tip2}>支持csv格式</p>
            </Dragger>
            {viewInstance.fileInfo && (
              <UploadTableFileList
                fileInfo={viewInstance.fileInfo}
                onRetry={() => viewInstance.retryUpload()}
                onClose={() => {
                  viewInstance.fileUploadAborted = true;
                  viewInstance.fileInfo = undefined;
                }}
              />
            )}
          </div>
        </div>
      )}

      {
        //   编辑数据表结构
      }

      {viewInstance.step === 1 && (
        <div className={styles.csvConfig}>
          <div className={styles.csvConfigBaseInfo}>
            <Descriptions title="" column={2}>
              <Descriptions.Item span={2} label="数据文件" className={styles.label}>
                <div className={styles.csvName}>
                  <PaperClipOutlined />
                  <span style={{ padding: '0 5px' }}>
                    {viewInstance.fileInfo?.name}
                  </span>
                  <Upload
                    name="file"
                    accept=".csv"
                    withCredentials
                    action="/api/v1alpha1/data/upload"
                    data={{
                      'Node-Id': nodeService.currentNode?.nodeId || '',
                    }}
                    headers={{
                      'Node-Id': nodeService.currentNode?.nodeId || '',
                      'User-Token': localStorage.getItem('User-Token') || '',
                    }}
                    showUploadList={false}
                    beforeUpload={async (file, fileList) => {
                      viewInstance.fileUploadAborted = false;
                      return viewInstance.beforeUpload(file, fileList);
                    }}
                    onChange={(a) => {
                      viewInstance.uploadingHandler(a);
                    }}
                    maxCount={1}
                  >
                    <a style={{ padding: '0 5px' }}>重新上传</a>
                  </Upload>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="所属数据源">本地数据源</Descriptions.Item>
              <Descriptions.Item label="数据源类型">节点本地数据</Descriptions.Item>
            </Descriptions>
          </div>
          <div className={styles.csvContentConfig}>
            <Form form={form} layout="vertical" autoComplete="off">
              <Form.Item
                name="tbl_name"
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
              <Form.Item
                name="tbl_desc"
                label={
                  <>
                    描述<span className={styles.description}>（可选）</span>
                  </>
                }
              >
                <Input.TextArea
                  placeholder="请输入"
                  showCount
                  maxLength={200}
                  rows={4}
                />
              </Form.Item>

              <div className={styles.tableColsTitle}>
                <span style={{ flex: 1, fontWeight: 600 }}>数据表结构</span>
                <span style={{ color: 'rgba(0,0,0,.4)' }}>
                  数据量级大，修改低效？试试
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
                    <a>上传数据表结构</a>
                  </Upload>
                  <Link onClick={triggerDownload}>「样例文件下载」</Link>
                  <CSVLink filename="示例文件.csv" data={downloadData} ref={csvRef} />
                </span>
              </div>
              {viewInstance.schemaErrors.length > 0 && (
                <div style={{ padding: '5px 0' }}>
                  <Alert
                    message={
                      <div style={{ display: 'flex' }}>
                        <span style={{ flex: 1 }}>
                          上传了{viewInstance.csvInfo.length}个字段，其中有
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
                    }
                    type="error"
                    showIcon
                  />
                </div>
              )}
              <Descriptions
                className={styles.tableHeader}
                column={3}
                style={{ background: '#fafafa' }}
              >
                <Descriptions.Item style={{ width: 190 }}>特征名称</Descriptions.Item>
                <Descriptions.Item style={{ width: 100 }}>类型</Descriptions.Item>
                <Descriptions.Item>描述（可选）</Descriptions.Item>
              </Descriptions>
              <Form.List name="schema">
                {(fields) => (
                  <>
                    {fields.map(({ key, name, ...restField }, index) => {
                      let display = 'flex';
                      // 如果有错误，并且勾选了仅看错误项
                      if (
                        viewInstance.schemaErrors.length > 0 &&
                        viewInstance.showErrorSchemas
                      ) {
                        if (
                          viewInstance.schemaErrors.find((i: any) => i.name[1] == index)
                        ) {
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
                            marginTop: 8,
                            marginBottom: 8,
                            padding: '0 15px',
                            borderBottom: '1px solid #f0f0f0',
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
                                  const values = form.getFieldValue('schema');
                                  const features = values.filter(
                                    (i: any) => i.featureName === value,
                                  );
                                  if (features.length > 1) return Promise.reject();
                                  return Promise.resolve();
                                },
                                message: '存在重复特征',
                              },
                            ]}
                          >
                            <Input
                              placeholder="请输入"
                              style={{ fontSize: 12, height: 32 }}
                            />
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
                          >
                            <Input
                              placeholder="请输入"
                              style={{ width: 300, fontSize: 12, height: 32 }}
                            />
                          </Form.Item>
                        </Space>
                      );
                    })}
                  </>
                )}
              </Form.List>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
};

interface CSVInfo {
  col: string;
  type: string;
  comment?: string;
}

export class UploadTableView extends Model {
  step = 0;

  fileInfo?: FileInfo;

  csvInfo: CSVInfo[] = [];

  uploadingFile?: File;

  uploadStatus: 'RESET' | 'UPLOADING' | 'DONE' | 'FAILED' = 'RESET';

  submitting = false;

  fileMeta?: { name: string; datasource: string; realName?: string };

  schemaErrors: any = [];

  showErrorSchemas = false;

  fileUploadAborted = false;

  formInstance?: FormInstance;

  nodeService = getModel(NodeService);

  onViewUnMount = () => {
    this.step = 0;
  };

  checkFileNameHasSpace = (fileName: string) => {
    const hasSpace = /\s/.test(fileName);
    return hasSpace;
  };

  initColConfigForm = (schema: any) => {
    this.formInstance?.setFieldValue('schema', schema);
    // setFieldValue后的值不能被form立刻监听到
    setTimeout(() => {
      this.validateForm();
    }, 0);
  };

  beforeUpload = async (file: File, fileList: File[]) => {
    if (this.checkFileNameHasSpace(file.name)) {
      message.error('文件解析错误, 不支持文件名包含空格');
      return false;
    }

    this.uploadingFile = file;
    this.fileInfo = {
      name: file.name,
      status: 'Processing',
      info: '文件解析中',
    };
    const { status, data } = await this.checkCSV(file, fileList);
    if (status === 0) {
      this.fileInfo = {
        name: file.name,
        status: 'Processing',
        info: '文件解析完成,开始上传',
      };
      this.initColConfigForm(
        data?.map((info) => ({
          featureName: info.col,
          featureType: info.type,
          featureDescription: '',
        })),
      );
      this.uploadStatus = 'RESET';
    } else {
      this.fileInfo = undefined;
      message.error('文件解析错误, 请检查后重新上传');
      this.uploadStatus = 'RESET';
      return false;
    }
    return status === 0;
  };

  uploadingHandler = (e: any) => {
    const { file } = e;
    if (this.checkFileNameHasSpace(file.name)) {
      return;
    }
    const { response } = file;
    if (this.fileUploadAborted) return;

    if (file.status === 'done') {
      if (response.status.code !== 0) {
        this.fileInfo = {
          name: file.name,
          percent: 100,
          status: 'Error',
          info: response.status.msg,
        };
      } else {
        // 上传成功，进行特征列配置
        this.step = 1;

        this.fileInfo = {
          name: file.name,
          percent: 100,
          status: 'Success',
          realName: response.data.realName,
        };
        this.fileMeta = {
          name: file.name,
          datasource: response.datasource,
          realName: response.data.realName,
        };
      }
    } else if (file.status === 'uploading') {
      this.uploadStatus = 'UPLOADING';
      this.fileInfo = {
        name: file.name,
        percent: file.percent,
        status: 'Processing',
      };
    } else {
      this.fileInfo = {
        name: file.name,
        percent: 100,
        status: 'Error',
        info: response?.status?.msg || '',
      };
    }
  };

  retryUpload = () => {
    // this.reset();
    const formData = new FormData();
    formData.append('Node-Id', this.nodeService.currentNode?.nodeId || '');
    formData.append('file', this.uploadingFile as Blob);
    fetchProgress(
      '/api/v1alpha1/data/upload',
      {
        method: 'POST',
        body: formData,
        mode: 'cors',
        credentials: 'include',
        headers: {
          'User-Token': localStorage.getItem('User-Token') || '',
        },
      },
      (e: any) => {
        this.fileInfo = {
          name: this.fileInfo?.name,
          status: 'Processing',
          percent: Math.ceil((e.loaded / e.total) * 100),
        };
      },
    )
      .then((response) => {
        if (response.status.code === 0) {
          this.fileMeta = {
            name: this.fileInfo?.name || '',
            datasource: response.data.datasource,
            realName: response.data.realName,
          };
          this.fileInfo = {
            name: this.fileInfo?.name,
            percent: 100,
            status: 'Success',
            realName: response.data.realName,
          };
          this.step = 1;
        } else {
          this.fileInfo = {
            name: this.fileInfo?.name,
            percent: 100,
            status: 'Error',
            info: response.status.msg,
          };
        }
      })
      .catch(() => {
        this.fileInfo = {
          name: this.fileInfo?.name,
          percent: 100,
          status: 'Error',
        };
      });
  };

  checkColCsvFormat(ary: any) {
    if (ary.length !== 3) {
      return false;
    }
    for (const item of ary) {
      if (!['特征名称', '特征类型', '特征描述'].includes(item) && item) {
        return false;
      }
    }
    return true;
  }

  handleColCsvUpload = async (file: File, fileList: File[]) => {
    this.formInstance?.resetFields(['schema']);
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

  checkCSV = async (file: File, fileList: File[]) => {
    try {
      const csvData = await analysisCsv(file, true);
      const csvInfo = parseDataTableColumns(csvData);
      this.csvInfo = csvInfo;
      return {
        status: 0,
        msg: '解析成功',
        data: csvInfo,
      };
    } catch (e) {
      return {
        status: 1,
        msg: '文件解析失败，请检查csv格式是否符合标准',
      };
    }
  };

  async validateForm(): Promise<any> {
    try {
      const validateRes = await this.formInstance?.validateFields();
      return validateRes;
    } catch (e: any) {
      const { errorFields } = e;
      const schemaError = errorFields.filter((i: any) => i.name[0] === 'schema');
      this.schemaErrors = schemaError;
      throw e;
    }
  }

  async submit() {
    try {
      this.submitting = true;
      const validateRes = await this.validateForm();
      const values = validateRes;

      const res = await createData({
        nodeId: this.nodeService.currentNode?.nodeId || '',
        name: this.fileInfo?.name,
        tableName: values.tbl_name,
        description: values.tbl_desc,
        datatableSchema: values.schema,
        realName: this.fileInfo?.realName,
        datasourceType: 'LOCAL',
        datasourceName: 'default-data-source',
      });

      this.submitting = false;
      if (res.status?.code === 0) {
        message.success('添加成功');
      } else {
        message.error(res.status?.msg || '添加失败');
        throw new Error('保存失败');
      }
    } catch (e) {
      this.submitting = false;
      throw e;
    }
  }

  reset = () => {
    this.fileInfo = undefined;
    this.csvInfo = [];
    // this.step = 0;
    this.formInstance?.resetFields();
    this.schemaErrors = [];
  };
}
