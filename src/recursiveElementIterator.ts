export default function * recursiveElementIterator(e: Element): Iterator<{ value?: Element, iterator?: any}> {
    let next = e.nextElementSibling;
    
    const first = e.firstElementChild;

    yield { value: e };

    if (first?.isConnected) {
        yield { iterator: recursiveElementIterator(first) }
    }

    while (next) {
        const current = next;
        next = next.nextElementSibling;
        yield { iterator: recursiveElementIterator(current) };
    }
}