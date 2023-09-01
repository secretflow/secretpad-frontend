import {
  ContainerOutlined,
  ExperimentOutlined,
  FileSearchOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { ActionType } from '@secretflow/dag';
import { Row, Col, Card } from 'antd';
import classnames from 'classnames';
import { parse } from 'query-string';
import { useState, useEffect } from 'react';
import { useLocation } from 'umi';

import type {
  ExecutionRecordData,
  ExecutionRecord,
} from '@/modules/pipeline-record-list/record-protocol';
import { ResultType } from '@/modules/pipeline-record-list/record-protocol';
import { DefaultRecordService } from '@/modules/pipeline-record-list/record-service';
import { getModel, Model, useModel } from '@/util/valtio-helper';

import mainDag from './dag';
import styles from './index.less';

export const RecordResultComponent = () => {
  const { search } = useLocation();
  const recordId = parse(search)?.dagId as string;

  const viewInstance = useModel(RecordResultView);
  const [record, setRecord] = useState<ExecutionRecordData | undefined>();

  useEffect(() => {
    const getRecord = async (id: string) => {
      const res = await viewInstance.getRecord(id);
      if (res) setRecord(res);
    };

    getRecord(recordId);
    viewInstance.setResultTypeSelected();
  }, [recordId, viewInstance.recordList]);

  const getNodeByResultType = async (resultType: ResultType) => {
    // TODO: api (type, recordId)
    // return [nodeids]  ['test_node_1'];
    // set rest nodes status disabled
  };

  return (
    <div className={styles.resultCard}>
      <Row gutter={16}>
        <Col span={6}>
          <Card
            className={classnames(
              viewInstance.resultTypeSelected === ResultType.TABLE
                ? styles.selected
                : '',
            )}
            bordered={false}
            onClick={(e) => {
              viewInstance.setResultTypeSelected(ResultType.TABLE);
              getNodeByResultType(ResultType.TABLE);
              e.stopPropagation();
            }}
          >
            <FileTextOutlined
              className={styles.resultTypeIcon}
              style={{ color: 'blue' }}
            />
            <div>表：{record?.tableCount || 0}个</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            bordered={false}
            className={classnames(
              viewInstance.resultTypeSelected === ResultType.MODEL
                ? styles.selected
                : '',
            )}
            onClick={(e) => {
              viewInstance.setResultTypeSelected(ResultType.MODEL);
              getNodeByResultType(ResultType.MODEL);
              e.stopPropagation();
            }}
          >
            <ExperimentOutlined
              style={{ color: 'purple' }}
              className={styles.resultTypeIcon}
            />
            <div>模型：{record?.modelCount || 0}个</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            className={classnames(
              viewInstance.resultTypeSelected === ResultType.RULE
                ? styles.selected
                : '',
            )}
            bordered={false}
            onClick={(e) => {
              viewInstance.setResultTypeSelected(ResultType.RULE);
              getNodeByResultType(ResultType.RULE);
              e.stopPropagation();
            }}
          >
            <ContainerOutlined
              style={{ color: 'orange' }}
              className={styles.resultTypeIcon}
            />
            <div>规则：{record?.ruleCount || 0}个</div>
          </Card>
        </Col>

        <Col span={6}>
          <Card
            className={classnames(
              viewInstance.resultTypeSelected === ResultType.REPORT
                ? styles.selected
                : '',
            )}
            bordered={false}
            onClick={(e) => {
              viewInstance.setResultTypeSelected(ResultType.REPORT);
              getNodeByResultType(ResultType.REPORT);
              e.stopPropagation();
            }}
          >
            <FileSearchOutlined className={styles.resultTypeIcon} />
            <div>报告：{record?.reportCount || 0}个</div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export class RecordResultView extends Model {
  resultTypeSelected: ResultType | undefined;

  recordList: ExecutionRecord;

  recordService = getModel(DefaultRecordService);

  constructor() {
    super();
    this.resultTypeSelected = this.recordService.resultTypeSelected;
    this.recordList = this.recordService.recordList;
    this.recordService.onRecordListUpdated(() => {
      this.recordList = this.recordService.recordList;
    });
    this.recordService.onResultTypeReset(async (type) => {
      if (!this.recordService.currentRecord?.graph) {
        await mainDag.dataService.fetch();
      }
      this.resultTypeSelected = type;
      const originalNodes = this.recordService.currentRecord?.graph?.nodes;
      const filteredNodes = this.recordService.filterGraphNodeByType();
      const styledNodes = originalNodes?.map(({ id }) => {
        if (filteredNodes.find((f) => id === f.id)) {
          return { nodeId: id, styles: { isOpaque: true } };
        } else {
          return { nodeId: id, styles: { isOpaque: false } };
        }
      });
      mainDag.graphManager.executeAction(ActionType.changeStyles, styledNodes);
    });
  }

  async getRecord(id: string) {
    return await this.recordService.getRecord(id);
  }

  setResultTypeSelected(type?: ResultType) {
    this.resultTypeSelected = type;
    this.recordService.setResultType(type);
  }
}
