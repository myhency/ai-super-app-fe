/* eslint-disable @typescript-eslint/no-explicit-any */
// 통합 Modifier 클래스
import ModifierData from "@/lib/modifier-data";
import BaseModifier from "@/lib/base-modifier";
import LayoutModifier from "./layout-modifier";
import DesignModifier from "@/lib/design-modifier";
import EventModifier from "@/lib/event-modifier";
import {HTMLAttributes} from "react";
import ExtendedCSSProperties from "@/lib/extended-css-properies";

export default class Modifier {
    private readonly data: ModifierData;

    constructor(data: Partial<ModifierData> = {}) {
        this.data = {
            styles: data.styles || {},
            classes: data.classes || [],
            handlers: data.handlers || {},
            attributes: data.attributes || {},
            pseudoStyles: data.pseudoStyles || {},
            mediaQueries: data.mediaQueries || {},
            customCSS: data.customCSS
        };
    }

    static from(modifier: BaseModifier<any> | Modifier): Modifier {
        if (modifier instanceof Modifier) {
            return modifier;
        }
        return new Modifier(modifier.getData());
    }

    layout(): LayoutModifier {
        return new LayoutModifier(this.data);
    }

    design(): DesignModifier {
        return new DesignModifier(this.data);
    }

    event(): EventModifier {
        return new EventModifier(this.data);
    }

    merge(...modifiers: Array<BaseModifier<any> | Modifier>): Modifier {
        let mergedData = { ...this.data };

        for (const modifier of modifiers) {
            const data = modifier instanceof Modifier
                ? modifier.data
                : modifier.getData();

            mergedData = {
                styles: { ...mergedData.styles, ...data.styles },
                classes: [...mergedData.classes, ...data.classes],
                handlers: { ...mergedData.handlers, ...data.handlers },
                attributes: { ...mergedData.attributes, ...data.attributes },
                pseudoStyles: { ...mergedData.pseudoStyles, ...data.pseudoStyles },
                mediaQueries: { ...mergedData.mediaQueries, ...data.mediaQueries },
                customCSS: (mergedData.customCSS || '') + (data.customCSS || '')
            };
        }

        return new Modifier(mergedData);
    }

    // 기존 modifier에서 특정 스타일만 오버라이드
    override(overrides: Partial<ModifierData>): Modifier {
        return new Modifier({
            styles: { ...this.data.styles, ...(overrides.styles || {}) },
            classes: [...this.data.classes, ...(overrides.classes || [])],
            handlers: { ...this.data.handlers, ...(overrides.handlers || {}) },
            attributes: { ...this.data.attributes, ...(overrides.attributes || {}) },
            pseudoStyles: { ...this.data.pseudoStyles, ...(overrides.pseudoStyles || {}) },
            mediaQueries: { ...this.data.mediaQueries, ...(overrides.mediaQueries || {}) },
            customCSS: (this.data.customCSS || '') + (overrides.customCSS || '')
        });
    }

    // 특정 스타일 제거
    omit(...keys: string[]): Modifier {
        const newStyles = { ...this.data.styles };
        keys.forEach(key => delete newStyles[key]);

        return new Modifier({
            ...this.data,
            styles: newStyles
        });
    }

    toProps(): HTMLAttributes<HTMLElement> & { style: ExtendedCSSProperties } {
        return new LayoutModifier(this.data).toProps();
    }

    getData(): ModifierData {
        return this.data;
    }
}