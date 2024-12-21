export function * flattenRecursiveIterator<T>(current:Iterator<{ value?: T, iterator?: any }>): Iterator<T> {
    
    const stack = [];

    for(;;) {
        const { done, value: currentValue } = current.next();
        if (done) {
            if(!stack.length) {
                return;
            }
            current = stack.pop();
            continue;
        }
        const { value, iterator } = currentValue;
        if (value) {
            yield value;
            continue;
        }
        if (iterator) {
            stack.push(current);
            current = iterator;
            continue;
        }
        throw new Error("Invalid state");
    }
}
