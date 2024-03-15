import {
  DeleteOutlined,
  DownloadOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Checkbox,
  Form,
  Input,
  Select,
  Space,
  Upload,
  message,
} from 'antd';
import { Drawer } from 'antd';
import { parse } from 'query-string';
import { useEffect, useRef } from 'react';
import { CSVLink } from 'react-csv';
import { flushSync } from 'react-dom';

import { createFeatureDatasource } from '@/services/secretpad/FeatureDatasourceController';
import { Model, useModel } from '@/util/valtio-helper';

import { analysisCsv } from '../component/upload-table/util';

import styles from './index.less';

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

export const HttpDataAddDrawer = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const httpDataAddService = useModel(HttpDataAddService);
  const [form] = Form.useForm();
  const values = Form.useWatch([], form);

  useEffect(() => {
    if (values?.address && values?.tableName && values?.features?.length !== 0) {
      httpDataAddService.submitDisabled = false;
    } else {
      httpDataAddService.submitDisabled = true;
    }
  }, [values]);

  const csvRef = useRef<{
    link: HTMLLinkElement;
  }>(null);

  const triggerDownload = () => {
    if (csvRef.current) {
      csvRef.current.link.click();
    }
  };

  const featureTypeOptions = [
    { value: 'int', label: 'integer' },
    { value: 'float', label: 'float' },
    { value: 'str', label: 'string' },
  ];

  useEffect(() => {
    if (visible) {
      form.setFieldValue('features', [{}]);
    }
  }, [visible]);

  const handleClose = () => {
    onClose();
    form.resetFields();
    httpDataAddService.loading = false;
    httpDataAddService.featuresError = [];
  };

  const checkColCsvFormat = (ary: any) => {
    if (ary.length !== 3) {
      return false;
    }
    for (const item of ary) {
      if (!['特征名称', '特征类型', '特征描述'].includes(item) && item) {
        return false;
      }
    }
    return true;
  };

  const handleColCsvUpload = async (file: File, fileList: File[]) => {
    form.resetFields(['features']);
    try {
      const csvData = await analysisCsv(file);
      const {
        meta: { fields },
        data,
      } = csvData;
      const checkResult = checkColCsvFormat(fields);
      if (!checkResult) {
        message.error('请检查CSV格式');
        return;
      }
      const cols = data.map((info: any) => {
        return {
          featureName: info['特征名称'] || undefined,
          featureType:
            featureTypeOptions.find((i) => i.label === info['特征类型'])?.value ||
            undefined,
          featureDescription: info['特征描述'],
        };
      });
      const uniqueFeatures = cols.reduce((acc, cur) => {
        acc[cur.featureName] = acc[cur.featureName] || cur;
        return acc;
      }, {} as Record<string, any>);
      const resultCols = Object.values(uniqueFeatures);
      form.setFieldValue('features', resultCols);
      const repeatLength = cols.length - resultCols.length;
      if (repeatLength !== 0) {
        message.success(
          `上传了${cols.length}个字段, 有${repeatLength}个重复字段已自动去重`,
        );
      } else {
        message.success(`上传了${cols.length}个字段`);
      }
      setTimeout(() => {
        validateForm();
      });
    } catch (e) {
      console.log(e);
      message.error('请检查CSV格式');
      form.setFieldValue('features', [{}]);
    }
  };

  const validateForm = async (options = {}) => {
    try {
      const validateRes = await form.validateFields(options);
      return validateRes;
    } catch (e: any) {
      const { errorFields } = e;
      const featuresError = errorFields.filter((i: any) => i.name[0] === 'features');
      httpDataAddService.featuresError = featuresError;
      throw e;
    }
  };

  const handleOk = async () => {
    const validateRes = await validateForm();
    httpDataAddService.featuresError = [];
    const values = validateRes;
    try {
      httpDataAddService.loading = true;
      const { status } = await httpDataAddService.addHttpData(values);
      httpDataAddService.loading = false;
      if (status && status.code === 0) {
        message.success('添加成功');
        onClose();
      } else {
        message.error(status?.msg || '添加失败');
      }
    } catch (error) {
      httpDataAddService.loading = false;
    }
  };

  const handelFeatureChange = async () => {
    await validateForm({ dirty: true });
    httpDataAddService.featuresError = [];
  };

  return (
    <Drawer
      title="添加数据"
      width={750}
      open={visible}
      onClose={handleClose}
      footer={
        <Space>
          <Button onClick={handleClose}>取消</Button>
          <Button
            disabled={httpDataAddService.submitDisabled}
            type="primary"
            loading={httpDataAddService.loading}
            onClick={handleOk}
          >
            确定
          </Button>
        </Space>
      }
    >
      <div className={styles.titleSheet}>数据表类型：http数据源</div>
      <CSVLink filename="示例文件.csv" data={downloadData} ref={csvRef} />
      <Form form={form} layout="vertical" autoComplete="off" requiredMark="optional">
        <Form.Item
          name="address"
          label="数据地址"
          rules={[{ required: true, message: '请输入数据地址' }]}
        >
          <Input placeholder="请输入" />
        </Form.Item>
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
        <Form.Item name="tableDesc" label="描述">
          <Input.TextArea placeholder="100字符以内" maxLength={100} />
        </Form.Item>
        <div className={styles.dataSheetTitle}>
          <div className={styles.title}>数据表结构</div>
          <div className={styles.options}>
            <Button type="link" icon={<DownloadOutlined />} onClick={triggerDownload}>
              下载样例
            </Button>
            <Upload
              name="file"
              accept=".csv"
              showUploadList={false}
              beforeUpload={async (file, fileList) =>
                handleColCsvUpload(file, fileList)
              }
              customRequest={() => {
                return;
              }}
            >
              <Button type="link" icon={<UploadOutlined />}>
                上传数据表结构
              </Button>
            </Upload>
          </div>
        </div>

        {httpDataAddService.featuresError.length > 0 && (
          <div style={{ padding: '5px 0' }}>
            <Alert
              message={
                <div style={{ display: 'flex' }}>
                  <span style={{ flex: 1 }}>
                    {`有${httpDataAddService.featuresError.length}个字段错误请检查`}
                  </span>
                  <span>
                    <Checkbox
                      checked={httpDataAddService.showFeatureErrorChecked}
                      onChange={(e) =>
                        (httpDataAddService.showFeatureErrorChecked = e.target.checked)
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

        <div className={styles.tableHeader}>
          <div className={styles.tableHeaderFeature}>特征名称</div>
          <div className={styles.tableHeaderType}>类型</div>
          <div className={styles.tableHeaderDesc}>描述（可选）</div>
          <div className={styles.tableHeaderBtn}>操作</div>
        </div>

        <Form.List name="features">
          {(fields, { add, remove }) => (
            <div>
              <div className={styles.addBtn}>
                <Button icon={<PlusOutlined />} onClick={add} block type="dashed">
                  添加
                </Button>
              </div>
              {fields.reverse().map((field, index) => {
                let display = 'flex';
                // 如果有错误，并且勾选了仅看错误项
                if (
                  httpDataAddService.featuresError.length > 0 &&
                  httpDataAddService.showFeatureErrorChecked
                ) {
                  if (
                    httpDataAddService.featuresError.find(
                      (i: any) => i.name[1] == fields.length - 1 - index,
                    )
                  ) {
                    display = 'flex';
                  } else {
                    display = 'none';
                  }
                }
                return (
                  <Space key={field.key} style={{ display }}>
                    <Form.Item
                      className={styles.formFeatureName}
                      name={[field.name, 'featureName']}
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
                            const values = form.getFieldValue('features');
                            const features = values.filter(
                              (i: any) => value && i?.featureName === value,
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
                        size="middle"
                        onChange={handelFeatureChange}
                      />
                    </Form.Item>
                    <Form.Item
                      name={[field.name, 'featureType']}
                      rules={[{ required: true, message: '请选择特征类型' }]}
                    >
                      <Select
                        placeholder="请选择"
                        className={styles.formFeatureName}
                        options={featureTypeOptions}
                        size="middle"
                        onChange={handelFeatureChange}
                      />
                    </Form.Item>
                    <Form.Item
                      className={styles.formFeatureDesc}
                      name={[field.name, 'featureDescription']}
                      rules={[{ max: 200, message: '描述长度限制200字符' }]}
                    >
                      <Input placeholder="请输入" size="middle" />
                    </Form.Item>
                    <div className={styles.formFeatureDelete}>
                      <DeleteOutlined
                        onClick={() => {
                          remove(field.name);
                          setTimeout(() => {
                            validateForm();
                            handelFeatureChange();
                          });
                        }}
                      />
                    </div>
                  </Space>
                );
              })}
            </div>
          )}
        </Form.List>
      </Form>
    </Drawer>
  );
};

export class HttpDataAddService extends Model {
  loading = false;

  submitDisabled = true;

  featuresError = [];

  showFeatureErrorChecked = false;

  addHttpData = async (value: any) => {
    const params = {
      featureTableName: value.tableName,
      nodeId: parse(window.location.search)?.nodeId,
      type: 'HTTP',
      desc: value.tableDesc,
      url: value.address,
      columns: value.features.map(
        (item: {
          featureName: string;
          featureType: string;
          featureDescription: string;
        }) => ({
          colName: item.featureName,
          colType: item.featureType,
          colComment: item.featureDescription,
        }),
      ),
    };
    return await createFeatureDatasource(params);
  };
}
