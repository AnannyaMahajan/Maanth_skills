import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export const geminiService = {
  async verifyCertificate(skillName: string, base64Image: string, mimeType: string) {
    const model = "gemini-3-flash-preview";
    const prompt = `
      Analyze the provided certificate image for the skill: "${skillName}".
      Determine if the certificate is valid and from a legitimate institution.
      Return a JSON object with:
      - isValid: boolean
      - confidence: number (0-1)
      - reason: string (brief explanation)
      - institution: string (if identified)
    `;

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    };

    const response = await ai.models.generateContent({
      model,
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN },
            confidence: { type: Type.NUMBER },
            reason: { type: Type.STRING },
            institution: { type: Type.STRING },
          },
          required: ["isValid", "confidence", "reason"],
        },
      },
    });

    return JSON.parse(response.text);
  },

  async generateAssessment(skillName: string) {
    const model = "gemini-3-flash-preview";
    const prompt = `
      Generate a skill assessment for: "${skillName}".
      Include:
      1. 5 Multiple Choice Questions (conceptual and scenario-based).
      2. 1 Coding/Practical Task (if applicable, otherwise a deep application question).
      Return a JSON object with the quiz structure.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                },
                required: ["id", "question", "options", "correctAnswer"],
              },
            },
            practicalTask: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                expectedOutcome: { type: Type.STRING },
              },
              required: ["title", "description"],
            },
          },
          required: ["questions", "practicalTask"],
        },
      },
    });

    return JSON.parse(response.text);
  },

  async evaluateAssessment(skillName: string, answers: any, practicalResponse: string) {
    const model = "gemini-3-flash-preview";
    const prompt = `
      Evaluate the assessment for: "${skillName}".
      Answers: ${JSON.stringify(answers)}
      Practical Response: ${practicalResponse}
      Determine if the user passed.
      Return a JSON object with:
      - passed: boolean
      - score: number (0-100)
      - feedback: string
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            passed: { type: Type.BOOLEAN },
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
          },
          required: ["passed", "score", "feedback"],
        },
      },
    });

    return JSON.parse(response.text);
  },
};
