export default function * recursiveElementIterator(e: HTMLElement): Iterator<{ value?: HTMLElement, iterator?: any}> {
    let next = e.nextElementSibling as HTMLElement;
    
    const first = e.firstElementChild;

    yield { value: e };

    if (first?.isConnected) {
        yield { iterator: recursiveElementIterator(first as HTMLElement) }
    }

    while (next) {
        const current = next;
        next = next.nextElementSibling as HTMLElement;
        yield { iterator: recursiveElementIterator(current) };
    }
}