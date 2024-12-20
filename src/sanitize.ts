
function runInFrame(origin) {

    window.addEventListener("message", (e) => {
        if(e.origin !== origin) {
            return;
        }

        const { id, command, type, text } = e.data;

        try {
            switch(command) {
                case "sanitize":
                    const result = process(text, type);
                    e.source.postMessage({ id, result });
                    break;
            }
        } catch (error) {
            e.source.postMessage({ id, error: error.stack ?? error});
        }

    });

    function process(text, type) {
        const parser = new DOMParser();
        const dom = parser.parseFromString(text, type);

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

export default async function sanitize(text: string, type: "image/svg+xml" | "text/html") {
    const frame = document.createElement("iframe");
    frame.style.left = "-5px";
    frame.style.top = "-5px";
    frame.style.position = "fixed";
    frame.style.width = "1px";
    frame.style.height = "1px";
    document.body.appendChild(frame);

    frame.srcdoc = `
    <!doctype html>
    <html>
        <body>
        <script>
            (${runInFrame})(${location.href});
        </script>
        </body>
    </html>
    `;

    const id = crypto.randomUUID();

    return new Promise((resolve, reject) => {
        const eh = (e: MessageEvent) => {
            const { id: rID, result, error } = e.data;
            if (rID === id) {
                window.removeEventListener("message", eh);
                frame.remove();
                if (error) {
                    reject(error);
                    return;
                }
                resolve(result);
            }
        };
        window.addEventListener("message", eh);
        frame.contentWindow.postMessage({ id,  command: "sanitize", text });
    });

}
