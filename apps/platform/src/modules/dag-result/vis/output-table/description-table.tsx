import { DownloadOutlined } from '@ant-design/icons';
import { Button, Table } from 'antd';
import { useRef } from 'react';
import { CSVLink } from 'react-csv';

export const DescriptionTable = (props: IProps) => {
  const { data = [], tableName = '' } = props;

  const csvRef = useRef<{
    link: HTMLLinkElement;
  }>(null);

  const downloadData = () => {
    if (csvRef && csvRef.current) {
      csvRef.current.link.click();
    }
  };

  const columnsList = [
    {
      key: 'name',
      title: 'name',
      dataIndex: 'name',
      showSorterTooltip: false,
    },
    {
      key: 'value',
      title: 'value',
      dataIndex: 'value',
    },
  ];

  return (
    <div>
      <div className="exportBtn">
        <Button
          type="link"
          style={{ marginBottom: 8, color: 'rgba(0,10,26,0.68)', right: 0 }}
          size="small"
          onClick={downloadData}
        >
          <DownloadOutlined />
          导出数据
        </Button>
      </div>
      <CSVLink filename={`${tableName}.csv`} data={data} ref={csvRef} />
      <Table
        bordered
        size="small"
        columns={columnsList}
        rowKey={(record) => record.name}
        dataSource={data}
        scroll={{ x: '100%' }}
        pagination={data.length > 100 && { pageSize: 100, showSizeChanger: false }}
      />
    </div>
  );
};

export interface IProps {
  data?: DataProps[];
  tableName?: string;
}

export interface DataProps {
  name: string;
  value: string | number;
}
