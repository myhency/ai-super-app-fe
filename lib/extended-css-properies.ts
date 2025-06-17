/* eslint-disable @typescript-eslint/no-explicit-any */
// CSS 변수와 특수 속성을 위한 확장 타입
import {CSSProperties} from "react";

export default interface ExtendedCSSProperties extends CSSProperties {
    [key: string]: any;
}
