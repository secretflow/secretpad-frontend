import { UploadOutlined } from '@ant-design/icons';
import { Button, message, Upload } from 'antd';

import { useModel } from '@/util/valtio-helper';

import { LinearModelParamsModificationsRenderView } from '../..';
import { DefaultRedoUndoService } from '../../../redo-undo/redo-undo-service';
import type { ParametersDatum } from '../../types';
import styles from '../index.less';

const checkListsIsEqual = (
  data: Omit<ParametersDatum, 'key' | 'featureWeight'>[],
  testData: Omit<ParametersDatum, 'key' | 'featureWeight'>[],
) => {
  if (!(data && testData)) return false;

  if (data.length !== testData.length) return false;

  const featureMap = new Map();

  for (const item of data) {
    const key = `${item.featureName}|${item.party}`;
    featureMap.set(key, (featureMap.get(key) || 0) + 1);
  }

  for (const item of testData) {
    const key = `${item.featureName}|${item.party}`;
    if (!featureMap.has(key)) return false;
    const count = featureMap.get(key) - 1;
    if (count === 0) {
      featureMap.delete(key);
    } else {
      featureMap.set(key, count);
    }
  }
  return featureMap.size === 0;
};

export const UploadParameters = () => {
  const { parametersData, setParametersData, disabled } = useModel(
    LinearModelParamsModificationsRenderView,
  );
  const { init } = useModel(DefaultRedoUndoService);

  /**
   * 上传文件方法
   */
  const uploadHandler = (reader: any) => {
    const content = reader.result.replace(/\r\n/g, '\n').replace(/\r/g, '\n') as string;
    const rows = content.split('\n').filter((str) => str !== '');
    // 空数据校验
    if (rows.length < 3) {
      message.warning('不能上传空数据');
      return;
    }

    const res: ParametersDatum[] = [];

    const modelHashRow = rows.splice(0, 1);

    const modelHash = modelHashRow[0].split(':')[1]?.replaceAll(',', '').trim();

    // modelHash 校验
    if (!modelHash) {
      message.warning('请传入 modelHash');
      return;
    }

    const biasRow = rows.splice(0, 1);

    const bias = biasRow[0].split(':')[1]?.replaceAll(',', '').trim();

    // bias 校验
    if (!bias) {
      message.warning('请传入 bias');
      return;
    }

    const rowHeader = rows.splice(0, 1);
    const baseRowHeader = ['feature', '所属节点', 'weight'];
    const rowHeaderList = rowHeader?.[0].split(',');
    const featureNameIndex = rowHeaderList.indexOf(baseRowHeader[0]);
    const partyIndex = rowHeaderList.indexOf(baseRowHeader[1]);
    const featureWeightIndex = rowHeaderList.indexOf(baseRowHeader[2]);

    const checkRowHeader = rowHeaderList.every((item) => baseRowHeader.includes(item));
    // 模版校验
    if (!checkRowHeader) {
      message.warning('格式与导出的模型参数不匹配');
      return;
    }

    rows.forEach((row) => {
      if (row) {
        const cols = row.split(',');
        res.push({
          key: cols[featureNameIndex] + '-' + cols[partyIndex],
          featureName: cols[featureNameIndex],
          party: cols[partyIndex],
          featureWeight: Number(cols[featureWeightIndex]),
        });
      }
    });

    if (res.length > 0) {
      return {
        modelHash,
        featureWeights: res,
        bias: Number(bias),
      };
    }
  };

  const uploadTableData = (file: File) => {
    // 文件类型校验
    if (!/\.csv$/.test(file.name)) {
      message.error('请选择csv文件上传');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const data = uploadHandler(reader);
      if (data && parametersData) {
        const featuresAndParty = parametersData.featureWeights.map((record) => ({
          featureName: record.featureName,
          party: record.party,
        }));

        const testFeaturesAndParty = data.featureWeights.map((record) => ({
          featureName: record.featureName,
          party: record.party,
        }));

        const isFeaturesEqual = checkListsIsEqual(
          featuresAndParty,
          testFeaturesAndParty,
        );
        if (!isFeaturesEqual) {
          // 特征一致校验
          message.warning('请上传特征相同的模型参数结果表！');
          return;
        }

        message.success('上传成功');

        // 引擎需要保持和 parametersData 顺序一致
        const orderMap = new Map();
        parametersData.featureWeights.forEach((item, index) => {
          orderMap.set(item.key, index);
        });
        data.featureWeights.sort((a, b) => {
          return orderMap.get(a.key) - orderMap.get(b.key);
        });

        setParametersData(data);
        init();
      }
    };

    reader.readAsText(file);

    return false;
  };

  return (
    <>
      <Upload action="" beforeUpload={uploadTableData} showUploadList={false}>
        <span style={{ display: 'block-inline', paddingRight: 15 }}>
          <Button
            type="link"
            disabled={disabled}
            icon={<UploadOutlined />}
            className={styles.operationBtn}
            style={{ paddingRight: 5 }}
          >
            上传本地参数
          </Button>
        </span>
      </Upload>
    </>
  );
};
