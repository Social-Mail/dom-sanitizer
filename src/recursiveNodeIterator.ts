export default function * recursiveNodeIterator(e: Node): Iterator<{ value?: Node, iterator?: any}> {
    let next = e.nextSibling as Node;
    
    const first = e.firstChild;

    yield { value: e };

    if (first?.isConnected) {
        yield { iterator: recursiveNodeIterator(first as Node) }
    }

    while (next) {
        const current = next;
        next = next.nextSibling as Node;
        yield { iterator: recursiveNodeIterator(current) };
    }
}