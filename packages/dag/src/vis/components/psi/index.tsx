import { Table, Button } from 'antd';
import React from 'react';
import { CSVLink } from 'react-csv';

import type { ResultOriginData } from '../typing';
import { modifyDataStructure } from '../utils';

import { RenderBinTable } from './bin-table';
import './index.less';
import type { Bin } from './interface';
import { handleResultData } from './utils';

export interface PSIProps {
  data: ResultOriginData;
}

export const PSI: React.FC<PSIProps> = (props) => {
  const { data: requestData } = props;
  const data = modifyDataStructure(requestData);
  const parsedData = React.useMemo(() => handleResultData(data), [data]);
  const columns = React.useMemo(
    () => [
      { title: 'feature', dataIndex: 'feature_name' },
      { title: 'PSI', dataIndex: 'psi' },
    ],
    [],
  );

  const csvRef = React.useRef<{
    link: HTMLLinkElement;
  }>(null);
  const downloadPSIData = () => {
    if (csvRef && csvRef.current) {
      csvRef.current.link.click();
    }
  };

  const downData = React.useMemo(() => {
    const dataExport: (string | number)[][] = [['feature', 'PSI']];
    if (props.data) {
      const downPropsData = modifyDataStructure(props.data);
      const exportData = JSON.parse(JSON.stringify(handleResultData(downPropsData)));
      exportData.forEach((item: { feature_name: string; psi: string; bins: Bin[] }) => {
        dataExport.push([item.feature_name, item.psi]);
        if (item.bins?.length) {
          dataExport.push(['Label', 'PSI', 'Base Ratio', 'Test Ratio']);
          item.bins.forEach((items: Bin) => {
            dataExport.push([
              items.label,
              items.psi,
              items.base_ratio,
              items.test_ratio,
            ]);
          });
        }
      });
    }
    return dataExport;
  }, [props.data]);

  return (
    <div className="dagComponentPsiTable">
      <Button onClick={downloadPSIData} className="dagComponentPsiTableBtn">
        导出数据
      </Button>
      <Table
        bordered
        size="small"
        columns={columns}
        rowKey="feature_name"
        dataSource={parsedData}
        expandable={{
          expandedRowRender: (record) => <RenderBinTable bins={record.bins} />,
        }}
      />
      <CSVLink filename={'psi.csv'} data={downData} ref={csvRef} />
    </div>
  );
};
