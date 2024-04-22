import { html } from './template.mjs';

const spanstyle = () => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(html`<style>span{color: green;}</style>`), 300);
    });
};

const soup = async () => { 
    const style = await spanstyle()
    return new Promise((resolve) => {
        setTimeout(() => resolve(html`${style}<span> sooup </span>`), 3000);
    });
}

const hungry = () => {
    return html`<div>I'm very hungry</div>`;
};

const f = () => {
    return html`
        <div>I'd really like some ${soup}<div>
        ${hungry}
        `;
};

// TODO: sanitize HTML
export const streamToDom = async (p, xs) => {
    const doc = document.implementation.createHTMLDocument();
    // It's safe to use this in spite of the HTML spec warning
    // (https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html#document.write())
    // The documentation is correct that this is bad IF you're writing to an html document
    // while the [[parser is still running]].
    // This is perfectly fine since we're doing write on a detached document.
    doc.write('<div>');
    p.appendChild(doc.body.firstChild);
    for await (const x of xs) {
      doc.write(x);
    }
};

export const test = async (xs) => {
    for await (const x of xs) {
        console.info(x);
    }
};


// streamToDom(document.body, f());
