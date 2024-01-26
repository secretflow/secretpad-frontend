interface CSVOptionsType {
  columnDelimiter?: string;
  lineDelimiter?: string;
  columnNames?: string[];
  name?: string;
}

function convertArrayToCSV(data: (string | number)[], options: CSVOptionsType): string {
  const { columnDelimiter = ',', lineDelimiter = '\n', columnNames = [] } = options;
  const CalcCsv = columnNames
    .concat(data as any)
    .reduce(
      (tempCSV, lineData: any) =>
        `${tempCSV}${lineData.join(columnDelimiter)}${lineDelimiter}`,
      '',
    );

  return CalcCsv;
}

export function downloadCSV(blob: Blob, name: any = 'data'): void {
  const fileName = `${name}.csv`;
  const data = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', data);
  link.setAttribute('download', fileName);
  link.click();
}

export function csv(data: (string | number)[], options: CSVOptionsType = {}): void {
  if (!data.length) {
    return;
  }
  const csvArray = convertArrayToCSV(data, options);
  if (csvArray) {
    const blob = new Blob([`\uFEFF${csvArray}`], {
      type: 'text/csv; charset=utf-8',
    });
    downloadCSV(blob, options.name);
  }
}
