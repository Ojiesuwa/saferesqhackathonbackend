import twilio from "twilio";
import { baseurl } from "../variable.js";
// import {base} from "../variable.js"
import dotenv from "dotenv";
import { sleep } from "../utils.js";

dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const makePhoneCall = async (phoneNumber, message) => {
  try {
    const call = await client.calls.create({
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
      url: `${baseurl}/voice?msg=${encodeURIComponent(message)}`,
      // --- ADD THESE LINES TO TRACK THE END OF THE CALL ---
      statusCallback: `${baseurl}/status`,
      statusCallbackEvent: ["completed"], // Trigger when the call is finished
      statusCallbackMethod: "POST",
    });
    return call;
  } catch (error) {
    console.error(error);
  }
};

export const initializeCall = () => {
  let isCallStillActive = false;

  const makeSerialPhoneCall = async (emergencyResolvedMessageInfo) => {
    try {
      isCallStillActive = true;
      for (const message of emergencyResolvedMessageInfo) {
        makePhoneCall(message.phone, message.message);
        if (isCallStillActive == false) break;
        await sleep(40000);
      }
    } catch (error) {
      console.error(error);
      throw new Error("");
    }
  };

  const cancelCall = () => {
    isCallStillActive = false;
  };

  return { makeSerialPhoneCall, cancelCall };
};
