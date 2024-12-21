# Async Dom Sanitizer

DOMParser.parse is a synchronous method, which leads to blocking of JavaScript, if you have any animation playing, sanitizing any html/svg text will basically introduce lags in animation.

In order to improve user experience, this package creates a hidden IFrame and performs sanitizes given text.

Most browsers runs IFRame on atleast separate thread if not spearpate process, this should atleast not block the main thread of the calling window.

# Usage

This script is released as a module.

```script

    import sanitize from "https://cdn.jsdelivr.net/npm/@social-mail/dom-sanitizer/index.min.js";

    sanitize(svg, "image/svg+xml").then((r) => {
        // `r` contains sanitized svg
    });

    sanitize(html, "text/html").then((r) => {
        // `r` contains sanitized html
    });

```