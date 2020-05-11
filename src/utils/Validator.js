export default class Validator{
  static validProduct(product) {
    const { description, buyPrice, sellPrice } = product
    if(description.length < 3){
      throw new Error('Descrição deve estar entre 3 e 50 caracteres')      
    }
    if (buyPrice > sellPrice){
      throw new Error('Valor de venda não pode ser maior do que valor de compra')
    }
    if (buyPrice < 0){
      throw new Error('Valor de compra não pode ser negativo')
    }
    if (sellPrice < 0){
      throw new Error('Valor de venda não pode ser negativo')
    }
    return product;
}
}