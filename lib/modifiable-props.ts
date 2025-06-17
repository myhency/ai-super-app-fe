/* eslint-disable @typescript-eslint/no-explicit-any */
// 컴포넌트 Props 타입
import Modifier from "@/lib/modifier";
import {ReactNode} from "react";
import BaseModifier from "@/lib/base-modifier";

export default interface ModifiableProps {
    modifier?: Modifier | BaseModifier<any>;
    children?: ReactNode;
}