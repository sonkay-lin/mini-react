import path from 'path';
import fs from 'fs';
import ts from 'rollup-plugin-typescript2';
import cjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';

const pgkPath = path.resolve(__dirname, '../../packages');
// 产物路径
const distPath = path.resolve(__dirname, '../../dist/node_modules');

export function resolvePkgPath(pkgName, isDist) {
	if (isDist) {
		return `${distPath}/${pkgName}`;
	}
	return `${pgkPath}/${pkgName}`;
}

export function getPackageJSON(pkgName) {
	const path = `${resolvePkgPath(pkgName)}/package.json`;
	const str = fs.readFileSync(path, { encoding: 'utf-8' });
	return JSON.parse(str);
}

// rollup 中的公共plugin
export function getBaseRollupPlugins({ alias = {
  __DEV__: true,
  preventAssignment: true
}, typescript = {} } = {}) {
	return [replace(alias), cjs(), ts(typescript)];
}
