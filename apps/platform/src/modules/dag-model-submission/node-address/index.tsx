import { Col, Empty, Form, Input, Row, Select, Spin } from 'antd';
import { useEffect, useMemo } from 'react';

import { useModel } from '@/util/valtio-helper';

import { SubmissionDrawerService } from '../submission-service';

import styles from './index.less';

export const NodeAddressList = () => {
  const submissionDrawerService = useModel(SubmissionDrawerService);
  const form = Form.useFormInstance();
  const { addressNodeList: addressList } = submissionDrawerService;

  useEffect(() => {
    const newAddress = addressList.map((item) => ({
      nodeName: item.nodeName,
      nodeId: item.nodeId,
    }));
    form.setFieldValue('storageAddress', newAddress);
  }, [addressList, form]);

  const dataSourceOptions = useMemo(() => {
    return addressList.map((item) => {
      return item?.dataSources?.map(
        (source: API.ProjectGraphDomainDataSourceVODataSource) => {
          return {
            label: source.dataSourceName,
            value: source.dataSourceId,
          };
        },
      );
    });
  }, [addressList]);

  // 数据源路径 先隐藏
  // const handleChange = (value: string, key: number) => {
  //   const path = addressList[key]?.dataSources?.find(
  //     (item) => item.dataSourceId === value,
  //   )?.path;
  //   form.setFields([
  //     {
  //       name: ['storageAddress', key, 'dataSourcePath'],
  //       value: path,
  //     },
  //   ]);
  // };

  return (
    <Spin spinning={submissionDrawerService.loading}>
      <div className={styles.canvasPath}>
        {addressList.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={'请点击画布中可提交的组件'}
          />
        ) : (
          <Form.List name="storageAddress">
            {(fields) => {
              return (
                <>
                  {fields.map((field, index) => {
                    return (
                      <div key={field.key} className={styles.content}>
                        <div className={styles.title}>{'存储节点' + (index + 1)}</div>
                        <Row>
                          <Col span={12}>
                            <Form.Item
                              {...field}
                              name={[field.name, 'nodeName']}
                              rules={[{ required: true, message: '请输入节点' }]}
                            >
                              <Input disabled />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              {...field}
                              name={[field.name, 'dataSource']}
                              rules={[{ required: true, message: '请选择数据源' }]}
                            >
                              <Select
                                // onChange={(value) => handleChange(value, field.key)}
                                options={dataSourceOptions[field.key]}
                                placeholder="请选择数据源"
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                        {/* 数据源路径暂时隐藏 */}
                        {/* <Row>
                          <Col span={24}>
                            <Form.Item
                              {...field}
                              name={[field.name, 'dataSourcePath']}
                              rules={[{ required: true, message: '请选择数据源' }]}
                            >
                              <Input
                                disabled
                                placeholder="数据源路径，选择数据源后，自动填充"
                              />
                            </Form.Item>
                          </Col>
                        </Row> */}
                      </div>
                    );
                  })}
                </>
              );
            }}
          </Form.List>
        )}
      </div>
    </Spin>
  );
};
