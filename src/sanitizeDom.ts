import eventNames from "./eventNames.js";
import { flattenRecursiveIterator } from "./flattenRecursiveIterator.js";
import recursiveElementIterator from "./recursiveElementIterator.js";

export default function sanitizeDom(text: string, type: DOMParserSupportedType) {

    const parser = new DOMParser();
    const dom = parser.parseFromString(text, type);

    const ignore = eventNames();

    const ri = recursiveElementIterator(dom.documentElement);

    for (const element of flattenRecursiveIterator(ri)) {

        if (/^(script|iframe)$/i.test(element.tagName)) {
            element.remove();
            continue;
        }
        const attributes = element.attributes;
        const deleteNames = [] as string[];
        for (let index = 0; index < attributes.length; index++) {
            const a = attributes.item(index);
            if( ignore.has(a.name.toLowerCase())) {
                deleteNames.push(a.name);
            }
        }

        for (const a of deleteNames) {
            attributes.removeNamedItem(a);
        }

    }
    return dom.documentElement.outerHTML;

}