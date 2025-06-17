// 헬퍼 함수들
import Modifier from "@/lib/modifier";
import LayoutModifier from "@/lib/layout-modifier";
import DesignModifier from "@/lib/design-modifier";
import AdvancedDesignModifier from "@/lib/advanced-design-modifier";
import EventModifier from "@/lib/event-modifier";

const app = (): Modifier => new Modifier();
const layout = (): LayoutModifier => new LayoutModifier();
const design = (): DesignModifier => new DesignModifier();
const advancedDesign = (): AdvancedDesignModifier => new AdvancedDesignModifier();
const event = (): EventModifier => new EventModifier();

// 타이포그래피 프리셋
const typography = {
    h1: design().fontSize('48px').fontWeight('bold').lineHeight(1.2),
    h2: design().fontSize('36px').fontWeight('bold').lineHeight(1.3),
    h3: design().fontSize('28px').fontWeight('600').lineHeight(1.4),
    body: design().fontSize('16px').fontWeight('normal').lineHeight(1.6),
    small: design().fontSize('14px').fontWeight('normal').lineHeight(1.5)
};

// 색상 프리셋
const colors = {
    primary: design().color('#3b82f6'),
    secondary: design().color('#10b981'),
    danger: design().color('#ef4444'),
    muted: design().color('#6b7280')
};

// 조합 가능한 프리셋
const presets = {
    card: () => app().merge(
        layout().padding('16px'),
        design()
            .background('#ffffff')
            .borderRadius('8px')
            .border(1, 'solid', '#e0e0e0')
            .shadow('0 2px 4px rgba(0,0,0,0.1)')
    ),

    primaryButton: () => app().merge(
        layout().padding('12px 24px'),
        design()
            .background('#3b82f6')
            .color('#ffffff')
            .borderRadius('6px')
            .fontWeight('bold')
            .transition()
            .cursor('pointer')
            .className('hover:bg-blue-600')
    ),

    glassmorphism: () => app().merge(
        design()
            .advanced()
            .glassmorphism(20, 0.1)
            .borderRadius('12px')
            .shadow('0 8px 32px rgba(31, 38, 135, 0.37)')
    ),

    // 애니메이션 프리셋
    fadeIn: () => design()
        .advanced()
        .keyframes('fadeIn', {
            '0%': { opacity: 0 },
            '100%': { opacity: 1 }
        })
        .animation('fadeIn', '0.5s'),

    slideIn: () => design()
        .advanced()
        .keyframes('slideIn', {
            '0%': { transform: 'translateX(-100%)', opacity: 0 },
            '100%': { transform: 'translateX(0)', opacity: 1 }
        })
        .animation('slideIn', '0.5s')
};


export { app, layout, design, advancedDesign, event, typography, colors, presets };