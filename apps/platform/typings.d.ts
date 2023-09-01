declare module '*.less' {
  const resource: { [key: string]: string };
  export = resource;
}

declare module '*.svg' {
  const ReactComponent: React.ReactComponent;
  export { ReactComponent };
}

declare module '*.gif';
declare module '*.png';
declare module '*.jpg';
