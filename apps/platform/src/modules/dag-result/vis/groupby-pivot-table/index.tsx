import { DownloadOutlined } from '@ant-design/icons';
import type { SpreadSheet } from '@antv/s2';
import { SheetComponent, Switcher } from '@antv/s2-react';
import type { RadioChangeEvent } from 'antd';
import { Radio, Tabs, Button } from 'antd';
import { useState, useEffect, useRef, useMemo } from 'react';

import { getTabsName } from '../../result-report';
import { OutputTable } from '../output-table';
import type { ResultOriginData } from '../typing';
import '@antv/s2-react/dist/style.min.css';

import styles from './index.less';

export const GroupPivotTable = (prop: { data: any; id: string }) => {
  const { data, id } = prop;
  const [sheetType, setSheetType] = useState('group');
  const [activeTab, setActiveTab] = useState('0');

  useEffect(() => {
    setActiveTab('0');
    setSheetType('group');
  }, [id]);
  return (
    <div>
      <Radio.Group
        value={sheetType}
        defaultValue={sheetType}
        onChange={(e: RadioChangeEvent) => setSheetType(e.target.value)}
      >
        <Radio.Button value="group">分组结果表</Radio.Button>
        <Radio.Button value="cross">交叉透视表</Radio.Button>
      </Radio.Group>
      <div className={styles.tableTab}>
        <Tabs
          className={styles.tabsTable}
          defaultActiveKey="0"
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
          items={(data || []).map((item: ResultOriginData, index: number) => {
            return {
              label: getTabsName(item.name, index),
              key: `${index}`,
              children: (
                <div key={index}>
                  {sheetType === 'group' && <OutputTable tableInfo={item} name={id} />}
                  {sheetType === 'cross' && (
                    <PivotTable data={item} active={activeTab} />
                  )}
                </div>
              ),
            };
          })}
        />
      </div>
    </div>
  );
};

export const PivotTable = (props: { data: any; active: string }) => {
  const { data, active } = props;
  const tableRef = useRef<SpreadSheet | null>(null);

  const [tableOptions, setTableOptions] = useState({});
  useEffect(() => {
    tableRef?.current?.tooltip.destroy();
    if (document.fullscreenElement) {
      const fullscreenOption = {
        ...tableOptions,
        ...{
          width: 1300,
          tooltip: {
            getContainer: () => {
              return (
                document.fullscreenElement
                  ? document.getElementsByClassName(
                      document.fullscreenElement.className,
                    )[0] || document.body
                  : document.body
              ) as HTMLElement;
            },
          },
        },
      };
      setTableOptions(fullscreenOption);
    } else {
      setTableOptions({
        ...tableOptions,
        ...{
          width: 550,
          tooltip: {
            getContainer: () => {
              return (
                document.fullscreenElement
                  ? document.getElementsByClassName(
                      document.fullscreenElement.className,
                    )[0] || document.body
                  : document.body
              ) as HTMLElement;
            },
          },
        },
      });
    }
  }, [document.fullscreenElement]);

  useEffect(() => {
    tableRef?.current?.tooltip.destroy();
  }, [active]);
  const byCols = useMemo(() => {
    return getByCols(data) || [];
  }, [data]);

  // 生成 switcher 所需要的 fields 结构
  const generateSwitcherFields = (updatedResult) => {
    return {
      rows: {
        items: updatedResult.rows.items.map((i) => ({ ...i, checked: true })),
        selectable: false,
        allowEmpty: false,
      },
      columns: { items: updatedResult.columns.items, selectable: true },
      values: {
        selectable: false,
        items: updatedResult.values.items,
      },
    };
  };

  const [switcherFields, setSwitcherFields] = useState({});
  useEffect(() => {
    setSwitcherFields({
      rows: {
        allowEmpty: false,
        selectable: false,
        items: [{ id: byCols[0], checked: true }],
      },
      columns: {
        selectable: true,
        items:
          byCols.length > 1
            ? byCols
                .slice(1)
                .map((i, index) =>
                  index > 0 ? { id: i, checked: false } : { id: i, checked: true },
                )
            : [{ id: byCols[0], checked: true }],
      },
      values: {
        selectable: false,
        items: [{ id: 'number' }],
      },
    });

    setFieldConfig(
      byCols.length < 2
        ? { rows: ['number'], columns: byCols }
        : { rows: [byCols[0]], columns: [byCols[1]] },
    );

    const defaultS2Option = {
      width: document.fullscreenElement ? 1300 : 550,
      height: 480,
      showDefaultHeaderActionIcon: true,
      tooltip: {
        getContainer: () => {
          return (
            document.fullscreenElement
              ? document.getElementsByClassName(
                  document.fullscreenElement.className,
                )[0] || document.body
              : document.body
          ) as HTMLElement;
        },
      },
      conditions: {
        // text: [
        //   {
        //     field: 'number',
        //     mapping() {
        //       return {
        //         fill: '#',
        //       };
        //     },
        //   },
        // ],
        background: [
          {
            field: 'number',
            mapping(value: string | number) {
              if (byCols.length === 1) return;
              const backgroundColor = getTargetColor(
                value,
                Math.max(...numberList),
                Math.min(...numberList),
              );
              return {
                fill: backgroundColor as string,
              };
            },
          },
          // ...conditionsBackground,
        ],
      },
      style: {
        // 设置高度
        colCfg: {
          // height: 48,
          // 隐藏数值 (数值挂列头时生效, 即 s2DataConfig.fields.values)
          // hideMeasureColumn: true,
        },
      },
      interaction: {
        copyWithFormat: true,
      },
    };

    setTableOptions(defaultS2Option);
  }, [byCols]);

  const [fieldConfig, setFieldConfig] = useState({});
  const onSubmit = (result) => {
    const { rows, columns } = result;

    const rowItems = rows.items?.map((i) => i.id);
    const colItems = columns.items.filter((i) => i.checked).map((i) => i.id);

    setFieldConfig({ rows: rowItems, columns: colItems });
    setSwitcherFields(generateSwitcherFields(result));
  };

  if (byCols.length < 1) {
    return <></>;
  }

  const table = transformPivotTableData(data, fieldConfig.columns?.[1]);
  const numberList = getNumberList(table);
  const s2DataConfig = {
    describe: '标准交叉表数据。',
    fields: {
      ...fieldConfig,
      values: ['number'],
      valueInCols: true,
    },
    meta: [
      {
        field: 'number',
        name: data.name,
        formatter: (value) => value || 0,
      },
    ],
    data: table,
  };

  return (
    <>
      <SheetComponent
        dataCfg={s2DataConfig}
        themeCfg={{ name: 'gray' }}
        options={tableOptions}
        sheetType="pivot"
        adaptive={false}
        onMounted={(s) => {
          tableRef.current = s;
        }}
        header={{
          className: styles.pivotHeader,
          exportCfg: {
            open: true,
            icon: (
              <Button
                type="link"
                className={styles.customBtn}
                size="small"
                icon={<DownloadOutlined />}
              >
                导出数据
              </Button>
            ),
            dropdown: {
              getPopupContainer: () => {
                return (
                  document.fullscreenElement
                    ? document.getElementsByClassName(
                        document.fullscreenElement.className,
                      )[0] || document.body
                    : document.body
                ) as HTMLElement;
              },
            },
          },
          extra: <PaletteLegend />,
        }}
      />
      {byCols.length > 1 && (
        <div className={styles.switcherButton}>
          <Switcher
            {...switcherFields}
            onSubmit={onSubmit}
            popover={{
              overlayClassName: styles.switcherPopover,
              getPopupContainer: () => {
                return (
                  document.fullscreenElement
                    ? document.getElementsByClassName(
                        document.fullscreenElement.className,
                      )[0] || document.body
                    : document.body
                ) as HTMLElement;
              },
            }}
          />
        </div>
      )}
    </>
  );
};

const getByCols = (resultObj: ResultOriginData) => {
  const result = resultObj.divs[0]?.children[0];
  if (result?.type === 'table') {
    const headers = result.table.headers;
    return headers
      .filter((header) => header.desc === 'key')
      .map((header) => header.name);
  }
};

const transformPivotTableData = (resultObj: ResultOriginData, col: string) => {
  const result = resultObj.divs[0]?.children[0];
  const arr: { [key]: string }[] = [];
  if (result?.type === 'table') {
    const headers = result.table.headers;
    const NotRowLength = headers.filter((header) => header.desc === 'value').length;
    result.table.rows.forEach((row) => {
      const items = row.items;
      const objList = Array.from(
        { length: NotRowLength },
        () => ({} as Record<string, string>),
      );
      let onjListIndex = 0;
      items.forEach((item, index) => {
        if (headers[index].desc === 'key') {
          const name = headers[index].name;
          const type = headers[index].type;
          if (type === 'str') {
            objList.forEach((obj) => {
              obj[name] = item.s;
            });
          }
        } else {
          const type = headers[index].type;
          if (type === 'str') {
            objList[onjListIndex].number = item.s;
          }
          onjListIndex++;
        }
      });
      arr.push(...objList);
    });
  }
  return arr;
};

const getNumberList = (data: { number?: string }[]) => {
  return data.map((item) => Math.floor(Number(item?.number || 0)));
};
const PALETTE_COLORS = [
  '#ffffff',
  '#f7fcf5',
  '#e5f4e0',
  '#c7e9bf',
  '#a1d89b',
  '#74c476',
  '#41ab5d',
  '#228b44',
  '#016d2c',
  '#00441b',
];

const PaletteLegend = () => {
  return (
    <div className={styles['palette-legend']}>
      <div className={styles['palette-limit']}>MIN</div>
      {PALETTE_COLORS.map((color) => (
        <span
          key={color}
          className={styles['palette-color']}
          style={{ background: color }}
        />
      ))}
      <div className={styles['palette-limit']}>MAX</div>
    </div>
  );
};

// 自定义颜色
const getTargetColor = (value: number | string, max: number, min: number) => {
  if (isNaN(Number(value))) {
    return '#ffffff';
  }
  const val = Math.floor(Number(value));
  const range = max - min;
  const interval = range / 10;
  const colors = PALETTE_COLORS;
  const index = Math.floor((val - min) / interval);
  if (index < 0 || isNaN(index)) {
    // 如果小于最小值，返回第一种颜色
    return colors[0];
  } else if (index >= colors.length) {
    // 如果大于等于最大值，返回最后一种颜色
    return colors[colors.length - 1];
  } else {
    // 返回对应的颜色
    return colors[index];
  }
};
