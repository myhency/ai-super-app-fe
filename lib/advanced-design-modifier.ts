// Advanced Design Modifier (특수 CSS 지원)
import ModifierData from "@/lib/modifier-data";
import {CSSProperties} from "react";
import BaseModifier from "@/lib/base-modifier";

// Advanced Design Modifier (특수 CSS 지원)
export default // Advanced Design Modifier (특수 CSS 지원)
class AdvancedDesignModifier extends BaseModifier<AdvancedDesignModifier> {
    protected createInstance(data: Partial<ModifierData>): AdvancedDesignModifier {
        return new AdvancedDesignModifier(data);
    }

    // DesignModifier의 기본 메서드들을 포함
    background(color: string): AdvancedDesignModifier {
        return this.clone({ styles: { backgroundColor: color } });
    }

    color(color: string): AdvancedDesignModifier {
        return this.clone({ styles: { color } });
    }

    fontSize(size: string | number): AdvancedDesignModifier {
        return this.clone({ styles: { fontSize: size } });
    }

    fontWeight(weight: 'normal' | 'bold' | 'lighter' | 'bolder' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | number): AdvancedDesignModifier {
        return this.clone({ styles: { fontWeight: weight } });
    }

    borderRadius(radius: string | number): AdvancedDesignModifier {
        return this.clone({ styles: { borderRadius: radius } });
    }

    shadow(value: string): AdvancedDesignModifier {
        return this.clone({ styles: { boxShadow: value } });
    }

    border(width: number, style: string, color: string): AdvancedDesignModifier {
        return this.clone({ styles: { border: `${width}px ${style} ${color}` } });
    }

    transition(property: string = 'all', duration: string = '300ms'): AdvancedDesignModifier {
        return this.clone({ styles: { transition: `${property} ${duration}` } });
    }

    opacity(value: number): AdvancedDesignModifier {
        return this.clone({ styles: { opacity: value } });
    }

    transform(value: string): AdvancedDesignModifier {
        return this.clone({ styles: { transform: value } });
    }

    cursor(cursor: string): AdvancedDesignModifier {
        return this.clone({ styles: { cursor } });
    }

    lineHeight(value: string | number): AdvancedDesignModifier {
        return this.clone({ styles: { lineHeight: value } });
    }

    // Webkit 속성
    webkitScrollbar(width: string, trackColor: string, thumbColor: string): AdvancedDesignModifier {
        return this.customCSS(`
      & {
        scrollbar-width: thin;
        scrollbar-color: ${thumbColor} ${trackColor};
      }
      &::-webkit-scrollbar {
        width: ${width};
      }
      &::-webkit-scrollbar-track {
        background: ${trackColor};
      }
      &::-webkit-scrollbar-thumb {
        background: ${thumbColor};
        border-radius: 4px;
      }
      &::-webkit-scrollbar-thumb:hover {
        background: ${thumbColor}dd;
      }
    `);
    }

    // 텍스트 선택 스타일
    selection(bgColor: string, textColor: string): AdvancedDesignModifier {
        return this.customCSS(`
      &::selection {
        background-color: ${bgColor};
        color: ${textColor};
      }
      &::-moz-selection {
        background-color: ${bgColor};
        color: ${textColor};
      }
    `);
    }

    // 그라데이션 텍스트
    gradientText(gradient: string): AdvancedDesignModifier {
        return this.clone({
            styles: {
                background: gradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
            }
        });
    }

    // 백드롭 필터
    backdropFilter(filter: string): AdvancedDesignModifier {
        return this.clone({
            styles: {
                backdropFilter: filter,
                WebkitBackdropFilter: filter
            }
        });
    }

    // 글래스모피즘
    glassmorphism(blur: number = 10, opacity: number = 0.1): AdvancedDesignModifier {
        return this.backdropFilter(`blur(${blur}px)`).clone({
            styles: {
                backgroundColor: `rgba(255, 255, 255, ${opacity})`,
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }
        });
    }

    // 클립 패스
    clipPath(path: string): AdvancedDesignModifier {
        return this.clone({
            styles: {
                clipPath: path,
                WebkitClipPath: path
            }
        });
    }

    // 마스크
    mask(image: string, size: string = 'contain', repeat: string = 'no-repeat'): AdvancedDesignModifier {
        return this.clone({
            styles: {
                maskImage: image,
                WebkitMaskImage: image,
                maskSize: size,
                WebkitMaskSize: size,
                maskRepeat: repeat,
                WebkitMaskRepeat: repeat
            }
        });
    }

    // 멀티 컬럼
    columns(count: number, gap: string): AdvancedDesignModifier {
        return this.clone({
            styles: {
                columnCount: count,
                columnGap: gap
            }
        });
    }

    // 그리드 영역
    gridArea(area: string): AdvancedDesignModifier {
        return this.clone({ styles: { gridArea: area } });
    }

    // 애니메이션
    animation(name: string, duration: string, easing: string = 'ease', iteration: string | number = 1): AdvancedDesignModifier {
        return this.clone({
            styles: {
                animation: `${name} ${duration} ${easing} ${iteration}`
            }
        });
    }

    // 키프레임 애니메이션 정의
    keyframes(name: string, frames: Record<string, CSSProperties>): AdvancedDesignModifier {
        const keyframeRules = Object.entries(frames)
            .map(([key, styles]) => {
                const cssProps = Object.entries(styles)
                    .map(([prop, value]) => `${prop.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
                    .join('; ');
                return `${key} { ${cssProps} }`;
            })
            .join('\n');

        return this.customCSS(`
      @keyframes ${name} {
        ${keyframeRules}
      }
    `);
    }

    // CSS 변수
    cssVar(name: string, value: string): AdvancedDesignModifier {
        return this.clone({
            styles: {
                [`--${name}`]: value
            }
        });
    }

    // CSS 변수 사용
    var(name: string, fallback?: string): string {
        return fallback ? `var(--${name}, ${fallback})` : `var(--${name})`;
    }

    // 커스텀 CSS 규칙 (BaseModifier에서 상속받지만 명시적으로 오버라이드)
    customCSS(css: string): AdvancedDesignModifier {
        return this.clone({ customCSS: css });
    }

    // clone 메서드를 public으로 노출
    clone(updates: Partial<ModifierData>): AdvancedDesignModifier {
        return super.clone(updates);
    }
}
