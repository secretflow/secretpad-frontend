declare module '*.less' {
  const resource: { [key: string]: string };
  export = resource;
}

declare module '*.svg' {
  const ReactComponent: React.ReactComponent;
  export { ReactComponent };
}

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.gif';
declare module '*.png';
declare module '*.jpg';
