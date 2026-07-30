// Archetype IDs
const A = {
  DOM_ALPHA: 'dominant-alpha',
  LONER_ALPHA: 'loner-alpha',
  SOFT_ALPHA: 'soft-alpha',
  SUB_ALPHA: 'submissive-alpha',
  CARING_BETA: 'caring-beta',
  NEEDY_BETA: 'needy-beta',
  FLIRTY_BETA: 'flirty-beta',
  PROTECTIVE_BETA: 'protective-beta',
  INDEPENDENT_OMEGA: 'independent-omega',
  STOIC_OMEGA: 'stoic-omega',
  AGGRESSIVE_OMEGA: 'aggressive-omega',
  SUB_OMEGA: 'submissive-omega',
};

export const ARCHETYPES = [
  {
    id: A.DOM_ALPHA,
    name: 'Dominant Alpha',
    type: 'alpha',
    people: ['Trong Nhan'],
    compatibleWith: [A.SUB_OMEGA, A.NEEDY_BETA, A.CARING_BETA, A.STOIC_OMEGA],
  },
  {
    id: A.SOFT_ALPHA,
    name: 'Soft Alpha',
    type: 'alpha',
    people: ['Angela Nguyen', 'Elaine Guo', 'Jacklynn Pham', 'Joanna Park', 'Luc Utheza'],
    compatibleWith: [A.FLIRTY_BETA, A.LONER_ALPHA, A.CARING_BETA, A.INDEPENDENT_OMEGA, A.SUB_OMEGA],
  },
  {
    id: A.LONER_ALPHA,
    name: 'Loner Alpha',
    type: 'alpha',
    people: ['Alan Zheng', 'Justin Tran', 'Thanh Tu', 'Timur Lentz'],
    compatibleWith: [A.CARING_BETA, A.FLIRTY_BETA, A.SUB_ALPHA, A.SOFT_ALPHA],
  },
  {
    id: A.SUB_ALPHA,
    name: 'Submissive Alpha',
    type: 'alpha',
    people: [],
    compatibleWith: [A.INDEPENDENT_OMEGA, A.CARING_BETA, A.FLIRTY_BETA, A.LONER_ALPHA],
  },
  {
    id: A.PROTECTIVE_BETA,
    name: 'Protective Beta',
    type: 'beta',
    people: ['Jack Volgren', 'Sajjad Atabi', 'Yabi Benyam'],
    compatibleWith: [A.SUB_OMEGA, A.STOIC_OMEGA, A.CARING_BETA, A.SUB_ALPHA],
  },
  {
    id: A.FLIRTY_BETA,
    name: 'Flirty Beta',
    type: 'beta',
    people: ['Jeff Houng', 'Noah Hauptmann', 'William Serrano'],
    compatibleWith: [A.LONER_ALPHA, A.SOFT_ALPHA, A.SUB_OMEGA, A.SUB_ALPHA, A.INDEPENDENT_OMEGA],
  },
  {
    id: A.CARING_BETA,
    name: 'Caring Beta',
    type: 'beta',
    people: ['Eric Sun', 'Ivy Burke', 'Jess Duong', 'JT Bui'],
    compatibleWith: [A.CARING_BETA, A.NEEDY_BETA, A.FLIRTY_BETA, A.PROTECTIVE_BETA],
  },
  {
    id: A.NEEDY_BETA,
    name: 'Needy Beta',
    type: 'beta',
    people: [
      'Ashley Nam', 'Carolyn Zhang', 'Dennis Wang', 'Evey Zhang', 'Olivia Magtaas', 'Paige Kim',
      'Ronak Pai', 'Rosie Huang', 'Tiffany Zhang', 'Wei Zhang',
    ],
    compatibleWith: [A.FLIRTY_BETA, A.SOFT_ALPHA, A.CARING_BETA, A.AGGRESSIVE_OMEGA, A.DOM_ALPHA],
  },
  {
    id: A.STOIC_OMEGA,
    name: 'Stoic Omega',
    type: 'omega',
    people: ['Alyssa Featherston', 'Marcy Nguyen'],
    compatibleWith: [A.DOM_ALPHA, A.CARING_BETA, A.PROTECTIVE_BETA, A.AGGRESSIVE_OMEGA],
  },
  {
    id: A.INDEPENDENT_OMEGA,
    name: 'Independent Omega',
    type: 'omega',
    people: ['Alexis Nguyen', 'Em Chae', 'Jonathan Wong', 'Tim Lin'],
    compatibleWith: [A.SUB_ALPHA, A.CARING_BETA, A.SOFT_ALPHA, A.AGGRESSIVE_OMEGA],
  },
  {
    id: A.AGGRESSIVE_OMEGA,
    name: 'Aggressive Omega',
    type: 'omega',
    people: ['Benji Valenti', 'Charles Hoang', 'Iris Li', 'Jamie Van', 'Kim Nguyen', 'Serena Xiao'],
    compatibleWith: [A.STOIC_OMEGA, A.SUB_ALPHA, A.INDEPENDENT_OMEGA],
  },
  {
    id: A.SUB_OMEGA,
    name: 'Submissive Omega',
    type: 'omega',
    people: ['Albert Tan', 'Daniel Park', 'Shirley Su'],
    compatibleWith: [A.FLIRTY_BETA, A.DOM_ALPHA, A.SOFT_ALPHA, A.PROTECTIVE_BETA],
  },
];

export const ARCHETYPE_MAP = Object.fromEntries(ARCHETYPES.map((a) => [a.id, a]));

// Build an undirected edge list (dedup) plus a separate list of self-loops.
// Compatibility is drawn as a line if EITHER archetype lists the other.
export function buildEdges() {
  const pairKey = (a, b) => [a, b].sort().join('|');
  const seen = new Map();
  const selfLoops = [];

  for (const archetype of ARCHETYPES) {
    for (const otherId of archetype.compatibleWith) {
      if (otherId === archetype.id) {
        if (!selfLoops.includes(archetype.id)) selfLoops.push(archetype.id);
        continue;
      }
      const key = pairKey(archetype.id, otherId);
      if (!seen.has(key)) {
        seen.set(key, { a: archetype.id, b: otherId });
      }
    }
  }

  return { edges: [...seen.values()], selfLoops };
}
