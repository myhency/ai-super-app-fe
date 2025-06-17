/* eslint-disable @typescript-eslint/no-explicit-any */
import ModifierData from "@/lib/modifier-data";
import {CSSProperties, HTMLAttributes} from "react";
import injectCSS from "@/lib/inject-css";
import ExtendedCSSProperties from "@/lib/extended-css-properies";

let styleCounter = 0;

// 베이스 Modifier 클래스
export default abstract class BaseModifier<T extends BaseModifier<T>> {
    protected data: ModifierData;
    private styleId?: string;

    constructor(data: Partial<ModifierData> = {}) {
        this.data = {
            styles: data.styles || {},
            classes: data.classes || [],
            handlers: data.handlers || {},
            attributes: data.attributes || {},
            cssText: data.cssText,
            pseudoStyles: data.pseudoStyles || {},
            mediaQueries: data.mediaQueries || {},
            customCSS: data.customCSS
        };
    }

    protected abstract createInstance(data: Partial<ModifierData>): T;

    protected clone(updates: Partial<ModifierData>): T {
        return this.createInstance({
            styles: { ...this.data.styles, ...(updates.styles || {}) },
            classes: [...this.data.classes, ...(updates.classes || [])],
            handlers: { ...this.data.handlers, ...(updates.handlers || {}) },
            attributes: { ...this.data.attributes, ...(updates.attributes || {}) },
            cssText: updates.cssText || this.data.cssText,
            pseudoStyles: { ...this.data.pseudoStyles, ...(updates.pseudoStyles || {}) },
            mediaQueries: { ...this.data.mediaQueries, ...(updates.mediaQueries || {}) },
            customCSS: updates.customCSS || this.data.customCSS
        });
    }

    // 공통 메서드
    className(...classes: string[]): T {
        return this.clone({ classes });
    }

    id(id: string): T {
        return this.clone({ attributes: { id } });
    }

    attr(key: string, value: any): T {
        return this.clone({ attributes: { [key]: value } });
    }

    if(condition: boolean, modifier: (m: T) => T): T {
        return condition ? modifier(this as any as T) : this as any as T;
    }

    // Raw CSS 지원
    css(cssText: string): T {
        return this.clone({ cssText });
    }

    // 커스텀 CSS 규칙
    customCSS(css: string): T {
        return this.clone({ customCSS: css });
    }

    // 의사 클래스/요소
    pseudo(selector: string, styles: CSSProperties): T {
        return this.clone({
            pseudoStyles: {
                [selector]: styles
            }
        });
    }

    hover(styles: CSSProperties): T {
        return this.pseudo(':hover', styles);
    }

    focus(styles: CSSProperties): T {
        return this.pseudo(':focus', styles);
    }

    active(styles: CSSProperties): T {
        return this.pseudo(':active', styles);
    }

    before(styles: CSSProperties): T {
        return this.pseudo('::before', styles);
    }

    after(styles: CSSProperties): T {
        return this.pseudo('::after', styles);
    }

    // 미디어 쿼리
    media(query: string, styles: CSSProperties): T {
        return this.clone({
            mediaQueries: {
                [query]: styles
            }
        });
    }

    sm(styles: CSSProperties): T {
        return this.media('@media (min-width: 640px)', styles);
    }

    md(styles: CSSProperties): T {
        return this.media('@media (min-width: 768px)', styles);
    }

    lg(styles: CSSProperties): T {
        return this.media('@media (min-width: 1024px)', styles);
    }

    xl(styles: CSSProperties): T {
        return this.media('@media (min-width: 1280px)', styles);
    }

    generateClassName(): string {
        if (!this.styleId) {
            this.styleId = `modifier-${++styleCounter}`;

            let css = '';

            // Pseudo styles - null 체크 추가
            const pseudoStyles = this.data.pseudoStyles;
            if (pseudoStyles && Object.keys(pseudoStyles).length > 0) {
                Object.entries(pseudoStyles).forEach(([selector, styles]) => {
                    if (styles) {
                        const cssProps = Object.entries(styles)
                            .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
                            .join('; ');
                        css += `.${this.styleId}${selector} { ${cssProps} }\n`;
                    }
                });
            }

            // Media queries - null 체크 추가
            const mediaQueries = this.data.mediaQueries;
            if (mediaQueries && Object.keys(mediaQueries).length > 0) {
                Object.entries(mediaQueries).forEach(([query, styles]) => {
                    if (styles) {
                        const cssProps = Object.entries(styles)
                            .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
                            .join('; ');
                        css += `${query} { .${this.styleId} { ${cssProps} } }\n`;
                    }
                });
            }

            // Custom CSS
            if (this.data.customCSS) {
                css += this.data.customCSS.replace(/&/g, `.${this.styleId}`);
            }

            if (css) {
                injectCSS(css, this.styleId);
            }
        }

        return this.styleId;
    }

    toProps(): HTMLAttributes<HTMLElement> & { style: ExtendedCSSProperties } {
        const classes = [...this.data.classes];

        // Dynamic className 생성
        const hasAdvancedStyles = (
            this.data.pseudoStyles && Object.keys(this.data.pseudoStyles).length > 0
        ) || (
            this.data.mediaQueries && Object.keys(this.data.mediaQueries).length > 0
        ) || this.data.customCSS;

        if (hasAdvancedStyles) {
            classes.push(this.generateClassName());
        }

        const style: ExtendedCSSProperties = { ...this.data.styles };

        if (this.data.cssText) {
            style.cssText = this.data.cssText;
        }

        return {
            style,
            className: classes.join(' '),
            ...this.data.handlers,
            ...this.data.attributes
        };
    }

    getData(): ModifierData {
        return this.data;
    }
}
