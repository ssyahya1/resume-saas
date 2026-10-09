import { beforeEach, describe, expect, it, vi } from "vitest";

const { createCompletion } = vi.hoisted(() => ({
  createCompletion: vi.fn(),
}));

vi.mock("groq-sdk", () => ({
  default: class Groq {
    constructor() {
      this.chat = {
        completions: {
          create: createCompletion,
        },
      };
    }
  },
}));

import { z } from "zod";
import { generateStructuredContentWithAI } from "../src/services/aiService.js";

const testSchema = z.object({
  summary: z.string(),
  skills: z.array(z.string()),
  certifications: z.array(z.string()),
});

const validResume = {
  summary: "Software developer",
  skills: ["JavaScript", "Node.js"],
  certifications: [],
};

const groqResponse = (content) => ({
  choices: [
    {
      message: {
        content: JSON.stringify(content),
      },
    },
  ],
});

describe("generateStructuredContentWithAI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns data when the AI response matches the schema", async () => {
    createCompletion.mockResolvedValueOnce(groqResponse(validResume));

    const result = await generateStructuredContentWithAI({
      prompt: "Extract resume information.",
      schema: testSchema,
    });

    expect(result).toEqual(validResume);
    expect(createCompletion).toHaveBeenCalledTimes(1);
  });

  it("retries with a correction prompt when required arrays are missing", async () => {
    createCompletion
      .mockResolvedValueOnce(
        groqResponse({
          summary: "Software developer",
        }),
      )
      .mockResolvedValueOnce(groqResponse(validResume));

    const result = await generateStructuredContentWithAI({
      prompt: "Extract resume information.",
      schema: testSchema,
      invalidStructureMessage: "AI returned invalid resume structure",
    });

    expect(result).toEqual(validResume);
    expect(createCompletion).toHaveBeenCalledTimes(2);

    const correctionRequest = createCompletion.mock.calls[1][0];
    const correctionPrompt = correctionRequest.messages[0].content;

    expect(correctionPrompt).toContain("previous response");
    expect(correctionPrompt).toContain("certifications");
    expect(correctionPrompt).toContain("Original task");
  });

  it("stops after the bounded correction attempts for invalid structures", async () => {
    createCompletion.mockResolvedValue(
      groqResponse({
        summary: "Software developer",
      }),
    );

    await expect(
      generateStructuredContentWithAI({
        prompt: "Extract resume information.",
        schema: testSchema,
        invalidStructureMessage: "AI returned invalid resume structure",
      }),
    ).rejects.toMatchObject({
      message: "AI returned invalid resume structure",
      statusCode: 502,
    });

    expect(createCompletion).toHaveBeenCalledTimes(3);
  });

  it("retries invalid JSON with a correction prompt", async () => {
    createCompletion
      .mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: "{invalid json",
            },
          },
        ],
      })
      .mockResolvedValueOnce(groqResponse(validResume));

    const result = await generateStructuredContentWithAI({
      prompt: "Extract resume information.",
      schema: testSchema,
    });

    expect(result).toEqual(validResume);
    expect(createCompletion).toHaveBeenCalledTimes(2);
  });
});