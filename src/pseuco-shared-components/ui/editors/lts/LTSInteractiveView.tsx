import { ReactNode } from "react";
import { LTS } from "../../../lts/lts";
import LTSSVGFragmentView, {
  LTSStateViewData,
  LTSTransitionViewData,
  stateCircleSize,
  XY,
} from "./LTSSVGFragmentView";
import React from "react";
import { mutatingFilter, mutatingRemove } from "../../../util/arrayMutations";
import {
  forceX,
  forceY,
  forceSimulation,
  forceCollide,
  forceManyBody,
  forceLink,
} from "d3-force";
import {
  concat,
  mapObjectToArray,
  callOrIgnore,
  mapObject,
} from "../../../util/functional";

import "./LTSInteractiveView.scss";

type LTSInteractiveViewAPI = {
  expandAllSingleStep: () => void;
  collapseAll: () => void;
  stop: () => void;
  restart: () => void;
  exportViewData: () => string;
  getStateCoordinates: (stateKey: string) => { x: number; y: number };
};

export type LTSViewData = {
  states: { [stateKey: string]: LTSStateViewData };
  transitions: LTSTransitionViewData[];
};

type ForceLink = {
  transition: LTSTransitionViewData;
  source: ForceNode;
  target: ForceNode;
};

const isTransitionNode = (
  node: LTSStateViewData | LTSTransitionViewData
): node is LTSTransitionViewData => "transitionIndex" in node;

type ForceNode = LTSStateViewData | LTSTransitionViewData;

export type LTSExpansionStatus = {
  hasExpandableStates: boolean;
  hasCollapsibleStates: boolean;
};

export type LTSInteractiveViewProps = {
  lts: LTS | null;
  width: number;
  height: number;
  showExpandNotice: boolean;
  stickyNodes: boolean;
  directedExploration: boolean;
  shortWeakSteps: boolean;
  scale: number;
  onStateExpanded?: (stateKey: string) => void;
  onStateCollapsed?: (stateKey: string) => void;
  onStateClick?: (stateKey: string) => void;
  onStateRightClick?: (
    stateKey: string,
    event: React.MouseEvent<SVGElement, MouseEvent>
  ) => void;
  onStateMouseOver?: (stateKey: string) => void;
  onStateMouseOut?: (stateKey: string) => void;
  onTransitionMouseOver?: (stateKey: string, transitionIndex: number) => void;
  onTransitionMouseOut?: (stateKey: string, transitionIndex: number) => void;
  onErrorStateExpansionAttempt?: (stateKey: string, error: string) => void;
  onUnexploredExpansionAttempt?: (stateKey: string) => void;
  onExpansionStatusChange?: (status: LTSExpansionStatus) => void;
  ref?: any;
};
const minBorderDistance = stateCircleSize;

/**
 * Displays a single LTS. Uses automatic layouting and allows the user to expand and collapse nodes.
 */
class LTSInteractiveView
  extends React.Component<LTSInteractiveViewProps, Record<string, never>>
  implements LTSInteractiveViewAPI
{
  expandAllSingleStep = (): void => {
    Object.keys(this.states)
      .filter((stateKey) => !this.getExpanded(stateKey))
      .forEach(this.expandState);
  };

  collapseAll = (): void => {
    Object.keys(this.states)
      .filter(this.getExpanded)
      .forEach((s) => this.collapseState(s));
  };

  private onStateClick = (stateKey: string): void => {
    if (this.getExpanded(stateKey)) {
      this.collapseState(stateKey);
    } else {
      this.expandState(stateKey);
    }
  };

  private states: {
    [stateKey: string]: LTSStateViewData & {
      fx?: number;
      fy?: number;
    };
  } = {};
  private transitions: LTSTransitionViewData[] = [];

  /**
   * Array of the links that are currently active.
   */
  private forceLinks: ForceLink[] = [];

  /**
   * An array of the stateKeys of all states that are currently expanded.
   */
  private expandedStates: string[] = [];

  /**
   * For each state key, points to the state it was generated from, or backwards towards the root in some other way.
   * Used to speed up reachability computations.
   */
  private backwardsChain: { [stateKey: string]: string } = {};

  private getLinkDistance = (link: ForceLink): number => {
    const isWeak = link.transition.weak;
    if (isWeak && this.props.shortWeakSteps) {
      return this.props.scale * 15;
    } else {
      return (
        this.props.scale *
        Math.min(Math.max(60 - 2 * Object.keys(this.states).length, 30), 60)
      );
    }
  };

  private getNodeCharge = (
    node: LTSStateViewData | LTSTransitionViewData
  ): number => {
    if (isTransitionNode(node)) {
      return this.props.scale * (node.weak ? -20 : -48);
    } else {
      return (
        this.props.scale *
        Math.min(
          Math.max(-48 + 1.2 * Object.keys(this.states).length, -48),
          -20
        )
      );
    }
  };

  private getNodeSize = (): number => {
    return stateCircleSize(this.props.scale);
  };

  private xForce = forceX().strength(0.01);
  private yForce = forceY().strength(0.01);
  private linkForce = forceLink<ForceNode, ForceLink>()
    .distance(this.getLinkDistance)
    .strength(0.2);

  private force = forceSimulation<ForceNode>()
    .force("link", this.linkForce)
    .force("xforce", this.xForce)
    .force("yforce", this.yForce)
    .force("charge", forceManyBody<ForceNode>().strength(this.getNodeCharge))
    .force("collision", forceCollide(this.getNodeSize))
    .velocityDecay(0.05)
    .alphaDecay(0.005);

  private getExpanded = (stateKey: string): boolean => {
    return this.expandedStates.includes(stateKey);
  };

  private setExpanded = (stateKey: string, expanded: boolean): void => {
    if (expanded && !this.getExpanded(stateKey)) {
      this.expandedStates.push(stateKey);
    } else if (!expanded) {
      mutatingRemove(this.expandedStates, stateKey);
    }
  };

  /**
   * Generates the path from the initial state to a state.
   * @param targetStateKey The key of the target state.
   * @returns A path, or `false` is none exists.
   */
  private generatePath = (targetStateKey: string): string[] | false => {
    if (!this.props.lts) throw new Error("Missing LTS on path generation.");

    const path: string[] = [targetStateKey];
    let current: string = targetStateKey;

    while (current !== this.props.lts.initialState) {
      const previousKey = this.backwardsChain[current];
      const previousState = this.states[previousKey];
      if (
        !previousState ||
        !this.transitions.some(
          (t) => t.source === previousKey && t.target === current
        )
      )
        return this.searchPath(targetStateKey); // full search required because the backwards chain points nowhere or along a transition that was removed when the LTS changed
      current = previousKey;
      path.unshift(current);
    }

    return path;
  };

  /**
   * Generates the path from the initial state to a state by searching, and updates the backwards chain information.
   * @param targetStateKey The key of the target state.
   * @returns A path, or `false` is none exists.
   */
  private searchPath = (targetStateKey: string): string[] | false => {
    if (!this.props.lts) throw new Error("Missing LTS on path search.");
    const initialStateKey = this.props.lts.initialState;

    const frontier = [targetStateKey];
    const shortestPathForwardLinks: { [stateKey: string]: string } = {}; // map from states to successors along shortest path

    while (frontier.length > 0) {
      const todo = frontier.splice(0); // process one wave from the frontier
      todo.forEach((stateKey) => {
        this.transitions.forEach((t) => {
          if (
            t.target === stateKey &&
            !(t.source in shortestPathForwardLinks)
          ) {
            // found a new shortest connection
            frontier.push(t.source); // search on from there
            shortestPathForwardLinks[t.source] = t.target; // memorize the connection
          }
        });

        if (initialStateKey in shortestPathForwardLinks) {
          // success - we connected start and end
          // reconstruct path using successors
          let current = initialStateKey;
          const path = [current];

          while (current !== targetStateKey) {
            const nextState = shortestPathForwardLinks[current];
            this.backwardsChain[nextState] = current; // store the path we found as a backwards chain
            current = nextState;
            path.push(current);
          }

          return path;
        }
      });
    }

    return false;
  };

  private expandState = (stateKey: string): void => {
    if (this.getExpanded(stateKey))
      throw new Error("State is already expanded.");
    if (!this.props.lts) throw new Error("Missing LTS on expansion.");

    const visualState = this.states[stateKey];
    const ltsState = this.props.lts.states[stateKey];

    if (ltsState.error) {
      callOrIgnore(
        this.props.onErrorStateExpansionAttempt,
        stateKey,
        ltsState.error
      );
      return;
    }

    const transitions = ltsState.transitions;
    if (!transitions) {
      callOrIgnore(this.props.onUnexploredExpansionAttempt, stateKey);
      return;
    }

    transitions.forEach((ltsTransition, transitionIndex) => {
      if (!this.props.lts) throw new Error("Missing LTS on expansion.");

      if (
        this.transitions.some(
          (t) => t.source === stateKey && t.transitionIndex === transitionIndex
        )
      )
        return; // transition is already visible, e.g. due to directed exploration

      const targetStateKey = ltsTransition.target;

      const visualTransition = {
        weak: ltsTransition.weak,
        label: ltsTransition.weak
          ? ltsTransition.label
            ? ltsTransition.label
            : "τ"
          : ltsTransition.label,
        detailsLabel: ltsTransition.detailsLabel
          ? ltsTransition.detailsLabel
          : undefined,
        source: stateKey,
        target: targetStateKey,
        transitionIndex,
        x: visualState.x + 10,
        y: visualState.y,
      };

      this.transitions.push(visualTransition);

      let targetVisualState = this.states[targetStateKey];

      if (!targetVisualState) {
        // we don't already show the target - add it
        targetVisualState = {
          x: visualState.x + 20,
          y: visualState.y,
          initial: false,
          // remaining properties may be incorrect, but will be updated soon anyway
          highlighted: false,
          explored: false,
          erroneous: false,
          expandable: false,
          terminal: false,
        };
        this.states[targetStateKey] = targetVisualState;

        this.backwardsChain[ltsTransition.target] = stateKey;
      }

      this.forceLinks.push({
        source: this.states[stateKey],
        target: visualTransition,
        transition: visualTransition,
      });
      this.forceLinks.push({
        source: visualTransition,
        target: targetVisualState,
        transition: visualTransition,
      });

      const targetLtsState = this.props.lts.states[ltsTransition.target];

      if (
        targetLtsState.transitions &&
        targetLtsState.transitions.length === 0
      ) {
        // we already know this is an expanded terminal state
        this.setExpanded(ltsTransition.target, true);
      }

      callOrIgnore(this.props.onStateExpanded, stateKey);
    });

    this.setExpanded(stateKey, true);

    if (this.props.directedExploration) {
      this.autoCollapseNodes(stateKey);
    }

    this.restart();

    this.fullUpdate();
  };

  /**
   * Collapses a state.
   * @param stateKey The state to collapse.
   * @param protectedTargets An array of states that should not be removed. Used for directed exploration, as auto-collapsing nodes should _not_ collapse the path from the initial state to the last-clicked state.
   */
  private collapseState = (
    stateKey: string,
    protectedTargets: string[] = []
  ): void => {
    if (!this.props.lts) throw new Error("Missing LTS on collapse.");

    const ltsState = this.props.lts.states[stateKey];

    let actuallyCollapsed = false;

    ltsState.transitions?.forEach((transition, transitionIndex) => {
      if (protectedTargets.includes(transition.target)) return; // target is protected, do not remove transition

      // remove the transition
      const i = this.transitions.findIndex(
        (t) => t.source === stateKey && t.transitionIndex === transitionIndex
      );
      if (i >= 0) {
        this.transitions.splice(i, 1); // remove transision
        actuallyCollapsed = true;

        const targetVisualState = this.states[transition.target];
        if (!targetVisualState.initial) {
          if (!this.generatePath(transition.target)) {
            // the target is no longer connected from the start - collapse and remove it.
            this.collapseState(transition.target, []); // we will remove the state soon - so transitions pointing to it *must* be removed, so we drop protections
            delete this.states[transition.target];
          }
        }
      }
    });

    if (actuallyCollapsed) this.setExpanded(stateKey, false); // do not remove this flag if nothing happened (e.g. for a terminal state)

    this.restart();

    this.fullUpdate();
  };

  private autoCollapseNodes = (lastExpandedStateKey: string): void => {
    const path = this.generatePath(lastExpandedStateKey);
    if (!path)
      throw new Error(
        `Failed to find a path to the initial state while auto-collapsing state ${lastExpandedStateKey}`
      );
    for (const stateKey in this.states) {
      if (stateKey !== lastExpandedStateKey) this.collapseState(stateKey, path);
    }
  };

  stop = (): void => {
    this.force.stop();
  };

  restart = (): void => {
    this.force.alpha(1).restart();
  };

  private lastSize = { x: -1, y: -1 };

  private resize = (): void => {
    // pull towards center

    const newSize = { x: this.props.width / 2, y: this.props.height / 2 };

    // only update when something changed to avoid re-warming the simulation on every render
    if (newSize.x !== this.lastSize.x || newSize.y !== this.lastSize.y) {
      this.xForce.x(newSize.x);
      this.yForce.y(newSize.y);

      this.force.alpha(1).restart();

      this.lastSize = newSize;
    }
  };

  private lastReportedExpansionState: LTSExpansionStatus | null = null;

  private updatePositions = (): void => {
    // nothing to do – positions already live in what is passed down
    this.forceUpdate();
  };

  /**
   * Fully updates the internal data to match the LTS.
   * Should be called after the LTS was changed, or some state was expanded or collapsed.
   */
  private fullUpdate = (): void => {
    // first, remove states that are gone
    for (const stateKey in this.states) {
      if (!this.props.lts?.states[stateKey]) delete this.states[stateKey];
    }

    // next, remove transitions whose start or end are gone
    mutatingFilter(
      this.transitions,
      (transition) =>
        !!(transition.source in this.states && transition.target in this.states)
    );

    // similarly, remove links that are no longer valid
    mutatingFilter(this.forceLinks, (link) =>
      this.transitions.includes(link.transition)
    );

    // also, remove the expanded flag for missing states
    mutatingFilter(this.expandedStates, (stateKey) => stateKey in this.states);

    // and clean up the backwards chain
    for (const stateKey in this.backwardsChain) {
      if (!this.states[stateKey]) delete this.backwardsChain[stateKey];
    }

    if (this.props.lts) {
      // ensure at least the initial state exists
      if (!this.states[this.props.lts.initialState])
        this.states[this.props.lts.initialState] = {
          x: 0,
          y: 0,
          initial: true,
          // remaining properties may be incorrect, but will be updated soon anyway
          highlighted: false,
          explored: false,
          erroneous: false,
          expandable: false,
          terminal: false,
        };

      // update properties of states
      for (const stateKey in this.states) {
        const ltsState = this.props.lts.states[stateKey];
        const visualState = this.states[stateKey];
        visualState.explored = !!ltsState.transitions;
        visualState.erroneous = !!ltsState.error;
        visualState.highlighted = !!ltsState.highlighted;
        visualState.expandable =
          !!ltsState.transitions &&
          ltsState.transitions.length > 0 &&
          !this.getExpanded(stateKey);
        visualState.terminal =
          !!ltsState.transitions && ltsState.transitions.length === 0;
      }
    }

    this.force.nodes(
      concat<ForceNode>(
        mapObjectToArray(this.states, (state) => state),
        this.transitions
      )
    );
    this.linkForce.links(this.forceLinks);

    this.resize();

    this.forceUpdate();
    this.fullUpdateRequired = false;

    const newStatus: LTSExpansionStatus = {
      hasExpandableStates: Object.values(this.states).some((s) => s.expandable),
      hasCollapsibleStates: this.expandedStates.length > 0,
    };

    if (
      JSON.stringify(newStatus) !==
      JSON.stringify(this.lastReportedExpansionState)
    ) {
      callOrIgnore(this.props.onExpansionStatusChange, newStatus);
      this.lastReportedExpansionState = newStatus;
    }
  };

  /**
   * Fully resets the internal data, ensuring nothing is expanded.
   * Should be called after the LTS was replaced.
   */
  private fullReset = (): void => {
    this.states = {};
    this.fullUpdate(); // will clean up the rest as all states are gone
    this.force.alpha(1).restart();
    this.fullResetRequired = false;
  };

  private fullUpdateRequired = false;
  private fullResetRequired = false;

  UNSAFE_componentWillReceiveProps(nextProps: LTSInteractiveViewProps): void {
    // called when props will change
    if (nextProps.lts === this.props.lts) {
      this.fullUpdateRequired = true; // trigger update once the update has actually happened
    } else if (
      // only full reset when deep equal fails
      JSON.stringify(nextProps.lts) !== JSON.stringify(this.props.lts)
    ) {
      this.fullResetRequired = true;
    }
  }

  componentDidUpdate(): void {
    if (this.fullResetRequired) this.fullReset(); // trigger queued full reset
    if (this.fullUpdateRequired) this.fullUpdate(); // trigger queued full update
  }

  private stateDragStart = (stateKey: string, x: number, y: number): void => {
    if (!this.props.lts) return;
    this.force.alphaTarget(0.3).restart();
    const subject = this.states[stateKey];
    subject.fx = x;
    subject.fy = y;
    this.updatePositions();
  };

  private stateDrag = (stateKey: string, x: number, y: number): void => {
    if (!this.props.lts) return;
    const subject = this.states[stateKey];
    subject.fx = x;
    subject.fy = y;
    this.updatePositions();
  };

  private stateDragEnd = (stateKey: string): void => {
    if (!this.props.lts) return;
    this.force.alphaTarget(0.0).restart();
    if (!this.props.stickyNodes) {
      const subject = this.states[stateKey];
      subject.fx = undefined;
      subject.fy = undefined;
    }
    this.updatePositions();
  };

  /**
   * Gets the states and transitions, as currently displayed (but shifted to be aligned top-left), as a JSON export.
   */
  exportViewData = (): string => {
    const allThings = concat<ForceNode>(
      Object.values(this.states),
      this.transitions
    );
    const xShift =
      minBorderDistance(this.props.scale) -
      allThings.map((n) => n.x).reduce((a, b) => Math.min(a, b));
    const yShift =
      minBorderDistance(this.props.scale) -
      allThings.map((n) => n.y).reduce((a, b) => Math.min(a, b));

    const shift = <T extends XY>(n: T): T => ({
      ...n,
      x: n.x + xShift,
      y: n.y + yShift,
    });

    const exportData: LTSViewData = {
      states: mapObject(this.states, shift),
      transitions: this.transitions.map(shift),
    };

    return JSON.stringify(exportData);
  };

  getStateCoordinates = (stateKey: string) => {
    const state = this.states[stateKey] || {};
    return { x: state.x, y: state.y };
  };

  componentDidMount = (): void => {
    this.fullReset();
    this.force.on("tick", () => {
      const limitNodesByBorder = (nodes: ForceNode[]): void => {
        nodes.forEach((n) => {
          n.x = Math.min(
            Math.max(n.x, minBorderDistance(this.props.scale)),
            this.props.width - minBorderDistance(this.props.scale)
          );
          n.y = Math.min(
            Math.max(n.y, minBorderDistance(this.props.scale)),
            this.props.height - minBorderDistance(this.props.scale)
          );
        });
      };

      limitNodesByBorder(Object.values(this.states));
      limitNodesByBorder(this.transitions);

      this.updatePositions();
    });
  };

  componentWillUnmount = (): void => {
    this.stop();
  };

  handleMouseOver = (stateKey: string) => {
    // this.states[stateKey] = { ...this.states[stateKey], highlighted: true };
    this.props.onStateMouseOver && this.props.onStateMouseOver(stateKey);
  };

  handleMouseOut = (stateKey: string) => {
    // this.states[stateKey] = { ...this.states[stateKey], highlighted: false };
    this.props.onStateMouseOut && this.props.onStateMouseOut(stateKey);
  };

  render(): ReactNode {
    return (
      <LTSSVGFragmentView
        states={this.states}
        transitions={this.transitions}
        scale={this.props.scale}
        showExpandNotice={this.props.showExpandNotice}
        onStateDragStart={this.stateDragStart}
        onStateDrag={this.stateDrag}
        onStateDragEnd={this.stateDragEnd}
        onStateClick={this.props.onStateClick || this.onStateClick}
        onStateRightClick={this.props.onStateRightClick}
        onStateMouseOver={this.props.onStateMouseOver}
        // onStateMouseOver={this.handleMouseOver}
        onStateMouseOut={this.props.onStateMouseOut}
        // onStateMouseOut={this.handleMouseOut}
        onTransitionMouseOver={this.props.onTransitionMouseOver}
        onTransitionMouseOut={this.props.onTransitionMouseOut}
      />
    );
  }
}

export default LTSInteractiveView;
