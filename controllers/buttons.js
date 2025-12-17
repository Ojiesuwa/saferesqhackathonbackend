import { getJsonResponse } from "../openai/openai.js";

export const generateButtons = async (body) => {
  console.log(body.address);
  try {
    const prompt = `
A user named ${body.name} has the following medical conditions: "${
      body.medicalDetails
    }".
They have provided the following emergency contacts with relationships: ${JSON.stringify(
      body.emergencyContacts
    )}.
user address is: ${JSON.stringify(body.address)}.

YOUR TASK
---
Generate at least 2 buttons for different potential health emergencies based on the user's conditions. 
Ensure all buttons reference the same location, derived from the supplied address (limit to 15 words max). Intelligently
Choose the right contact person(s) to choose for each situation

RESPONSE FORMAT
---
{
  buttons: [
    {
      situation: "Description of the health issue",
      victim: "${body.name}",
      location: "15 words max location derived from user address",
      buttonLabel: "Short 2-3 word label for the button",
      contactPersons: [
        {
          name: "Full name",
          relationship: "Relation to user",
          phone: "Phone number"
        }
      ]
    }
  ]
}
`;

    const system = "Respond with JSON and strictly adhere to rules";
    const res = await getJsonResponse({ system, prompt });
    return res;
  } catch (error) {
    console.error(error);
    throw new Error("Error generating buttons");
  }
};
