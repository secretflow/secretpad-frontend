import { Button, Tag, Tooltip, Typography } from 'antd';
import { parse } from 'query-string';
import { useEffect, useState } from 'react';
import { useLocation } from 'umi';

import { Platform, hasAccess } from '@/components/platform-wrapper';
import { Download } from '@/modules/dag-result/apply-download';
import { openNewTab } from '@/util/path';
import { getModel } from '@/util/valtio-helper';

import { DataSourceType } from '../data-source-list/type';
import { ResultManagerService } from '../result-manager/result-manager.service';

import style from './index.less';
import type { ResultComponentProps } from './types';
import { formatTimestamp } from './utils';

const { Paragraph } = Typography;

export const ResultRuleComponent = (props: ResultComponentProps<'rule'>) => {
  const { data, id } = props;
  const { mode, projectId } = parse(window.location.search);
  const { gmtCreate, meta, jobId, taskId, type } = data;
  const { rows } = meta;
  const resultManagerService = getModel(ResultManagerService);
  const { pathname } = useLocation();

  const [downloadBtnDisabled, setDownloadBtnDisabled] = useState(false);
  const [downloadPath, setDownloadPath] = useState('');

  useEffect(() => {
    rows.forEach((r) => {
      const { datasourceType, path } = r;

      if (datasourceType === DataSourceType.OSS) {
        setDownloadBtnDisabled(true);
        setDownloadPath(path);
      }
    });
  }, [rows]);

  return (
    <div className={style.report}>
      <div className={style.item}>
        <span className={style.name}>{id}</span>
        <Tag color="rgba(0,104,250,0.08)">规则</Tag>
      </div>

      {gmtCreate && (
        <div className={style.item}>
          <span className={style.timeLabel}>生成时间：</span>
          <span>{formatTimestamp(gmtCreate)}</span>
        </div>
      )}

      {rows.map((row, index) => {
        const { path, nodeId, tableId, type: nodeType } = row;

        return (
          <div className={style.ruleContent} key={`rule-${path}-${index}`}>
            <Paragraph
              copyable={{
                text: path,
                tooltips: ['复制', '复制成功'],
              }}
            >
              <div className={style.item}>
                <span className={style.timeLabel}>{nodeId}规则路径：</span>
                <span>{path}</span>
                {/* 内置节点才展示查看结果跳转 */}
                {nodeType === 'embedded' && (
                  <Button
                    type="link"
                    size="small"
                    style={{ paddingLeft: 20 }}
                    onClick={() => {
                      const search = `nodeId=${nodeId}&tab=result&resultName=${path}`;
                      openNewTab(pathname, '/node', search);
                    }}
                  >
                    查看结果
                  </Button>
                )}
              </div>
            </Paragraph>
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
                  downloadBtnDisabled
                    ? `OSS 文件不支持直接下载，请到 OSS 对应 bucket 的预设路径下找到文件下载，地址：${downloadPath}`
                    : ''
                }
              >
                <Button
                  type="link"
                  style={{ paddingLeft: 8, fontSize: 12 }}
                  onClick={() =>
                    resultManagerService.download(nodeId || '', { domainDataId: path })
                  }
                  disabled={downloadBtnDisabled}
                >
                  下载
                </Button>
              </Tooltip>
            )}
          </div>
        );
      })}
    </div>
  );
};
