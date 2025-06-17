/* eslint-disable @typescript-eslint/no-explicit-any */
// 특화된 컴포넌트 생성을 위한 HOC
import ModifiableProps from "@/lib/modifiable-props";
import Modifier from "@/lib/modifier";
import BaseModifier from "@/lib/base-modifier";
import React from "react";

export default function withDefaultModifier<P extends ModifiableProps>(
    Component: React.ComponentType<P>,
    defaultModifier: Modifier | BaseModifier<any>
) {
    const WrappedComponent = React.forwardRef<any, P>((props, ref) => {
        const { modifier: userModifier, ...restProps } = props;

        // 기본 modifier와 사용자 modifier를 병합
        const finalModifier = userModifier
            ? Modifier.from(defaultModifier).merge(userModifier)
            : defaultModifier;

        return React.createElement(Component, {
            ...(restProps as unknown as P),
            modifier: finalModifier,
            ref
        });
    });

    // displayName 설정
    WrappedComponent.displayName = `withDefaultModifier(${Component.displayName || Component.name || 'Component'})`;

    return WrappedComponent;
}