// Base 컴포넌트들
import ModifiableProps from "@/lib/modifiable-props";
import {HTMLAttributes} from "react";
import Modifier from "@/lib/modifier";

const Box: React.FC<ModifiableProps & HTMLAttributes<HTMLDivElement>> = ({
                                                                             modifier,
                                                                             children,
                                                                             ...props
                                                                         }) => {
    const finalProps = modifier instanceof Modifier
        ? modifier.toProps()
        : modifier?.toProps() || {};

    return (
        <div {...finalProps} {...props}>
            {children}
        </div>
    );
};

export default Box;