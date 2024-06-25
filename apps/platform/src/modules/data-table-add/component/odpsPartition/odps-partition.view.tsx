import { Form, Row, Col, Input, Space } from 'antd';

export const OdpsPartition = () => {
  return (
    <div>
      <Form.Item label="指定分区表">
        <Form.List name="partition" initialValue={[{}, {}]}>
          {(fields) => {
            return (
              <>
                {fields.map((field, index) => {
                  return (
                    <Row key={field.key}>
                      <Space.Compact key={field.key} style={{ width: '100%' }}>
                        <Col span={12}>
                          <Form.Item {...field} name={[field.name, 'name']}>
                            <Input
                              addonBefore={index === 0 ? `一级分区` : `二级分区`}
                              placeholder="请输入特征名"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item {...field} name={[field.name, 'partitionValue']}>
                            <Input placeholder="请输入分区值，多分区用“,”分隔" />
                          </Form.Item>
                        </Col>
                      </Space.Compact>
                    </Row>
                  );
                })}
              </>
            );
          }}
        </Form.List>
      </Form.Item>
    </div>
  );
};
