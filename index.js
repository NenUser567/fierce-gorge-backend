const admin = require("firebase-admin");
const express = require("express");

const app = express();
const PORT = 3000; // You can change the port if needed

// Initialize Firebase Admin SDK
if (!process.env.SERVICE_ACCOUNT_KEY) {
  console.error("Environment variable SERVICE_ACCOUNT_KEY is missing!");
  process.exit(1);
}

const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://av-messenger-b6021-default-rtdb.firebaseio.com", // Replace with your database URL
});

// Monitor changes in the bin status
const db = admin.database();
const binRef = db.ref("/bin/status");

binRef.on("value", (snapshot) => {
  const status = snapshot.val();
  console.log(`Bin status: ${status}`);

  if (status === "Full") {
    const message = {
      notification: {
        title: "Bin Full Alert",
        body: "Your bin is full. Please empty it.",
      },
      topic: "binAlerts",
    };

    admin.messaging()
      .send(message)
      .then((response) => {
        console.log("Notification sent successfully:", response);
      })
      .catch((error) => {
        console.error("Error sending notification:", error);
      });
  }
});

// API route to get bin status and distance
const binDataRef = db.ref("/bin");

app.get("/bin-data", async (req, res) => {
  try {
    const snapshot = await binDataRef.once("value");
    const binData = snapshot.val();
    res.status(200).json(binData);
  } catch (error) {
    console.error("Error fetching bin data:", error);
    res.status(500).json({ error: "Failed to fetch bin data" });
  }
});

// Start the server (optional for health checks)
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
