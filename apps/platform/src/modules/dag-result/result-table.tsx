import {
  SearchOutlined,
  DownloadOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
} from '@ant-design/icons';
import { useFullscreen } from 'ahooks';
import type { InputRef } from 'antd';
import { Button, Input, Space, Table, Tag, Tooltip } from 'antd';
import type { ColumnType } from 'antd/es/table';
import type { FilterConfirmProps } from 'antd/es/table/interface';
import classNames from 'classnames';
import classnames from 'classnames';
import { groupBy, map as lodashMap } from 'lodash';
import { parse } from 'query-string';
import type { Key } from 'react';
import { useState, useRef, useEffect } from 'react';
import { CSVLink } from 'react-csv';
import { useLocation } from 'umi';

import { Platform, hasAccess } from '@/components/platform-wrapper';
import { Download } from '@/modules/dag-result/apply-download';
import { openNewTab } from '@/util/path';
import { getModel } from '@/util/valtio-helper';

import { DataSourceType } from '../data-source-list/type';
import { ResultManagerService } from '../result-manager/result-manager.service';

import styles from './index.less';
import type { DataType, ResultComponentProps } from './types';
import { formatTimestamp } from './utils';

export const ResultTableComponent = (props: ResultComponentProps<'table'>) => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');

  const [downloadBtnDisabled, setDownloadBtnDisabled] = useState(false);
  const [downloadPath, setDownloadPath] = useState('');
  const searchInput = useRef<InputRef>(null);
  const { pathname } = useLocation();
  const { mode, projectId } = parse(window.location.search);
  const csvRef = useRef<{
    link: HTMLLinkElement;
  }>(null);
  const fullScreenRef = useRef(null);
  const [isFullscreen, { enterFullscreen, exitFullscreen }] =
    useFullscreen(fullScreenRef);
  const downloadData = () => {
    if (csvRef && csvRef.current) {
      csvRef.current.link.click();
    }
  };
  const { data, id } = props;
  const { gmtCreate, meta, jobId, taskId, type: resultType } = data;
  const { rows } = meta;
  const resultManagerService = getModel(ResultManagerService);

  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: string,
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex: string): ColumnType<DataType> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            搜索
          </Button>
          <Button
            onClick={() => {
              clearFilters && handleReset(clearFilters);
              handleSearch(selectedKeys as string[], confirm, dataIndex);
            }}
            size="small"
            style={{ width: 90 }}
          >
            清空
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex as keyof DataType]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) => text,
  });

  const dataSource: {
    field: string;
    fieldType: string;
    nodeId: string;
    key: string;
  }[] = [];
  const metaInfo: { path: string; nodeId: string; tableId: string; type: string }[] =
    [];

  useEffect(() => {
    rows.forEach((r) => {
      const { datasourceType, path } = r;

      if (datasourceType === DataSourceType.OSS) {
        setDownloadBtnDisabled(true);
        setDownloadPath(path);
      }
    });
  }, [rows]);

  rows.forEach((r) => {
    const { path, nodeId, fields, fieldTypes, tableId, type } = r;

    if (fields === '') {
      return;
    }

    metaInfo.push({ path, nodeId, tableId, type });
    const fieldList = fields.split(',');
    const fieldTypeList = fieldTypes.split(',');

    fieldList.forEach((field, index) => {
      dataSource.push({
        field,
        fieldType: fieldTypeList[index],
        nodeId,
        key: `${nodeId}-${index}`,
      });
    });
  });

  const columns = [
    {
      title: '字段',
      dataIndex: 'field',
      key: 'field',
      ...getColumnSearchProps('field'),
    },
    {
      title: '类型',
      dataIndex: 'fieldType',
      key: 'fieldType',
      filters: lodashMap(
        groupBy(dataSource, 'fieldType'),
        (g: string, key: string) => ({
          text: key,
          value: key,
        }),
      ) as unknown as { text: string; value: string }[],
      onFilter: (value: string | number | boolean, record: DataType) =>
        record.fieldType.indexOf(value as string) === 0,
      render(text: string) {
        return <span>{(text || '').toLocaleLowerCase() || ' - - '}</span>;
      },
    },
    {
      title: '节点',
      dataIndex: 'nodeId',
      key: 'nodeId',
      ellipsis: true,
      filters: lodashMap(groupBy(dataSource, 'nodeId'), (g: string, key: string) => ({
        text: key,
        value: key,
      })) as unknown as { text: string; value: string }[],
      onFilter: (value: string | number | boolean, record: DataType) =>
        record.nodeId.indexOf(value as string) === 0,
    },
  ];

  // 去除导出数据时手动加入的key
  const convertDownDataSource = (dataList: { key?: Key }[] = []) => {
    return dataList.map((item) => {
      delete item.key;
      return item;
    });
  };

  return (
    <div className={styles.result}>
      <div className={styles.report}>
        <div className={styles.item}>
          <span className={styles.name}>{id}</span>
          <Tag color="rgba(0,104,250,0.08)">表</Tag>
        </div>
        <div className={styles.item}>
          <span className={styles.timeLabel}>生成时间：</span>
          <span>{formatTimestamp(gmtCreate)}</span>
        </div>
        {metaInfo.map((row, index) => {
          const { path, nodeId, tableId, type: nodeType } = row;
          return (
            <div key={`table-${path}-${index}`}>
              <div className={styles.item}>
                <span className={styles.timeLabel}>{nodeId}节点路径：</span>
                <span>{path}</span>
                {/* no download for readtable */}
                {/* 内置节点才展示查看结果跳转 */}
                {props.codeName !== 'read_data/datatable' &&
                  nodeType === 'embedded' && (
                    <Button
                      type="link"
                      size="small"
                      style={{ paddingLeft: 20, fontSize: 12 }}
                      onClick={() => {
                        const search = `nodeId=${nodeId}&tab=result&resultName=${tableId}`;
                        openNewTab(pathname, '/node', search);
                      }}
                    >
                      查看结果
                    </Button>
                  )}
                {/* no download for readtable */}
                {!hasAccess({ type: [Platform.AUTONOMY] }) &&
                  mode === 'TEE' &&
                  props.codeName !== 'read_data/datatable' && (
                    <Download
                      params={{
                        nodeID: nodeId,
                        taskID: taskId,
                        jobID: jobId,
                        projectID: projectId as string,
                        resourceType: resultType,
                        resourceID: tableId,
                      }}
                    />
                  )}
                {/* p2p 模式下不用申请，直接下载 */}
                {hasAccess({ type: [Platform.AUTONOMY] }) &&
                  props.codeName !== 'read_data/datatable' && (
                    <Tooltip
                      title={
                        downloadBtnDisabled
                          ? `OSS 文件不支持直接下载，请到 OSS 对应 bucket 的预设路径下找到文件下载，地址：${downloadPath}`
                          : ''
                      }
                    >
                      <Button
                        type="link"
                        style={{ paddingLeft: 8, fontSize: 12 }}
                        onClick={() =>
                          resultManagerService.download(nodeId || '', {
                            domainDataId: path,
                          })
                        }
                        disabled={downloadBtnDisabled}
                      >
                        下载
                      </Button>
                    </Tooltip>
                  )}
              </div>
            </div>
          );
        })}
      </div>
      <div className={styles.tableHeader}>
        <div>表字段</div>
        <Space size={12} className={styles.right}>
          <Space
            onClick={downloadData}
            className={classnames(styles.fullScreenText, styles.actionIcon)}
          >
            <DownloadOutlined />
            <span> 导出表结构</span>
          </Space>
          <Space
            onClick={enterFullscreen}
            className={classnames(styles.fullScreenText, styles.actionIcon)}
          >
            <FullscreenOutlined />
            <span>全屏</span>
          </Space>
        </Space>
      </div>
      <CSVLink
        filename={`${id}.csv`}
        data={convertDownDataSource(dataSource)}
        ref={csvRef}
      />
      <div
        ref={fullScreenRef}
        className={classNames({
          fullScreenContentPage: isFullscreen,
        })}
      >
        {isFullscreen && (
          <div className="fullScreenHeader">
            <div className="title">表字段</div>
            <Space size={12}>
              <Space
                onClick={downloadData}
                className={classnames(styles.fullScreenText, styles.actionIcon)}
              >
                <DownloadOutlined />
                <span> 导出表结构</span>
              </Space>
              <Space
                onClick={exitFullscreen}
                className={classnames(styles.fullScreenText, styles.actionIcon)}
              >
                <FullscreenExitOutlined />
                <span>退出全屏</span>
              </Space>
            </Space>
          </div>
        )}
        <Table
          rowKey="field"
          className={classNames({ fullScreenContentWrap: isFullscreen })}
          dataSource={dataSource}
          columns={columns}
          size="small"
        />
      </div>
    </div>
  );
};
