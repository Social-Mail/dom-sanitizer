import eventNames from "./eventNames";

export function sanitizeElement(element: Element, ignore = eventNames()) {
    // this is sanitization logic
    if (/^(script|iframe)$/i.test(element.tagName)) {
       element.remove();
       return null;
   } else {
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
   return element;
}
