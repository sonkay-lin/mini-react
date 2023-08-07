export const FunctionComponent = 0;
export const HostRoot = 3; // 挂载的根节点
export const HostComponent = 5; // <div>
export const HostText = 6; // <div> 123 </div>

export type WorkTag = typeof FunctionComponent | typeof HostRoot | typeof HostComponent | typeof HostText;
