import withDefaultModifier from "@/lib/components/with-default-modifier";
import {Box} from "lucide-react";
import {app, design, layout} from "@/lib/helper";

const GlassCard = withDefaultModifier(Box,
    app().merge(
        layout().padding('32px'),
        design()
            .advanced()
            .glassmorphism(20, 0.1)
            .borderRadius('16px')
            .shadow('0 8px 32px rgba(31, 38, 135, 0.37)')
    )
);

export default GlassCard;