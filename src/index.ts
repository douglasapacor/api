import bodyParser from "body-parser"
import cors from "cors"
import "dotenv/config"
import express from "express"
import swaggerUi from "swagger-ui-express"
import application from "./config/application"
import swaggerDocs from "./documentation"
import router from "./router"

const app = express()

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs))
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use((req, _, next) => {
  req.meta = {
    date: new Date(),
    method: req.method,
    start: new Date().getMilliseconds()
  }

  next()
})
app.use("/", router)

app.listen(application.port, async () => {
  let finalHost =
    application.env === "dev"
      ? `${application.host.dev}:${application.port}`
      : `${application.host.prod}`

  console.log(
    `Api ouvindo no endereço: ${
      application.env === "dev" ? "http" : "https"
    }://${finalHost}`
  )
})
