import { Request, Response } from "express"
import { verify } from "jsonwebtoken"
import { IUsuarioPainel, params, UsuarioPainel } from ".."
import { defaultResponse } from "../../../cases/core/defaultResponse"
import application from "../../../config/application"

export function process(
  params: params
): (req: Request, res: Response<defaultResponse>) => Promise<void> {
  return async (
    req: Request,
    res: Response<defaultResponse>
  ): Promise<void> => {
    try {
      req.meta.date = new Date()
      req.meta.method = req.method
      req.meta.start = new Date().getTime()

      res.on("finish", () => {
        req.meta.finish = new Date().getTime()

        console.log(
          `url: ${req.path.toLowerCase()} | method: ${req.method.toLowerCase()} | time: ${
            req.meta.finish - req.meta.start
          }ms`
        )
      })

      switch (params.configuracao.nivel) {
        case 0:
          return await params.handle(req, res)
        case 1:
          if (!req.headers["authorization"]) throw new Error("Não autorizado")

          req.credenciais = new UsuarioPainel(
            verify(
              req.headers["authorization"],
              application.key
            ) as IUsuarioPainel
          )

          return await params.handle(req, res)
        case 2:
          if (!req.headers["authorization"]) throw new Error("Não autorizado")

          let credentialObject = null

          try {
            credentialObject = verify(
              req.headers["authorization"],
              application.key
            ) as IUsuarioPainel
          } catch (error: any) {
            throw new Error("Erro ao verificar credenciais, Não autorizado.")
          }

          req.credenciais = new UsuarioPainel(credentialObject)

          if (
            !req.credenciais.autorizado(
              params.configuracao.recurso,
              params.configuracao.acao
            )
          )
            throw new Error("Não autorizado.")

          return await params.handle(req, res)
      }
    } catch (error: any) {
      res.status(200).json({
        success: false,
        message: error.message
      })
    }
  }
}
