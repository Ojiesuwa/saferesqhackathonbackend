// lib/openai.js
import dotenv from "dotenv";
dotenv.config();


const OPENAI_API_URL = "https://api.openai.com/v1/responses";

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
};

/**
 * Request response from OpenAI
 * @param {Object} options
 * @param {string} options.system - optional system message
 * @param {string} options.prompt - user prompt
 * @param {"text" | "json_object"} format - desired response format
 */
async function requestOpenAIResponse(options, format) {
  const { system, prompt } = options;

  const body = {
    model: "gpt-4o-mini",
    input: [
      ...(system ? [{ role: "system", content: system }] : []),
      { role: "user", content: prompt },
    ],
    text: {
      format: {
        type: format,
      },
    },
    reasoning: {},
    tools: [],
    temperature: 1,
    max_output_tokens: 2048,
    top_p: 1,
    store: true,
  };

  const res = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.text();
    throw new Error(`OpenAI Error (${res.status}): ${errorData}`);
  }

  const data = await res.json();

  console.log(data.output[0].content);

  const output = data?.output?.[0]?.content[0];

  if (!output) {
    throw new Error("No output content returned by OpenAI");
  }

  const rawText = output.text;

  if (format === "json_object") {
    try {
      return JSON.parse(rawText);
    } catch (e) {
      throw new Error("Failed to parse JSON response from OpenAI");
    }
  }

  return rawText;
}

/**
 * Get plain text response from OpenAI
 */
async function getTextResponse(options) {
  return await requestOpenAIResponse(options, "text");
}

/**
 * Get JSON object response from OpenAI
 */
async function getJsonResponse(options) {
  return await requestOpenAIResponse(options, "json_object");
}

export { getTextResponse, getJsonResponse };
