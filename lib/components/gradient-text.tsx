// 미리 정의된 스타일을 가진 컴포넌트들
import withDefaultModifier from "@/lib/components/with-default-modifier";
import Text from "./text";
import {design} from "@/lib/helper";

export const GradientText = withDefaultModifier(Text,
    design()
        .advanced()
        .gradientText('linear-gradient(45deg, #3b82f6, #10b981)')
        .fontSize('48px')
        .fontWeight('bold')
);