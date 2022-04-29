export const EQUIVALENCES = {
  BISIMULATION: {
    name: "bisimulation",
    description: "dsfkjsdhfjlk",
    preorders: [
      "2-nested simulation",
      "ready simulation",
      "simulation",
      "ready traces",
      "possible futures",
      "failure traces",
      "readies",
      "impossible futures",
      "failure",
      "traces",
    ],
  },
  NESTED_SIMULATION: {
    name: "2-nested simulation",
    description: "dsfkjsdhfjlk",
    preorders: [
      "ready simulation",
      "simulation",
      "ready traces",
      "possible futures",
      "failure traces",
      "readies",
      "impossible futures",
      "failure",
      "traces",
    ],
  },
  READY_SIMULATION: {
    name: "ready simulation",
    description: "dsfkjsdhfjlk",
  },
  SIMULATION: {
    name: "simulation",
    description: "dsfkjsdhdffjlk",
    preorders: ["traces"],
  },
  READY_TRACES: {
    name: "ready traces",
    description: "dsfkjsdhfjlk",
  },
  POSSIBLE_FUTURES: {
    name: "possible futures",
    description: "dsfkjsdhfjlk",
  },
  FAILURE_TRACES: {
    name: "failure traces",
    description: "dsfkjsdhfjlk",
  },
  READIES: {
    name: "readies",
    description: "dsfkjsdhfjlk",
  },
  IMPOSSIBLE_FUTURES: {
    name: "impossible futures",
    description: "dsfkjsdhfjlk",
  },
  FAILURES: {
    name: "failure",
    description: "dsfkjsdsdsdhfjlk",
  },
  TRACES: {
    name: "traces",
    description: "dsfkjsdhfjlk",
  },
} as const;
