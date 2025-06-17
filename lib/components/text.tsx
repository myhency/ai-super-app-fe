import React, {HTMLAttributes} from "react";
import ModifiableProps from "@/lib/modifiable-props";
import Modifier from "@/lib/modifier";

const Text: React.FC<ModifiableProps & HTMLAttributes<HTMLSpanElement>> = ({
                                                                               modifier,
                                                                               children,
                                                                               ...props
                                                                           }) => {
    const finalProps = modifier instanceof Modifier
        ? modifier.toProps()
        : modifier?.toProps() || {};

    return (
        <span {...finalProps} {...props}>
    {children}
    </span>
    );
};

export default Text;