import express from "express"

import { router } from "./routes/api"
import { env, port } from "./data/config"
import { connectToRedis } from "./data/redis"
import { connectToApn } from "./utils/apn-utils"
import { connectToFcm } from "./utils/fcm-utils"
import { logNames, logger, startLogger } from "./logs"
import { scheduleExistingRides } from "./utils/ride-utils"

const app = express()
app.use(express.json())

app.use("/api/v1", router)

app.get("/isAlive", (req, res) => {
  res.status(200).send("App is ready! 🚂")
})

app.listen(port, async () => {
  startLogger()
  await connectToRedis()
  
  // Disable APNs if no Apple credentials
  if (process.env.APPLE_KEY_ID) {
    connectToApn()
  }
  
  // Disable Firebase if no credentials 
  if (process.env.FIREBASE_ADMIN_AUTH) {
    connectToFcm()
  }

  scheduleExistingRides()

  logger.info(logNames.server.listening, { port, env })
})
