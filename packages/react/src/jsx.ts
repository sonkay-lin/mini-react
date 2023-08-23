import { REACT_ELEMENT_TYPE, REACT_FRAGMENT_TYPE } from 'shared/ReactSymbols';
import { Key, Props, ReactElementType, Ref, ElementType } from 'shared/ReactTypes';

const ReactElement = function (type: ElementType, key: Key, ref: Ref, props: Props): ReactElementType {
	const element = {
		$$typeof: REACT_ELEMENT_TYPE,
		type,
		key,
		ref,
		props,
		__mark: 'lsk'
	};
	return element;
};

export const Fragment = REACT_FRAGMENT_TYPE

export const jsxDEV = (type: ElementType, config: any): ReactElementType => {
	let key: Key = null;
	let ref: Ref = null;
	const props: Props = {};
	for (const prop in config) {
		const val = config[prop];

		//
		if (prop === 'key') {
			if (val !== undefined) {
				key = '' + val;
			}
			continue;
		}

		if (prop === 'ref') {
			if (val !== undefined) {
				ref = val;
			}
			continue;
		}

		if ({}.hasOwnProperty.call(config, prop)) {
			props[prop] = val;
		}
	}

	// const maybeChildrenLength = maybeChildren.length;
	// if (maybeChildrenLength) {
	// 	if (maybeChildrenLength.length === 1) {
	// 		props.children = maybeChildren[0];
	// 	} else {
	// 		props.children = maybeChildren;
	// 	}
	// }

	return ReactElement(type, key, ref, props);
};

// 实际中react dev和生产环境的jsx不一样