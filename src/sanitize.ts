import eventNames from "./eventNames.js";
import { flattenRecursiveIterator } from "./flattenRecursiveIterator.js";
import recursiveElementIterator from "./recursiveDescendentIterator.js";
import sanitizeDom from "./sanitizeDom.js";

function runInFrame(origin) {

    window.addEventListener("message", (e) => {

        if(e.origin !== origin) {
            return;
        }

        const { id, command, type, text } = e.data;

        try {
            switch(command) {
                case "sanitize":
                    const result = sanitizeDom(text, type);
                    e.source.postMessage({ id, result });
                    break;
            }
        } catch (error) {
            console.error(error);
            e.source.postMessage({ id, error: error.stack ?? error});
        }

    });

}

export default async function sanitize(text: string, type: "image/svg+xml" | "text/html") {
    const frame = document.createElement("iframe");
    frame.style.left = "-5px";
    frame.style.top = "-5px";
    frame.style.position = "fixed";
    frame.style.width = "1px";
    frame.style.height = "1px";
    document.body.appendChild(frame);

    const contentLoadedPromise = new Promise<void>((resolve) => {
        frame.onload = () => {
            frame.onload = null;
            resolve();
        }
    });

    frame.srcdoc = `
    <!doctype html>
    <html>
        <body>
        <script>
            ${flattenRecursiveIterator};
            ${recursiveElementIterator};
            ${eventNames};
            ${sanitizeDom}
            (${runInFrame})(${ JSON.stringify(location.origin) });
        </script>
        </body>
    </html>
    `;

    await contentLoadedPromise;

    const id = window?.crypto?.randomUUID?.() ?? Date.now();

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
        frame.contentWindow.postMessage({ id,  command: "sanitize", text, type }, "*");
    });

}
