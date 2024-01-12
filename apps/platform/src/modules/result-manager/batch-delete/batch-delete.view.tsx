import type { DatePickerProps } from 'antd';
import { Modal, Table, Select, DatePicker, Form, Radio, Button, message } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import { debounce } from 'lodash';
import { useEffect } from 'react';

import { useModel } from '@/util/valtio-helper';

import { ResultManagerService } from '../result-manager.service';

const { RangePicker } = DatePicker;
const RadioOptions = [
  { label: '按生成日期选择', value: 'date' },
  { label: '按路径选择', value: 'path' },
];

export const BatchDeleteModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const service = useModel(ResultManagerService);
  const { list, loading } = service;

  const getMessageInfo = () => {
    // if (!data.voteID || !nodeId) return;
    // service.getMessageDetail({
    //   nodeID: nodeId as string,
    //   voteID: data.voteID,
    //   isInitiator: activeTab === MessageActiveTabType.APPLY ? true : false,
    //   voteType: data.type,
    // });
  };

  const columns = [
    {
      title: '结果名 ',
      dataIndex: 'domainDataName',
      key: 'domainDataName',
      ellipsis: true,
    },
    {
      title: '生成时间',
      dataIndex: 'date',
      key: 'date',
    },
  ];

  useEffect(() => {
    if (open) {
      getMessageInfo();
    }
  }, [open]);

  const handleOk = () => {
    // TODO 删除接口
    // const dataIds = list.map(item => is'stem.id);
    message.success(`共删除${list?.length}个结果`);
  };

  const onDateChange = (
    value: DatePickerProps['value'] | RangePickerProps['value'],
    dateString: [string, string] | string,
  ) => {
    console.log('Formatted Selected Time: ', dateString);
    //  TODO  请求结果表
    // getList
  };

  const onSearch = (value: string) => {
    console.log('value', value);
    // TODO 请求路径下拉
  };

  const onPathChange = (value: string) => {
    console.log('value: ', value);
    //  TODO  请求结果表
    // getList
  };

  return (
    <Modal
      title="批量删除"
      onCancel={onClose}
      open={open}
      closable={false}
      getContainer={false}
      width={560}
      footer={[
        <Button key="cannel" onClick={onClose}>
          取消
        </Button>,
        <Button disabled={!list?.length} key="delete" onClick={handleOk} danger>
          删除
        </Button>,
      ]}
    >
      <Form
        initialValues={{
          dataSource: 'local',
          type: 'date',
        }}
      >
        <Form.Item name="dataSource" label="数据源">
          <Select>
            <Select.Option value="local">本地文件</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="type">
          <Radio.Group options={RadioOptions}></Radio.Group>
        </Form.Item>
        <Form.Item dependencies={['type']} noStyle>
          {({ getFieldValue }) => {
            return getFieldValue('type') === 'date' ? (
              <Form.Item name="dateValue">
                <RangePicker style={{ width: '100%' }} onChange={onDateChange} />
              </Form.Item>
            ) : (
              <Form.Item name="pathValue">
                <Select
                  showSearch
                  onSearch={debounce(onSearch, 500)}
                  onChange={onPathChange}
                ></Select>
              </Form.Item>
            );
          }}
        </Form.Item>
      </Form>
      <div>删除结果预览（{list?.length}）</div>
      <Table columns={columns} loading={loading} dataSource={list} size="small" />
    </Modal>
  );
};
