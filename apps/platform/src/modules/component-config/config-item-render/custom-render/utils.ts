import { parse } from 'query-string';
import { useEffect } from 'react';
import { useLocation } from 'umi';

import { getGraphNodeOutput } from '@/services/secretpad/GraphController';
import { getProjectDatatable } from '@/services/secretpad/ProjectController';

import type { IDataTable, IOutputDataTable } from './types';

export const useCols = (
  setter: (val: { colName: string; colType: string }[]) => void,
  fromTable: IOutputDataTable | undefined,
  tables: IDataTable[],
) => {
  const { search } = useLocation();
  const { projectId, dagId } = parse(search) as { projectId: string; dagId: string };

  const getColumns = async (tableList) => {
    const tableInfos: { colName: string; colType: string }[] = [];
    await Promise.all(
      tableList.map(async (s) => {
        if (!s) return;
        const { datatableId, nodeId, graphNodeId } = s;
        const tableFields: { colName: string; colType: string }[] = [];
        // const tableColInfo: { colName: string; colType: string }[] = [];
        if (!nodeId && graphNodeId) {
          const { data } = await getGraphNodeOutput({
            projectId,
            graphId: dagId,
            graphNodeId,
            outputId: datatableId,
          });

          if (data?.meta?.rows?.length) {
            data.meta.rows.forEach(
              ({ fieldTypes, fields }: { fieldTypes: string; fields: string }) => {
                if (fieldTypes && fields) {
                  const fieldList = fields.split(',');
                  const fieldTypeList = fieldTypes.split(',');
                  tableFields.push(
                    ...fieldList.map((f, i) => ({
                      colName: f,
                      colType: fieldTypeList[i],
                    })),
                  );

                  // tableFields.push(...fieldList);
                }
              },
            );
          }
        } else {
          const { data } = await getProjectDatatable({
            datatableId,
            nodeId,
            projectId,
            type: 'CSV',
          });
          if (!data) return;
          const { configs } = data;

          configs.map((c) => {
            tableFields.push({ colName: c.colName, colType: c.colType });
          });

          // tableFields.push(...colsName);
        }

        // tableColInfos.push(...tableColInfo);
        tableInfos.push(...tableFields);
      }),
    );

    return tableInfos;
  };

  const fetchTotalCols = async () => {
    const fromTableCols = await getColumns([fromTable]);
    if (fromTableCols.length < 1) {
      const inputTableCols = await getColumns(tables);
      setter(inputTableCols);
      return;
    }
    setter(fromTableCols);

    return;
  };

  useEffect(() => {
    fetchTotalCols();
  }, [fromTable, tables]);
};
