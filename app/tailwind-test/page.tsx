import {GradientText} from "@/lib/components/gradient-text";
import {app} from "@/lib/helper";

export default function Page() {
    return (
        <div className='flex flex-col'>
            <div className='flex gap-10'>
                <div>Hey</div>
                <div>Hello</div>
            </div>
            <div>World</div>
            <GradientText
                modifier={app()
                    .design()
                    .border(16, 'solid', 'red')}
            >
                Hello
            </GradientText>
        </div>
    );
}