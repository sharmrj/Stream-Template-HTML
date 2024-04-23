import { html } from './template.mjs';

const spanstyle = () => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(html`<style>span{color: green;}</style>`), 300);
    });
};

const soup = async () => { 
    return new Promise((resolve) => {
        setTimeout(() => resolve(html`${spanstyle}<span slot='food'>soup</span>`), 3000);
    });
}

const hungry = () => {
    return html`<div slot='hungry'>I'm very hungry</div>`;
};

const f = () => {
    return html`
        <template shadowrootmode='open'>
            <div>I'd really like some <slot name='food'></slot><div>
            <slot name="hungry"></slot>
        </template>
        ${hungry}
        ${soup}
        `;
};

const applyDSD = (template) => {
    const mode = template.getAttribute('shadowrootmode');
    if (!mode) return;
    const shadowRoot = template.parentElement.attachShadow({ mode });
    shadowRoot.appendChild(template.content.cloneNode(true));
    template.remove();
};

// TODO: sanitize HTML
export const streamToDom = async (p, xs, dsd = false) => {
    const doc = document.implementation.createHTMLDocument();
    // It's safe to use this in spite of the HTML spec warning
    // (https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html#document.write())
    // The documentation is correct that this is bad IF you're writing to an html document
    // while the [[parser is still running]].
    // This is perfectly fine since we're doing write on a detached document.
    doc.write('<div>');
    const root = doc.body.firstChild;
    p.appendChild(root);
    const observer = new MutationObserver((records) => {
        for (const record of records) {
            for (const node of record.addedNodes) {
                if (node instanceof HTMLElement && node.tagName === 'TEMPLATE')
                    applyDSD(node);
            }
        }
    });
    if (dsd) observer.observe(root, { childList: true, subtree: true });
    for await (const x of xs) {
      doc.write(x);
    }
    if (dsd) observer.disconnect();

};

export const test = async (xs) => {
    for await (const x of xs) {
        console.info(x);
    }
};


streamToDom(document.body, f(), true);
