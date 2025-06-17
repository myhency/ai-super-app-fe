// Event Modifier
import BaseModifier from "@/lib/base-modifier";
import ModifierData from "@/lib/modifier-data";

export default class EventModifier extends BaseModifier<EventModifier> {
    protected createInstance(data: Partial<ModifierData>): EventModifier {
        return new EventModifier(data);
    }

    onClick(handler: React.MouseEventHandler): EventModifier {
        return this.clone({ handlers: { onClick: handler } });
    }

    onHover(onEnter: React.MouseEventHandler, onLeave: React.MouseEventHandler): EventModifier {
        return this.clone({
            handlers: {
                onMouseEnter: onEnter,
                onMouseLeave: onLeave
            }
        });
    }

    onChange(handler: React.ChangeEventHandler): EventModifier {
        return this.clone({ handlers: { onChange: handler } });
    }
}