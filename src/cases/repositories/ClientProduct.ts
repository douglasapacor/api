import { Repository } from "../core/Repository"

export default class ClientProductRepository extends Repository {
  async getClientProduct(params: {
    client: number
    product: number
  }): Promise<{ idproduto: number } | null> {
    try {
      return await this.call<{ idproduto: number }>(
        "get_allowed_product",
        `'${params.client}'`,
        `'${params.product}'`
      )
    } catch (error: any) {
      throw new Error(error.message)
    }
  }
}
