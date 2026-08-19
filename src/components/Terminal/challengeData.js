export const CHALLENGE_DATA = {
  1: {
    title: "Round 1",
    totalPhases: 4,
    phases: {
      1: {
        id: "R1P1",
        title: "Phase 1: The Glitch",
        description: "Receive a glitching video. Output is Part 1 of cipher.",
        resourceType: "video",
        resourceUrl: "#", // Placeholder
        expectedAnswer: "PART1", // Placeholder answer for testing
        successMessage: "Checkpoint Unlocked.",
      },
      2: {
        id: "R1P2",
        title: "Phase 2: UI Numerical Codes",
        description: "UI image embedded with numerical codes (requires Phase 1 output to decode). Output is Part 2 of cipher.",
        resourceType: "image",
        resourceUrl: "#", 
        expectedAnswer: "PART2",
        successMessage: "Checkpoint Unlocked.",
      },
      3: {
        id: "R1P3",
        title: "Phase 3: Image Map",
        description: "Image map with constraints. Output is Part 3 of cipher.",
        resourceType: "image",
        resourceUrl: "#",
        expectedAnswer: "PART3",
        successMessage: "Checkpoint Unlocked.",
      },
      4: {
        id: "R1P4",
        title: "Phase 4: Stellarium Clues",
        description: "PDF clues leading to Stellarium for Part 4 of cipher. Submitting completes Round 1.",
        resourceType: "pdf",
        resourceUrl: "#",
        expectedAnswer: "PART4",
        successMessage: "Round Completed.",
      }
    }
  },
  2: {
    title: "Round 2: Voyager",
    totalPhases: 3,
    phases: {
      1: {
        id: "R2P1",
        title: "Phase 1: SSTV & Arecibo",
        description: "Receive reversed SSTV audio and a frequency number. Decode to get 23x73 monochrome image. Arecibo Message hints to flip vertically and horizontally.",
        resourceType: "audio",
        resourceUrl: "#",
        expectedAnswer: "1977",
        successMessage: "Checkpoint Unlocked.",
      },
      2: {
        id: "R2P2",
        title: "Phase 2: Decoy Drive",
        description: "PDF with Google Drive link containing decoy 'Greetings' folder and a primary audio file with disrupted Morse code.",
        resourceType: "pdf",
        resourceUrl: "#",
        expectedAnswer: "MORSE", // Placeholder
        successMessage: "Checkpoint Unlocked.",
      },
      3: {
        id: "R2P3",
        title: "Phase 3: Static Website",
        description: "PDF linking to static website for final challenge.",
        resourceType: "pdf",
        resourceUrl: "#",
        expectedAnswer: "FINAL", // Placeholder
        successMessage: "Round Completed.",
      }
    }
  },
  3: {
    title: "Round 3",
    totalPhases: 1,
    phases: {
      1: {
        id: "R3P1",
        title: "Phase 1: Final Puzzle",
        description: "Awaiting Admin Unlock.",
        resourceType: "text",
        resourceUrl: "#",
        expectedAnswer: "WIN",
        successMessage: "Round Completed.",
      }
    }
  }
};

export const INITIAL_HINTS = [
  { id: 1, round: 1, text: "Focus on the visual anomalies in the first video.", timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, round: 2, text: "The Arecibo message dimensions are key (23x73).", timestamp: new Date(Date.now() - 1800000).toISOString() },
];
