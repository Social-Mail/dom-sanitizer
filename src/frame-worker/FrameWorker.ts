
function setup(origin) {

    window.addEventListener("message", (e) => {
        if(e.origin !== origin) {
            return;
        }

        const { id, command, text } = e.data;

        try {
            switch(command) {
                case "sanitize-svg":
                    const result = sanitizeSvg(text);
                    e.source.postMessage({ id, result });
                    break;
            }
        } catch (error) {
            e.source.postMessage({ id, error: error.stack ?? error});
        }

    });

    function sanitizeSvg(text) {
        const parser = new DOMParser();
        const dom = parser.parseFromString(text, "image/svg+xml");

        const ignore = eventNames();

        for (const element of descendantElementsAndSelf(dom.documentElement)) {
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

    /** Non recursive iterator */
    function *descendantElementsAndSelf(e: HTMLElement): Generator<HTMLElement> {
        let current = recursiveElementIterator(e);
        const stack = [];

        let n = 0;

        for(;;) {
            const { done, value } = current.next();
            if (done) {
                if(!stack.length) {
                    return;
                }
                current = stack.pop();
                continue;
            }
            const { e, all } = value;
            if (e) {
                yield e;
                continue;
            }
            if (all) {
                stack.push(current);
                current = all;
                continue;
            }
            throw new Error("Invalid state");
        }
    }

    function * recursiveElementIterator(e: HTMLElement): Iterator<{ e?: HTMLElement, all?}> {
        let next = e.nextElementSibling as HTMLElement;
    
        const first = e.firstElementChild;
    
        yield { e };
    
        if (first?.isConnected) {
            yield { all: recursiveElementIterator(first as HTMLElement) }
        }
    
        while (next) {
            const current = next;
            next = next.nextElementSibling as HTMLElement;
            yield { all: recursiveElementIterator(current) };
        }
    
    }

    function eventNames() {
        return new Set([
            'onabort',
            'onafterprint',
            'onauxclick',
            'onbeforematch',
            'onbeforeprint',
            'onbeforetoggle',
            'onbeforeunload',
            'onblur',
            'oncancel',
            'oncanplay',
            'oncanplaythrough',
            'onchange',
            'onclick',
            'onclose',
            'oncontextlost',
            'oncontextmenu',
            'oncontextrestored',
            'oncopy',
            'oncuechange',
            'oncut',
            'ondblclick',
            'ondrag',
            'ondragend',
            'ondragenter',
            'ondragleave',
            'ondragover',
            'ondragstart',
            'ondrop',
            'ondurationchange',
            'onemptied',
            'onended',
            'onerror',
            'onfocus',
            'onformdata',
            'onhashchange',
            'oninput',
            'oninvalid',
            'onkeydown',
            'onkeypress',
            'onkeyup',
            'onlanguagechange',
            'onload',
            'onloadeddata',
            'onloadedmetadata',
            'onloadstart',
            'onmessage',
            'onmessageerror',
            'onmousedown',
            'onmouseenter',
            'onmouseleave',
            'onmousemove',
            'onmouseout',
            'onmouseover',
            'onmouseup',
            'onoffline',
            'ononline',
            'onpagehide',
            'onpageshow',
            'onpaste',
            'onpause',
            'onplay',
            'onplaying',
            'onpopstate',
            'onprogress',
            'onratechange',
            'onrejectionhandled',
            'onreset',
            'onresize',
            'onscroll',
            'onscrollend',
            'onsecuritypolicyviolation',
            'onseeked',
            'onseeking',
            'onselect',
            'onslotchange',
            'onstalled',
            'onstorage',
            'onsubmit',
            'onsuspend',
            'ontimeupdate',
            'ontoggle',
            'onunhandledrejection',
            'onunload',
            'onvolumechange',
            'onwaiting',
            'onwheel'
        ]);
    }

}

export default class FrameWorker {

    frame: HTMLIFrameElement;

    constructor() {
        this.frame = document.createElement("iframe");
        this.frame.style.left = "-5px";
        this.frame.style.top = "-5px";
        this.frame.style.position = "fixed";
        this.frame.style.width = "1px";
        this.frame.style.height = "1px";

        this.frame.srcdoc = `
        <!doctype html>
        <html>
            <body>
            <script>
                (${setup})(${location.href});
            </script>
            </body>
        </html>
        `;

    }

}