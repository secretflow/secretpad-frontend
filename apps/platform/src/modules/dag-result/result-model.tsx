import { Button, Tag, Tooltip, Typography } from 'antd';
import { parse } from 'query-string';
import { useEffect, useState } from 'react';
import { useLocation } from 'umi';

import { Platform, hasAccess } from '@/components/platform-wrapper';
import { openNewTab } from '@/util/path';
import { getModel } from '@/util/valtio-helper';

import { DataSourceType } from '../data-source-list/type';
import { ResultManagerService } from '../result-manager/result-manager.service';

import { Download } from './apply-download';
import styles from './index.less';
import type { ResultComponentProps } from './types';
import { formatTimestamp, getDownloadBtnTitle } from './utils';

const { Paragraph } = Typography;

export const ResultModelComponent = (props: ResultComponentProps<'model'>) => {
  const { data, id } = props;
  const { mode, projectId } = parse(window.location.search);
  const { gmtCreate, meta, jobId, taskId, type, codeName } = data;
  const isReadModal = codeName === 'ml.predict/read_model'; // 读模型产出的模型不允许下载
  const { rows } = meta;
  const resultManagerService = getModel(ResultManagerService);
  const { pathname } = useLocation();
  const [downloadBtnDisabled, setDownloadBtnDisabled] = useState({
    disable: false,
    type: DataSourceType.OSS,
  });
  const [downloadPath, setDownloadPath] = useState('');

  useEffect(() => {
    rows.forEach((r) => {
      const { datasourceType, path } = r;

      if (
        datasourceType === DataSourceType.OSS ||
        datasourceType === DataSourceType.ODPS ||
        datasourceType === DataSourceType.MYSQL
      ) {
        setDownloadBtnDisabled({
          disable: true,
          type: datasourceType,
        });
        setDownloadPath(path);
      }
    });
  }, [rows]);

  return (
    <div className={styles.report}>
      <div className={styles.item}>
        <span className={styles.name}>{id}</span>
        <Tag color="rgba(0,104,250,0.08)">模型</Tag>
      </div>

      <div className={styles.time}>
        <span className={styles.timeLabel}>生成时间：</span>
        {gmtCreate && <span>{formatTimestamp(gmtCreate)}</span>}
      </div>

      {rows.map((row, index) => {
        const { path, nodeId, tableId, type: nodeType } = row;

        return (
          <div className={styles.modelContent} key={`model-${path}-${index}`}>
            <Paragraph
              copyable={{
                text: path,
                tooltips: ['复制', '复制成功'],
              }}
            >
              <div className={styles.item}>
                <span className={styles.timeLabel}>{nodeId}模型路径：</span>
                <span>{path}</span>
                {/* 内置节点才展示查看结果跳转 */}
                {nodeType === 'embedded' && (
                  <Button
                    type="link"
                    size="small"
                    style={{ paddingLeft: 20 }}
                    onClick={() => {
                      const search = `ownerId=${nodeId}&tab=result&resultName=${path}`;
                      openNewTab(pathname, '/node', search);
                    }}
                  >
                    查看结果
                  </Button>
                )}
              </div>
            </Paragraph>
            {!isReadModal && (
              <>
                {!hasAccess({ type: [Platform.AUTONOMY] }) && mode === 'TEE' && (
                  <Download
                    params={{
                      nodeID: nodeId,
                      taskID: taskId,
                      jobID: jobId,
                      projectID: projectId as string,
                      resourceType: type,
                      resourceID: tableId,
                    }}
                  />
                )}
                {/* p2p 模式下不用申请，直接下载 */}
                {hasAccess({ type: [Platform.AUTONOMY] }) && (
                  <Tooltip
                    title={
                      downloadBtnDisabled.disable
                        ? getDownloadBtnTitle(downloadBtnDisabled.type, downloadPath)
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
                      disabled={downloadBtnDisabled.disable}
                    >
                      下载
                    </Button>
                  </Tooltip>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};
