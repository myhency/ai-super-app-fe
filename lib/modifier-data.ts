/* eslint-disable @typescript-eslint/no-explicit-any */
// 기본 Modifier 데이터 타입
import ExtendedCSSProperties from "@/lib/extended-css-properies";
import {CSSProperties} from "react";

export default interface ModifierData {
    styles: ExtendedCSSProperties;
    classes: string[];
    handlers: Record<string, any>;
    attributes: Record<string, any>;
    cssText?: string;
    pseudoStyles: Record<string, CSSProperties>;
    mediaQueries: Record<string, CSSProperties>;
    customCSS?: string;
}
