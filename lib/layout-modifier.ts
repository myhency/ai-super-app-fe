// Layout Modifier
import BaseModifier from "@/lib/base-modifier";
import ModifierData from "@/lib/modifier-data";

export default class LayoutModifier extends BaseModifier<LayoutModifier> {
    protected createInstance(data: Partial<ModifierData>): LayoutModifier {
        return new LayoutModifier(data);
    }

    width(value: string | number): LayoutModifier {
        return this.clone({ styles: { width: value } });
    }

    height(value: string | number): LayoutModifier {
        return this.clone({ styles: { height: value } });
    }

    padding(value: string | number): LayoutModifier {
        return this.clone({ styles: { padding: value } });
    }

    margin(value: string | number): LayoutModifier {
        return this.clone({ styles: { margin: value } });
    }

    flexDirection(direction: 'row' | 'column' | 'row-reverse' | 'column-reverse'): LayoutModifier {
        return this.clone({ styles: { display: 'flex', flexDirection: direction } });
    }

    alignItems(alignment: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline'): LayoutModifier {
        return this.clone({ styles: { display: 'flex', alignItems: alignment } });
    }

    justifyContent(justification: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'): LayoutModifier {
        return this.clone({ styles: { display: 'flex', justifyContent: justification } });
    }

    gap(value: string | number): LayoutModifier {
        return this.clone({ styles: { gap: value } });
    }

    position(position: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky'): LayoutModifier {
        return this.clone({ styles: { position } });
    }

    grid(columns: number, gap?: string | number): LayoutModifier {
        return this.clone({
            styles: {
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: gap
            }
        });
    }
}