import React, { forwardRef, useImperativeHandle, useRef } from "react";

import "./LTSSVGFrame.scss";

export type LTSSVGFrameAPI = {
    exportSVG: () => string;
}

type LTSSVGFrameProps = React.PropsWithChildren<{
    darkMode: boolean;
    largeFont: boolean;
    hideWeak: boolean;
    moreSvgProps?: React.SVGProps<SVGSVGElement>;
    scale?: number;
}>;

/**
 * A component that renders an SVG element with the proper styles to show LTS.
 * Meant to contain [[LTSSVGFragmentView]] components, directly or indirectly.
 * 
 * Its `ref` exposes an API to serialize its contents for export to an SVG file.
 */
const LTSSVGFrame = forwardRef<LTSSVGFrameAPI, LTSSVGFrameProps>(function LTSSVGFrame({ children, darkMode, largeFont, hideWeak, scale = 1.0, moreSvgProps }, ref) {
    const svgRef = useRef<SVGSVGElement>(null);

    useImperativeHandle(ref, () => ({
        exportSVG: (): string => {
            if (svgRef.current === null) throw new Error("Missing SVG ref!");
            const svgElement = svgRef.current;

            const serializer = new XMLSerializer();
            const bbox = svgElement.getBBox();
            const clonedSvgElement = svgElement.cloneNode(true) as SVGSVGElement; // cast needed: https://github.com/Microsoft/TypeScript/issues/283

            const margin = 2;
            clonedSvgElement.setAttribute("viewBox", `${bbox.x - margin} ${bbox.y - margin} ${bbox.width + 2 * margin} ${bbox.height + 2 * margin}`);
            clonedSvgElement.setAttribute("width", `${bbox.width + 2 * margin}px`);
            clonedSvgElement.setAttribute("height",`${bbox.height + 2 * margin}px`);

            return serializer.serializeToString(clonedSvgElement);
        }
    }));

    return  <svg ref={svgRef} className={`lts-graph dark-mode-${darkMode} large-action-font-${largeFont} hide-weak-${hideWeak}`} {...moreSvgProps}>
        <style type="text/css">
            {`
.state-border {
    stroke: #000000;
    stroke-width: 1px;
    fill: #BBBBBB;
}

.state.explored .state-border {
    fill: #FFCCCC;
}

.state.expandable .state-border {
    fill: #FF7777;
    stroke-width: 2px;
}

.state.terminal .state-border {
    fill: #8888FF;
}

.state.initial .state-border {
    stroke-width: 4px;
}

.state.erroneous .state-border {
    fill: #FF0000;
}

.state-highlight {
    fill: #FFFF00
}

.transition-label {
    font-weight: bold;
    font-size: calc(${scale} * 14px);
    white-space: pre;
    font-family: monospace;
    user-select: none;
}

.hide-weak-true .weak .transition-label {
    visibility: hidden;
}

.transition-controlpoint {
    stroke: #000000;
    stroke-width: 1px;
    fill: #333333;
}

.state-label {
    font-weight: bold;
    white-space: pre;
}

.transition-path {
    stroke: #999999;
    stroke-width: 2px;
    fill: none;
}

.expand-notice-label {
    fill: white;
}

.lts-graph.dark-mode-true {
    background-color: black;
}

.lts-graph.dark-mode-true .transition-label {
    fill: white;
}

.lts-graph.dark-mode-true .transition-path {
    stroke: #BBBBBB;
}

.lts-graph.dark-mode-true .transition-arrowhead {
    fill: #FFFFFF;
}

.lts-graph.dark-mode-true .state-border {
    stroke: #FFFFFF;
}

.lts-graph.dark-mode-true .state.initial .state-border {
    stroke: #FFFFFF;
    stroke-width: 6px;
}

.lts-graph.dark-mode-true .state.explored .state-border {
    fill: #FF9999;
}

.lts-graph.dark-mode-true .state.expandable .state-border {
    fill: #FF5555;
}

.lts-graph.large-action-font-true .transition-label {
    font-size: 18px;
}
            `}
        </style>
        {children}
    </svg>;
});

export default LTSSVGFrame;
