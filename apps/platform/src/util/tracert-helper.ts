export type TracertInfo = {
  onlineLink: string;
  localLink: string;
  localStorageKey: string;
};

export function getImgLink(tracertInfo: TracertInfo) {
  const storageKey = tracertInfo.localStorageKey;
  const storageVal = localStorage.getItem(storageKey);

  let imgLink = '';

  if (!storageVal) {
    // 问题：首次任务，要是断网，就获取不到在线图片，无法 log（在线图片 = log）
    // 解决方式：
    // 断网的时候，拿本地图片，但不会到 localstorage
    // 只有获取在线图片，才标记 localstorage
    const img = new Image();
    img.src = tracertInfo.onlineLink;

    img.onerror = () => {
      imgLink = tracertInfo.localLink;
    };

    img.onload = () => {
      imgLink = tracertInfo.onlineLink;

      localStorage.setItem(storageKey, 'true');
    };
  } else {
    imgLink = tracertInfo.localLink;
  }

  return imgLink;
}
