import { Select, Space, Tag, Tooltip, Typography } from 'antd';
import { useEffect, useRef, useState } from 'react';

import { useModel } from '@/util/valtio-helper';

import { LogTextMap } from './dag-log.service';
import { LogEditor } from './log-viewer.view';
import { SlsService } from './sls-service';

import './monaco-log';

export const SlsLog: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const service = useModel(SlsService);
  const [logEditor] = useState<LogEditor>(new LogEditor());

  useEffect(() => {
    loadEditor();
    return () => {
      if (logEditor) {
        logEditor.disposeEditor();
      }
    };
  }, []);

  const loadEditor = async () => {
    if (editorRef && editorRef.current) {
      await logEditor.initEditor(editorRef.current, 'aaaa');
    }
  };

  useEffect(() => {
    logEditor?.editor?.setValue(service.slsLogContent || '');
  }, [logEditor, service.slsLogContent]);

  return (
    <>
      <div
        style={{
          marginLeft: 10,
          marginBottom: 4,
        }}
      >
        <span>参与方日志: </span>
        <Select
          size="small"
          value={service.currentNodePartiesId}
          style={{ width: 200 }}
          onChange={(value) => {
            service.currentNodePartiesId = value;
            service.getNodeSlsLogContent(value);
          }}
          options={service.nodePartiesList.map((item) => ({
            label: item.nodeName,
            value: item.nodeId,
          }))}
          disabled={service.nodePartiesList.length === 1}
        />
      </div>
      <div ref={editorRef} style={{ height: '100%' }} />
    </>
  );
};

export const SlsLogLabel: React.FC = () => {
  const slsLogService = useModel(SlsService);
  return (
    <Tooltip
      color="#fff"
      title={
        !slsLogService.slsLogIsConfig ? (
          <span style={{ color: '#000' }}>
            暂未连接sls工具，请登录容器查看日志 怎么集成sls文档？
            <Typography.Link
              href="https://help.aliyun.com/zh/sls/getting-started?spm=a2c4g.11186623.0.0.feaf55ebBPKiEB"
              target="_blank"
            >
              查看帮助文档
            </Typography.Link>
          </span>
        ) : null
      }
    >
      <Space style={{ height: 32 }}>
        引擎日志
        {slsLogService.slsLogIsConfig && (
          <Tag color={LogTextMap[slsLogService.logTipContent.status]?.color}>
            {LogTextMap[slsLogService.logTipContent.status]?.text}
          </Tag>
        )}
      </Space>
    </Tooltip>
  );
};
