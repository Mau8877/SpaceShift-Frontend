// Tablas de mapeo de visemes calibradas manualmente contra el modelo 3D (rig ARKit).
// Portadas literalmente desde el asistente de Organiflow — NO modificar los valores.

/** visemeId de Azure (0–21) → letra de pose ARKit (A–H / X = boca cerrada). */
export const AZURE_TO_ARKIT: Record<number, string> = {
  0: "X",
  1: "A",
  2: "E",
  3: "A",
  4: "F",
  5: "A",
  6: "C",
  7: "D",
  8: "B",
  9: "E",
  10: "F",
  11: "F",
  12: "D",
  13: "C",
  14: "C",
  15: "C",
  16: "B",
  17: "B",
  18: "G",
  19: "G",
  20: "H",
  21: "C",
}

/** Morph targets (blendshapes) ARKit que animamos para boca + parpadeo. */
export const ARKIT_MUSCLES = [
  "jawOpen",
  "mouthFunnel",
  "mouthPucker",
  "mouthClose",
  "mouthRollLower",
  "mouthSmileLeft",
  "mouthSmileRight",
  "eyeBlinkLeft",
  "eyeBlinkRight",
]

/** Letra de pose → pesos de cada morph target. */
export const ARKIT_MAPPING: Record<string, Partial<Record<string, number>>> = {
  A: { jawOpen: 0.0 },
  B: { jawOpen: 0.1 },
  C: { jawOpen: 0.2, mouthSmileLeft: 0.2, mouthSmileRight: 0.2 },
  D: { jawOpen: 0.4 },
  E: { jawOpen: 0.1, mouthFunnel: 0.7 },
  F: { jawOpen: 0.1, mouthPucker: 0.8 },
  G: { jawOpen: 0.1, mouthRollLower: 0.6 },
  H: { jawOpen: 0.2 },
  X: { jawOpen: 0.0 },
}
