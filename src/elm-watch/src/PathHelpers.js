import * as fs from "fs";
import * as path from "path";
import { getSetSingleton, join } from "./Helpers.js";
import { isNonEmptyArray, mapNonEmptyArray, } from "./NonEmptyArray.js";
export function absolutePathFromString(from, ...pathStrings) {
    return {
        tag: "AbsolutePath",
        absolutePath: path.resolve(from.absolutePath, ...pathStrings),
    };
}
export function absoluteDirname({ absolutePath }) {
    return {
        tag: "AbsolutePath",
        absolutePath: path.dirname(absolutePath),
    };
}
/**
 * Note that this can throw fs errors.
 */
export function absoluteRealpath({ absolutePath }) {
    return {
        tag: "AbsolutePath",
        absolutePath: fs.realpathSync(absolutePath),
    };
}
export function findClosest(name, absoluteDir) {
    const dir = absoluteDir.absolutePath;
    const entry = path.join(dir, name);
    return fs.existsSync(entry)
        ? { tag: "AbsolutePath", absolutePath: entry }
        : dir === path.parse(dir).root
            ? undefined
            : findClosest(name, absoluteDirname(absoluteDir));
}
export function longestCommonAncestorPath(paths) {
    const pathArrays = mapNonEmptyArray(paths, ({ absolutePath }) => absolutePath.split(path.sep));
    const length = Math.min(...pathArrays.map((array) => array.length));
    const commonSegments = [];
    for (let index = 0; index < length; index++) {
        const segmentsAtIndex = new Set(pathArrays.map((array) => array[index]));
        const uniqueSegment = getSetSingleton(segmentsAtIndex);
        if (uniqueSegment === undefined) {
            break;
        }
        commonSegments.push(uniqueSegment);
    }
    return isNonEmptyArray(commonSegments)
        ? { tag: "AbsolutePath", absolutePath: join(commonSegments, path.sep) }
        : // On Windows, a `C:` path and a `D:` path has no common ancestor.
        // istanbul ignore next
        undefined;
}
