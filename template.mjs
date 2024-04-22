// turns something that may be array of strings, functions that return streams of strings, or async functions that return streams of strings
// into strings.
// recursively run any nested components.
// the recursive form of this function pretty clean compared to an iterative form,
// however, since no browsers except safari implement tail call optimization (afaik), the
// iterative form may need to be implemented.
async function* run(component) {
    const compval = typeof component === 'function' ? await component() : component
    if (!compval) { // handle nullish
        yield '';
    } else if (typeof compval === 'object' && typeof compval[Symbol.iterator] === 'function') { // stream of strings
        for (const c in compval) {
            yield* run(c); 
        }
    } else if (typeof compval === 'object' && typeof compval[Symbol.asyncIterator] === 'function') { // async stream of strings
        for await (const c of compval) {
            yield* run(c);
        }
    } else { // regular old string
        yield compval;
    }
}

// strings is an array of strings
// components is an array of strings, functions that return streams of strings, or async functions that return streams of strings
async function* html_(strings, components) {
    // turn both the array of strings and the array of components into streams
    const strs = strings[Symbol.iterator]();
    const comps = components[Symbol.iterator]();

    while (true){
        const { done: strdone, value: strval } = strs.next();
        if (strdone) break;
        yield strval;

        const { done: compdone, value: compval } = comps.next();
        if (compdone) break;
        yield* run(compval);
    }
    // just in case we have a string after 
    // running out of components

    const { done, value } = strs.next();
    if (done) return;
    yield value;
}

export const html = (strings, ...components) => {
    return html_(strings, components);
};
