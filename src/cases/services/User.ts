//#region Imports
import { createHash } from "crypto"
import jwt, { sign } from "jsonwebtoken"
import md5 from "md5"
import application from "../../config/application"
import { defaultResponse } from "../core/defaultResponse"
import type UserRepository from "../repositories/User"
import { confirmaRecuperacaoServiceProps } from "../schemas/confirmaRecuperacao"
import { painelAuthServiceProps } from "../schemas/painelAuth"
import { recuperacaoCelServiceProps } from "../schemas/recuperacaoCel"
import { recuperacaoMailServiceProps } from "../schemas/recuperacaoEmail"
import type { siteAuthServiceProps } from "../schemas/siteAuth"
//#endregion Imports

export default class UserService {
  constructor(private userRepository: UserRepository) {}

  //#region site
  async siteAuth(params: siteAuthServiceProps): Promise<defaultResponse> {
    try {
      const salt = await this.userRepository.getSalt({
        login: params.login
      })

      if (!salt)
        throw new Error("Não existe nenhum usuário cadastrado com esses dados.")

      if (salt.idstatus_cliente > 2)
        throw new Error(
          "Seu acesso encontra-se desativado. Entre em contato conosco para reativar."
        )

      const hash = createHash("sha1")
      const fullHash = createHash("sha1")

      hash.update(params.senha)
      fullHash.update(`${hash.digest("hex")}${salt.idusuario}`)

      const contentToSearch = fullHash.digest("hex")
      let userConfirmed = null

      userConfirmed = await this.userRepository.getConfirmation({
        email: params.login,
        senha: contentToSearch
      })

      if (!userConfirmed) {
        userConfirmed = await this.userRepository.getOldConfirmation({
          email: params.login,
          senha: contentToSearch
        })
      }

      if (!userConfirmed) throw new Error("A senha informada está incorreta.")

      const token = sign(
        JSON.stringify({
          idcliente: userConfirmed.idcliente,
          idusuario: userConfirmed.idusuario,
          idgrupo_site: userConfirmed.idgrupo_site,
          admin: userConfirmed.admin,
          autorizacao_trabalhista: userConfirmed.autorizacao_trabalhista
        }),
        application.key
      )

      return {
        success: true,
        data: {
          nome: userConfirmed.nome,
          credential: token
        }
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message
      }
    }
  }

  async recuperacaoEmailSite(params: {}): Promise<defaultResponse> {
    try {
      return {
        success: true
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message
      }
    }
  }

  async recuperacaoCelSite(params: any): Promise<defaultResponse> {
    try {
      return {
        success: true
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message
      }
    }
  }

  async confirmaRecuperacaoSite(
    params: confirmaRecuperacaoServiceProps
  ): Promise<defaultResponse> {
    try {
      return {
        success: true
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message
      }
    }
  }
  //#endregion Imports

  //#region painel
  async painelAuth(params: painelAuthServiceProps): Promise<defaultResponse> {
    try {
      const userSalt = await this.userRepository.getUserPainelLogin({
        loginusuario: params.login
      })

      if (!userSalt)
        throw new Error("Nenhum usuário encontrado com esse login.")

      let preparedPassword = ""

      try {
        preparedPassword = md5(
          `${md5(params.senha)}${userSalt.idusuario}${userSalt.datacad}`
        )
      } catch (error) {
        throw new Error("Erro ao tentar processar dados do usuário para login.")
      }

      const userSecurity = await this.userRepository.verificacaoSegurancaPainel(
        { login: params.login, senha: preparedPassword }
      )

      if (!userSecurity)
        throw new Error(
          "Não existe nenhum usuário cadastrado com esse login e senha."
        )

      let content: {
        tipo: string
        nome: string
        icone: string
        tag: string
        url: string
        atributos: string
      }[] = []

      if (userSecurity.idgrupo === 7) {
        content = await this.userRepository.getallrecursos()
      } else {
        content = await this.userRepository.getusuariorecursos({
          idusuario: userSecurity.idusuario
        })
      }

      let credential: Record<string, string> = {}
      let settings: Record<
        string,
        { nome: string; icone: string; url: string }[]
      > = {}

      for (let i = 0; i < content.length; i++) {
        credential[content[i].tipo as keyof typeof credential] =
          content[i].atributos

        if (!settings[content[i].tipo as keyof typeof credential])
          settings[content[i].tipo as keyof typeof credential] = []

        settings[content[i].tipo as keyof typeof credential].push({
          icone: content[i].icone,
          nome: content[i].nome,
          url: content[i].url
        })
      }

      const token = jwt.sign(
        JSON.stringify(credential),
        application.key,
        params.keep ? { expiresIn: undefined } : { expiresIn: "8h" }
      )

      return {
        success: true,
        data: {
          nome: userSecurity.nome,
          idgrupo: userSecurity.idgrupo,
          idacesso: userSecurity.idacesso,
          nivel_consultor: userSecurity.nivel_consultor,
          consultoria: userSecurity.consultoria,
          data_ultimo_acesso: userSecurity.data_ultimo_acesso,
          credencial: token,
          configuracoes: settings
        }
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message
      }
    }
  }

  async recuperacaoEmailPainel(
    params: recuperacaoMailServiceProps
  ): Promise<defaultResponse> {
    try {
      return {
        success: true
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message
      }
    }
  }

  async recuperacaoCelPainel(
    params: recuperacaoCelServiceProps
  ): Promise<defaultResponse> {
    try {
      return {
        success: true
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message
      }
    }
  }

  async confirmaRecuperacaoPainel(
    params: confirmaRecuperacaoServiceProps
  ): Promise<defaultResponse> {
    try {
      return {
        success: true
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message
      }
    }
  }
  //#endregion Imports
}
