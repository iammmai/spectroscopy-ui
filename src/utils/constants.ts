export const EQUIVALENCES = {
  BISIMULATION: {
    name: "bisimulation",
    description: "dsfkjsdhfjlk",
    dimensions: {
      observations: "∞",
      conjunctions: "∞",
      pDeep: "∞",
      pFlat: "∞",
      nflat: "∞",
      nH: "∞",
    },
    preorders: ["2-nested-simulation"],
  },
  NESTED_SIMULATION: {
    name: "2-nested-simulation",
    description: "dsfkjsdhfjlk",
    dimensions: {
      observations: "∞",
      conjunctions: "∞",
      pDeep: "∞",
      pFlat: "∞",
      nflat: "1",
      nH: "∞",
    },
    preorders: ["ready-simulation", "possible-future"],
  },
  READY_SIMULATION: {
    name: "ready-simulation",
    description:
      "A process p is ready-simulated by a process q, if there exists ready simulation pRSq, so that for every a ∈ Act, if there p is simulated by q and I(p) = I(q).",
    dimensions: {
      observations: "∞",
      conjunctions: "∞",
      pDeep: "∞",
      pFlat: "∞",
      nflat: "1",
      nH: "1",
    },
    preorders: ["simulation", "ready-trace"],
  },
  SIMULATION: {
    name: "simulation",
    description:
      "A process p is simulated by a process q, if there exists a simulation pRq.",
    dimensions: {
      observations: "∞",
      conjunctions: "∞",
      pDeep: "∞",
      pFlat: "∞",
      nflat: "0",
      nH: "0",
    },
    preorders: ["traces"],
  },
  READY_TRACE: {
    name: "ready-trace",
    description:
      "Two states are failure equivalent if after every action in a trace, the same set of traces are available.",
    dimensions: {
      observations: "∞",
      conjunctions: "∞",
      pDeep: "1",
      pFlat: "∞",
      nflat: "1",
      nH: "1",
    },
    preorders: ["failure-trace", "readiness"],
  },
  POSSIBLE_FUTURE: {
    name: "possible-future",
    description:
      "Two states are impossible-future equivalent if after any trace, the same set of traces are available.",
    dimensions: {
      observations: "∞",
      conjunctions: "1",
      pDeep: "∞",
      pFlat: "∞",
      nflat: "1",
      nH: "∞",
    },
    preorders: ["impossible-future", "readiness"],
  },
  FAILURE_TRACE: {
    name: "failure-trace",
    description:
      "Two states are failure equivalent if after every action in a trace, the same set of traces are not available.",
    dimensions: {
      observations: "∞",
      conjunctions: "∞",
      pDeep: "1",
      pFlat: "1",
      nflat: "1",
      nH: "1",
    },
    preorders: ["failure"],
  },
  READINESS: {
    name: "readiness",
    description:
      "Two states are readiness equivalent if after any trace, the same set of actions available.",
    dimensions: {
      observations: "∞",
      conjunctions: "1",
      pDeep: "0",
      pFlat: "∞",
      nflat: "1",
      nH: "1",
    },
    preorders: ["failure"],
  },
  IMPOSSIBLE_FUTURE: {
    name: "impossible-future",
    description:
      "Two states are impossible-future equivalent if after any trace, the same set of traces are not available.",
    dimensions: {
      observations: "∞",
      conjunctions: "1",
      pDeep: "0",
      pFlat: "0",
      nflat: "1",
      nH: "∞",
    },
    preorders: ["failure"],
  },
  FAILURE: {
    name: "failure",
    description:
      "Two states are failure equivalent if after every trace, the same set of actions are not available.",
    dimensions: {
      observations: "∞",
      conjunctions: "1",
      pDeep: "0",
      pFlat: "0",
      nflat: "1",
      nH: "1",
    },
    preorders: ["traces"],
  },
  TRACES: {
    name: "traces",
    description:
      "Two states s,r are trace equivalent iff Tr(s)=Tr(r). They can perform the same finite sequences of transitions.",
    dimensions: {
      observations: "∞",
      conjunctions: "0",
      pDeep: "0",
      pFlat: "0",
      nflat: "0",
      nH: "0",
    },
    preorders: ["enabledness"],
  },
  ENABLEDNESS: {
    name: "enabledness",
    description:
      "Two states are equivalent under enabledness, iff they have the same set of inital actions.",
    dimensions: {
      observations: "1",
      conjunctions: "0",
      pDeep: "0",
      pFlat: "0",
      nflat: "0",
      nH: "0",
    },
    preorders: [],
  },
} as const;

const equivalenceNames = Object.values(EQUIVALENCES).map((e) => e.name);
export type EquivalenceName = typeof equivalenceNames[number];

export const tagColors = ["#F2994A", "#6FCF97"];
