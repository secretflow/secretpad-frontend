import type { IDetectedMap } from 'jschardet';
import jschardet from 'jschardet';
import Papa from 'papaparse';

const checkEncoding = (base64Str: string) => {
  const str = atob(base64Str.split(';base64,')[1]); // atob  方法 Window 对象 定义和用法 atob() 方法用于解码使用 base-64 编码的字符
  let encoding: IDetectedMap | string = jschardet.detect(str);
  encoding = encoding.encoding;
  if (encoding === 'windows-1252') {
    encoding = 'GB2312';
  }
  if (encoding === 'ISO-8859-2') {
    encoding = 'GB2312';
  }
  return encoding;
};

// const queryMarkRepeatValue = (data: CSVItem[]) => {
//   const colNames = data.map((item: any) => item?.col_name);
//   const sameColNames = filter(colNames, (val, i, iteratee) =>
//     includes(iteratee, val, i + 1),
//   );
//   return data.map((item: any) => {
//     if (sameColNames.includes(item?.col_name)) {
//       return {
//         ...item,
//         isError: true,
//       };
//     }
//     return { ...item, isError: false };
//   });
// };

export const parseDataTableColumns = (csvData: Papa.ParseResult<any[]>) => {
  const { meta, data } = csvData;
  const { fields = [] } = meta;
  const parseResult = fields.map((field: any) => {
    const dataItem = data[0];
    if (!dataItem) return { col: field, type: 'float' };
    let type = 'float';
    if (Number.isInteger(Number(dataItem[field]))) {
      type = 'int';
    } else if (!isNaN(Number(dataItem[field]))) {
      type = 'float';
    } else {
      type = 'str';
    }
    return {
      type,
      col: field,
    };
  });

  return parseResult;
};

export const analysisCsv = async (
  originFileObj: any,
  limit?: boolean,
): Promise<Papa.ParseResult<any[]>> => {
  const fReader = new FileReader();
  fReader.readAsDataURL(originFileObj.slice(0, 200)); //  readAsDataURL 读取本地文件 获得的是一个base64值
  return new Promise((resolve, reject) => {
    fReader.onload = (evt) => {
      // 读取文件成功
      const data = evt?.target?.result;
      const encoding = typeof data === 'string' ? checkEncoding(data) : '';

      const parseOptions: Papa.ParseLocalConfig = {
        encoding,
        delimiter: ',',
        complete: (csvData: Papa.ParseResult<any[]>) => {
          return;
        },
        chunk: function (results: any) {
          resolve(results);
        },
        header: true,
      };

      if (limit) {
        parseOptions.preview = 5;
      }

      Papa.parse(originFileObj, parseOptions);
    };
    fReader.onerror = () => {
      reject();
    };

    // 读取本地文件超时
    setTimeout(() => {
      reject();
    }, 5000);
  });
};

export function fetchProgress(
  url: string,
  opts: any = {},
  onProgress: any,
): Promise<any> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(opts.method || 'get', url);
    for (const key in opts.headers || {}) {
      xhr.setRequestHeader(key, opts.headers[key]);
    }

    xhr.onload = (e: any) => resolve(JSON.parse(e.target.responseText));
    xhr.onerror = reject;
    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = onProgress; //上传
    }
    if ('onprogerss' in xhr && onProgress) {
      xhr.onprogress = onProgress; //下载
    }
    xhr.send(opts.body);
  });
}
