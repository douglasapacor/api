import swaggerJSDoc from "swagger-jsdoc"

const listarBoletinsPrivado: swaggerJSDoc.PathItem = {
  post: {
    description:
      "Lista os boletins criados que já foram aprovados e publicados para usuários LOGADOS. Usar somente para o leitor.",
    tags: ["/leitor"],
    summary: "Listar boletim Privado (logado).",
    parameters: [
      {
        in: "header",
        name: "Authorization",
        schema: {
          type: "string",
          required: true
        },
        description: "Token credencial do usuário"
      }
    ],
    requestBody: {
      description:
        "tipos de boletim: 1 - Ordinária, 2 - Extraordinária, 3 - Classificadores, 4 - Parceria IEPTB, 5 - Outros",
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              numero: {
                type: "string",
                required: false
              },
              boletim_tipo_id: {
                type: "array",
                items: {
                  type: "integer"
                }
              },
              data: {
                type: "string",
                format: "date"
              },
              limite: {
                type: "number"
              },
              pagina: {
                type: "number"
              }
            },
            required: ["boletim_tipo_id", "limite", "pagina"]
          }
        }
      }
    },
    responses: {
      200: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: {
                  type: "boolean"
                },
                data: {
                  type: "object",
                  properties: {
                    list: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "number" },
                          titulo: { type: "string" },
                          data: {
                            type: "string",
                            format: "datetime"
                          },
                          numero: { type: "string" },
                          lido: { type: "boolean" },
                          favorito: { type: "boolean" }
                        }
                      }
                    },
                    count: {
                      type: "number"
                    }
                  }
                }
              }
            }
          }
        },
        description: "Resposte de sucesso."
      }
    }
  }
}

export default listarBoletinsPrivado
