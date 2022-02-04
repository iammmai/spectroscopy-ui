import { PropsWithChildren, useEffect, SVGProps } from "react";
import React from "react";

import { drag, DragBehavior } from "d3-drag";
import { select } from "d3-selection";

type XY = { x: number; y: number };

/**
 * An SVG element that generates drag events.
 * Note that this component is not responsible for moving anything – it just generates the events.
 */
const DraggableSVGGroup: React.FC<PropsWithChildren<{
    containerProps: SVGProps<SVGGElement>;
    subject: XY;
    onDragStart: (x: number, y: number) => void;
    onDrag: (x: number, y: number) => void;
    onDragEnd: (x: number, y: number) => void;
}>> = ({ children, containerProps, subject, onDragStart, onDrag, onDragEnd }) => {
    const groupRef = React.useRef<SVGGElement>(null);

    useEffect(() => {
        const group = groupRef.current;
        if (group === null) throw new Error("missing draggable group ref");

        const dragBehavior: DragBehavior<SVGGElement, unknown, unknown> = drag();

        const groupSelection = select(group);
        groupSelection.call(dragBehavior.subject(() => subject).on("start", (e) => onDragStart(e.x, e.y)).on("drag", (e) => onDrag(e.x, e.y)).on("end", (e) => onDragEnd(e.x, e.y)));

        return (): void => {
            groupSelection.on(".drag", null); // un-bind event handlers
        };
    }, [subject, onDragStart, onDrag, onDragEnd]);

    return <g ref={groupRef} {...containerProps}>
        {children}
    </g>;
};

export default DraggableSVGGroup;
