import { getTextResponse } from "../openai/openai.js";

const generateMessageForSingleContactPerson = async (
  name,
  relationship,
  situation,
  victim,
  location
) => {
  try {
    const prompt = `
    A person name ${victim} has a situation detailed as "${situation}". He / she can not communicate properly. You are an agent whoose job is to communicate the situation to ${name}. the relationship between ${name} and ${victim} is ${relationship}. You are to communicate and prompt ${name} to come to his/ her aid. Her current location is given as ${location}. Be brief and straight forward. be as short as possible. maximum of 25 - 40  words. Make sure the message sounds personal and your message is based on their relationship. E.g your son, Fres Kim has ... Make sure to always include the location.
    `;

    const system = "Be straightforward and sound helpful";

    const message = await getTextResponse({ system, prompt });

    return message;
  } catch (error) {
    console.error(error);
    throw new Error("Error with generating message");
  }
};

export const generateMessageFromEmergency = async (emergencyInfo) => {
  try {
    const emergencyMessagePromise = emergencyInfo.contactPersons.map((data) =>
      generateMessageForSingleContactPerson(
        data.name,
        data.relationship,
        emergencyInfo.situation,
        emergencyInfo.victim,
        emergencyInfo.location
      )
    );

    const emergencyMessage = await Promise.all(emergencyMessagePromise);

    const fullEmergencyMessage = emergencyMessage.map((data, index) => ({
      message: data,
      phone: emergencyInfo.contactPersons[index].phone,
    }));

    return fullEmergencyMessage;
  } catch (error) {
    console.error(error);
  }
};
