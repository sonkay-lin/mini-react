/**
 * 宿主环境 Container
 * 宿主环境指的是当前的运行环境比如：浏览器，app，服务端
 */
export type Container = Element;
export type Instance = Element;

//
// export const createInstance = (type: string, props: any): Instance => {
export const createInstance = (type: string): Instance => {
	const element = document.createElement(type);
	return element;
};

export const appendInitialChild = (parent: Instance | Container, child: Instance) => {
	parent.appendChild(child);
};

export const createTextInstance = (content: string) => {
	return document.createTextNode(content);
};

export const appendChildToContainer = appendInitialChild;
