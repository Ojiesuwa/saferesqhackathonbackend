import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { initializeCall, makePhoneCall } from "./controllers/twilio.js";
import { generateMessageFromEmergency } from "./controllers/message.js";
import { generateButtons } from "./controllers/buttons.js";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
// Twilio sends data in x-www-form-urlencoded format for status updates
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const callControl = initializeCall();

app.use("/public", express.static(path.join(__dirname, "public")));
app.use(cors());

// ===============================
// 1. Trigger Call
// ===============================
app.post("/api/call", async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: "Phone number required" });
    }

    const bodyDemo = {
      situation: "Epileptic Seizure",
      victim: "Mr Bernard",
      location: "Bells University Ota, Ogun state Nigeria",
      contactPersons: [
        {
          name: "Mrs Fawziya",
          relationship: "Student",
          phone: "+2349023426098",
        },
        {
          name: "Mrs Aaliyah",
          relationship: "Mother",
          phone: "+2349023426098",
        },
      ],
    };
    const fullMessageWithPhone = await generateMessageFromEmergency(bodyDemo);
    console.log(fullMessageWithPhone);

    callControl.makeSerialPhoneCall(fullMessageWithPhone);

    // const call = await makePhoneCall(
    //   "+2349023426098",
    //   "Mr. Fred, there is an emergency with your wife. She is currently at number 13, Rose Avenue, Lagos."
    // );

    res.json({
      status: "Call initiated",
      // callSid: call.sid,
    });
  } catch (error) {
    console.error("Call error:", error);
    res.status(500).json({ error: "Failed to initiate call" });
  }
});

app.post("/api/emergency", async (req, res) => {
  try {
    const bodyDemo = req.body;
    console.log(bodyDemo);
    const fullMessageWithPhone = await generateMessageFromEmergency(bodyDemo);
    console.log("FUll MEssage");
    console.log(fullMessageWithPhone);

    callControl.makeSerialPhoneCall(fullMessageWithPhone);

    // const call = await makePhoneCall(
    //   "+2349023426098",
    //   "Mr. Fred, there is an emergency with your wife. She is currently at number 13, Rose Avenue, Lagos."
    // );

    res.json({
      status: "Call initiated",
      // callSid: call.sid,
    });
  } catch (error) {
    console.error("Call error:", error);
    res.status(500).json({ error: "Failed to initiate call" });
  }
});

app.post("/api/onboarding", async (req, res) => {
  try {
    const info = req.body;
    const result = await generateButtons(info);
    console.log(result);

    res.json(result);
  } catch (error) {
    console.error("Onboaring error", error);
    res.status(500).json({ error: "Failed to prepare onboarding information" });
  }
});

// ===============================
// 2. Voice Instructions
// ===============================
app.all("/voice", (req, res) => {
  const rawMessage = req.query.msg;

  if (!rawMessage) {
    return res.type("text/xml").send(`
      <Response>
        <Say voice="Polly.Matthew">No message provided.</Say>
      </Response>
    `);
  }

  const message = rawMessage
    .replace(/&/g, "and")
    .replace(/</g, "")
    .replace(/>/g, "");

  const twiml = `
<Response>
  <Say voice="Polly.Matthew" language="en-US">
    ${message.split(".").join('. <break time="400ms"/>')}
    <break time="600ms"/>
    I repeat. <break time="400ms"/>
    ${message.split(".").join('. <break time="400ms"/>')}
  </Say>
</Response>
  `;

  res.type("text/xml");
  res.send(twiml);
});

// ===============================
// 3. New Endpoint: Log Call Completion
// ===============================
app.post("/status", (req, res) => {
  const callStatus = req.body.CallStatus;
  const callDuration = req.body.CallDuration; // in seconds
  const callSid = req.body.CallSid;

  console.log(`\n[CALL UPDATE] SID: ${callSid}`);
  console.log(`[STATUS]: ${callStatus}`);

  if (callStatus === "completed") {
    console.log(`[DURATION]: ${callDuration} seconds`);
    console.log(
      `[ACTION]: Call ended successfully. Performing cleanup logic...\n`
    );
  }

  // Always respond with 200 to let Twilio know you received the log
  res.sendStatus(200);
});

// ===============================
// Server Start
// ===============================
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Twilio voice server running on port ${PORT}`);
});
