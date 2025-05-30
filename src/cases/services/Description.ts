//#region imports
import { defaultResponse } from "../core/defaultResponse"
import DescriptionRepository from "../repositories/Description"
import { descriptionByIdServiceProps } from "../schemas/descriptionById"
//#endregion imports

export default class DescriptionService {
  constructor(private descriptionRepository: DescriptionRepository) {}

  async get(params: descriptionByIdServiceProps): Promise<defaultResponse> {
    try {
      const description = await this.descriptionRepository.get({
        id: params.id
      })

      if (!description) throw new Error("Descrição não encontrada.")

      return {
        success: true,
        data: description.conteudo
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message
      }
    }
  }
}
