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
    description: "dsfkjsdhfjlk",
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
    description: "dsfkjsdhdffjlk",
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
    description: "dsfkjsdhfjlk",
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
    description: "dsfkjsdhfjlk",
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
    description: "dsfkjsdhfjlk",
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
    description: "dsfkjsdhfjlk",
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
    description: "dsfkjsdhfjlk",
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
    description: "dsfkjsdsdsdhfjlk",
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
      "Two states s,r are trace equivalent iff Tr(s)=Tr(r). They can perform the same finite sequences of transitions)",
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
    description: "dsfkjsdhfjlk",
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
