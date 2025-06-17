// Design Modifier (기본)
import BaseModifier from "@/lib/base-modifier";
import ModifierData from "@/lib/modifier-data";
import AdvancedDesignModifier from "@/lib/advanced-design-modifier";

export default class DesignModifier extends BaseModifier<DesignModifier> {
    protected createInstance(data: Partial<ModifierData>): DesignModifier {
        return new DesignModifier(data);
    }

    background(color: string): DesignModifier {
        return this.clone({ styles: { backgroundColor: color } });
    }

    color(color: string): DesignModifier {
        return this.clone({ styles: { color } });
    }

    fontSize(size: string | number): DesignModifier {
        return this.clone({ styles: { fontSize: size } });
    }

    fontWeight(weight: 'normal' | 'bold' | 'lighter' | 'bolder' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | number): DesignModifier {
        return this.clone({ styles: { fontWeight: weight } });
    }

    borderRadius(radius: string | number): DesignModifier {
        return this.clone({ styles: { borderRadius: radius } });
    }

    shadow(value: string): DesignModifier {
        return this.clone({ styles: { boxShadow: value } });
    }

    border(width: number, style: string, color: string): DesignModifier {
        return this.clone({ styles: { border: `${width}px ${style} ${color}` } });
    }

    transition(property: string = 'all', duration: string = '300ms'): DesignModifier {
        return this.clone({ styles: { transition: `${property} ${duration}` } });
    }

    opacity(value: number): DesignModifier {
        return this.clone({ styles: { opacity: value } });
    }

    transform(value: string): DesignModifier {
        return this.clone({ styles: { transform: value } });
    }

    cursor(cursor: string): DesignModifier {
        return this.clone({ styles: { cursor } });
    }

    lineHeight(value: string | number): DesignModifier {
        return this.clone({ styles: { lineHeight: value } });
    }

    // Advanced로 전환
    advanced(): AdvancedDesignModifier {
        return new AdvancedDesignModifier(this.getData());
    }
}