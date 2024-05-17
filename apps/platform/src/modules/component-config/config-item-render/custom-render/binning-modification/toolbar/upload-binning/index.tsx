import { QuestionCircleOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, message, Tooltip, Upload } from 'antd';

import { useModel } from '@/util/valtio-helper';

import { BinModificationsRenderView } from '../..';
import { DefaultRedoUndoService } from '../../../redo-undo/redo-undo-service';
import type { BinningData, Record } from '../../types';
import { CurrOperationEnum, TableTypeEnum } from '../../types';
import styles from '../index.less';

const checkFeaturesIsEqual = (
  variableBins: BinningData['variableBins'],
  testData: BinningData['variableBins'],
) => {
  if (!(variableBins && testData)) return false;

  const features = variableBins.map((record) => record.feature);
  const testFeatures = testData.map((record) => record.feature);

  if (features.length !== testFeatures.length) return false;

  const copyTestFeatures = [...testFeatures];

  testFeatures.forEach((feature) => {
    const index = features.indexOf(feature);
    const testIndex = copyTestFeatures.indexOf(feature);

    if (index !== -1) {
      features.splice(index, 1);
      copyTestFeatures.splice(testIndex, 1);
    }
  });

  return copyTestFeatures.length === 0 && features.length === 0;
};

export const UploadBinning = () => {
  const {
    setSelectedRowKeys,
    parametersData,
    setCurrOperation,
    setParametersData,
    type,
    disabled,
  } = useModel(BinModificationsRenderView);
  const { init } = useModel(DefaultRedoUndoService);

  /**
   * woe 分箱 上传文件方法
   */
  const woeBinningUploadHandler = (reader: any) => {
    const content = reader.result as string;
    const rows = content.split('\n').filter((str) => str !== '');

    // 空数据校验
    if (rows.length < 3) {
      message.warning('不能上传空数据');
      return;
    }

    const res: Record[] = [];

    const modelHashRow = rows.splice(0, 1);
    const modelHash = modelHashRow[0].split(':')[1]?.trim();

    // modelHash 校验
    if (!modelHash) {
      message.warning('请传入 modelHash');
      return;
    }

    // 模版校验
    const rowHeader = rows.splice(0, 1);

    if (rowHeader?.[0] !== '特征,类型,IV,分箱数,partyName,区间,数量,WOE') {
      message.warning('格式与导出的分箱不匹配');
      return;
    }

    rows.forEach((row, index) => {
      if (row) {
        let featureName;
        // row = x1,double,0.3,9,alice
        if (!row.startsWith(',,,,,')) {
          // cols = [x1, double, 0.3, 9, alice]
          const cols = row.split(',');

          featureName = cols[0];

          res.push({
            key: cols[0],
            feature: cols[0],
            isWoe: true,
            type: cols[1],
            iv: Number(cols[2]),
            binCount: parseInt(cols[3], 10),
            partyName: cols[4],
            bins: [],
          });
        } else {
          // row = ,,,,"(-inf, -0.4]",2,'-0.1'

          // str = "(-inf, -0.4]",2,'-0.1'
          let str = row.slice(5);

          if (str.includes('(') || str.includes('[')) {
            // str = "(-inf, -0.4]",2,'-0.1' => "(-inf* -0.4]",2,'-0.1'
            str = str.replace(',', '*');
          }

          // arr = ['"(-inf* -0.4]"', '2', "'-0.1'"]
          const arr = str.split(',');

          // label = '"(-inf* -0.4]"'
          let label = arr[0];

          if (label.startsWith('"')) {
            // label = "(-inf* -0.4]" => (-inf* -0.4]
            label = label.slice(1, label.length - 1);
          }

          // label = (-inf, -0.4]
          label = label.replace('*', ',');

          const tmp = res[res.length - 1];

          const totalCount = arr[1];

          const woe = arr[2];

          tmp.bins.push({
            key: `${index - 1}/${featureName}/${label}`,
            label,
            markForMerge: false,
            totalCount: parseInt(totalCount, 10),
            woe: Number(woe),
          });
        }
      }
    });

    if (res.length > 0) {
      return {
        modelHash,
        variableBins: res,
      };
    }
  };

  /**
   * 常规分箱 上传文件方法
   */
  const binningUploadHandler = (reader: any) => {
    const content = reader.result as string;
    const rows = content.split('\n').filter((str) => str !== '');

    // 空数据校验
    if (rows.length < 3) {
      message.warning('不能上传空数据');
      return;
    }

    const res: Record[] = [];

    const modelHashRow = rows.splice(0, 1);
    const modelHash = modelHashRow[0].split(':')[1]?.trim();

    // modelHash 校验
    if (!modelHash) {
      message.warning('请传入 modelHash');
      return;
    }

    const rowHeader = rows.splice(0, 1);

    // 模版校验
    if (rowHeader?.[0] !== '特征,类型,分箱数,partyName,序号,区间,数量') {
      message.warning('格式与导出的分箱不匹配');
      return;
    }

    rows.forEach((row, index) => {
      if (row) {
        let featureName;
        // row = x1,double,9,alice
        if (!row.startsWith(',,,,')) {
          // cols = [x1, double, 9]
          const cols = row.split(',');
          featureName = cols[0];
          res.push({
            key: cols[0],
            feature: cols[0],
            isWoe: false,
            type: cols[1],
            binCount: parseInt(cols[2], 10),
            partyName: cols[3],
            bins: [],
          });
        } else {
          // row = ,,,,0,"(-inf, -0.4]",2

          // str = 0,"(-inf, -0.4]",2
          let str = row.slice(4);

          str = str.replace(',', '*');

          // arr = [0,'"(-inf, -0.4]",2']
          const arr = str.split('*');

          const order = arr[0];

          // rest = '"(-inf, -0.4]",2'
          let rest = arr[1];
          // rest = '"(-inf* -0.4]",2'

          if (str.includes('(') || str.includes('[')) {
            rest = rest.replace(',', '*');
          }

          // restArr = ["(-inf* -0.4]", 2]
          const restArr = rest.split(',');

          // label = "(-inf, -0.4]"
          const label = restArr[0].replace('*', ',').replaceAll('"', '');
          // totalCount = 2
          const totalCount = restArr[1];

          const tmp = res[res.length - 1];

          tmp.bins.push({
            key: `${index - 1}/${featureName}/${label}`,
            order: parseInt(order, 10),
            label,
            markForMerge: false,
            totalCount: parseInt(totalCount, 10),
          });
        }
      }
    });

    if (res.length > 0) {
      return {
        modelHash,
        variableBins: res,
      };
    }
  };

  const uploadBinningTableData = (file: File) => {
    setCurrOperation(CurrOperationEnum.Upload);

    // 文件类型校验
    if (!/\.csv$/.test(file.name)) {
      message.error('请选择csv文件上传');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      let data;

      if (type === TableTypeEnum.WoeBinning) {
        data = woeBinningUploadHandler(reader);
      } else {
        data = binningUploadHandler(reader);
      }

      if (data && parametersData) {
        const isEqual = checkFeaturesIsEqual(
          parametersData.variableBins,
          data.variableBins,
        );

        if (!isEqual) {
          // 特征一致校验
          message.warning('请上传特征相同的分箱结果表！');
          return;
        } else {
          message.success('上传成功');
        }

        setParametersData(data);
        setSelectedRowKeys([]);
        init();
      }
    };

    reader.readAsText(file);

    return false;
  };

  return (
    <>
      <Upload action="" beforeUpload={uploadBinningTableData} showUploadList={false}>
        <span style={{ display: 'block-inline', paddingRight: 15 }}>
          <Button
            type="link"
            disabled={disabled}
            icon={<UploadOutlined />}
            className={styles.operationBtn}
            style={{ paddingRight: 5 }}
          >
            上传分箱
          </Button>
          <Tooltip title="仅支持上传导出过的分箱（csv 文件），文件中不支持手动修改 woe 等操作">
            <QuestionCircleOutlined />
          </Tooltip>
        </span>
      </Upload>
    </>
  );
};
