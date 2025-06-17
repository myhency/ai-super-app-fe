const injectedStyles = new Map<string, HTMLStyleElement>();

export default function injectCSS(css: string, id: string): void {
    if (injectedStyles.has(id)) return;

    const style = document.createElement('style');
    style.textContent = css;
    style.setAttribute('data-app-style', id);
    document.head.appendChild(style);
    injectedStyles.set(id, style);
}