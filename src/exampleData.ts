const example = [
  {
    left: "0",
    right: "0",
    distinctions: [],
    preorderings: ["bisimulation"],
  },
  {
    left: "b.0",
    right: "b.0 + c.0",
    distinctions: [
      {
        formula: "¬⟨c⟩⊤",
        price: [1, 1, 0, 0, 1, 1],
        inequivalences: ["failure"],
      },
      {
        formula: "¬⟨a⟩⊤",
        price: [1, 1, 0, 0, 1, 1],
        inequivalences: ["failure"],
      },
      {
        formula: "¬⟨b⟩⊤",
        price: [1, 1, 0, 0, 1, 1],
        inequivalences: ["failure"],
      },
    ],
    preorderings: ["simulation"],
  },
  {
    left: "R16",
    right: "L16",
    distinctions: [
      {
        formula: "¬⟨a⟩⋀{¬⟨c⟩⊤}",
        price: [2, 2, 0, 0, 2, 2],
        inequivalences: ["bisimulation"],
      },
    ],
    preorderings: ["2-nested-simulation"],
  },
  {
    left: "L16",
    right: "R16",
    distinctions: [
      {
        formula: "⟨a⟩⋀{¬⟨c⟩⊤}",
        price: [2, 1, 0, 0, 1, 1],
        inequivalences: ["failure"],
      },
    ],
    preorderings: ["simulation"],
  },
  {
    left: "b.0 + c.0",
    right: "b.0 + c.0",
    distinctions: [],
    preorderings: ["bisimulation"],
  },
];

export default example;
