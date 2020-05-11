/* eslint-disable no-undef */
import request from 'supertest';

import app from '../src/app';
import Product from '../src/models/products';
import Validator from '..src/utils/Validator'

let products;

beforeEach(() => {
  products = [new Product(
    12,
    'Placa de vídeo ZT-650',
    40.00,
    80.00,
    ['tecnologia', 'computador', 'gamer'],
  ),
  new Product(
    99,
    'Macbook Pro Retina 2020',
    4000.00,
    6000.00,
    ['tecnologia', 'macbook', 'apple', 'macOS'],
  )];
});

test('deve ser possível criar um novo produto', async () => {
  const response = await request(app)
    .post('/products')
    .send(products[0]);

  expect(response.body).toMatchObject({
    ...products[0],
    lovers: 0,
  });
});

test('o status code de um produto criado deverá ser 201', async () => {
  const response = await request(app)
    .post('/products')
    .send(products[0]);
  expect(response.status).toBe(201);
});

test('deve ser possível atualizar dados de um produto', async () => {
  const responseSave = await request(app)
    .post('/products')
    .send(products[0]);
  const updatedProduct = {
    ...products[0],
    description: 'Macbook Pro Alterado',

  };
  const responseUpdate = await request(app)
    .put(`/products/${responseSave.body.id}`)
    .send(updatedProduct);

  expect(responseUpdate.body).toMatchObject(updatedProduct);
});

test('não deve ser possível atualizar um produto inexistente', async () => {
  await request(app)
    .put('/products/999999')
    .expect(400);
});

test('não deve ser possível remover um produto inexistente', async () => {
  await request(app)
    .put('/products/999999')
    .expect(400);
});

test('deve retornar o código 204 quando um produto for removido', async () => {
  const response = await request(app)
    .post('/products')
    .send(products[0]);

  await request(app)
    .delete(`/products/${response.body.code}`)
    .expect(204);
});

test('deve ser possível remover os produtos pelo código', async () => {
  const response = await request(app)
    .post('/products')
    .send(products[0]);

  await request(app)
    .post('/products')
    .send(products[1]);

  await request(app)
    .delete(`/products/${response.body.code}`)
    .expect(204);

  const all = await request(app)
    .get('/products');

  expect(all.body).not.toMatchObject([{ code: response.body.code }]);
});

test('deve ser possível listar todos os produtos', async () => {
  const responseSave = await request(app)
    .post('/products')
    .send(products[0]);

  const response = await request(app)
    .get('/products');
  expect(response.body).toEqual(
    expect.arrayContaining([
      {
        id: responseSave.body.id,
        ...products[0],
        lovers: 0,

      },
    ]),
  );
});

test('Deve ser possível buscar produtos por código no array', async () => {
  await request(app)
    .post('/products')
    .send({
      ...products[0],
      code: 40,
    });

  await request(app)
    .post('/products')
    .send({
      ...products[0],
      code: 40,
    });

  const responseGet = await request(app).get('/products/40');
  expect(responseGet.body).toHaveLength(2);
});

test('não deve ser possível atualizar o número de lovers de um produto manualmente', async () => {
  const responseSave = await request(app)
    .post('/products')
    .send(products[0]);
  const updatedProduct = {
    ...products[0],
    lovers: 10000000,
  };
  const responseUpdate = await request(app)
    .put(`/products/${responseSave.body.id}`)
    .send(updatedProduct);

  expect(responseUpdate.body.lovers).toBe(0);
});

test('deve ser possível dar love em um produto', async () => {
  const response = await request(app)
    .post('/products')
    .send(products[0]);

  const response2 = await request(app)
    .post(`/products/${response.body.code}/love`)
    .send(response.body);

  expect(response2.body).toMatchObject({
    lovers: 1,
  });
});

test('deve possuir o número de lovers igual a 0 um produto recém criado o qual o seu código seja inexistente', async () => {
  const response = await request(app)
    .post('/products')
    .send({
      ...products[0],
      code: 12344321,
      lovers: 10,
    });
  expect(response.body).toMatchObject({
    lovers: 0,
  });
});

test('Um produto deverá herdar o número de lovers caso seu código já exista', async () => {
  const response = await request(app)
    .post('/products')
    .send({
      ...products[0],
      code: 201,
    });

  await request(app)
    .post(`/products/${response.body.code}/love`)
    .send(response.body);

  const response2 = await request(app)
    .post('/products')
    .send({
      ...products[0],
      code: 201,
    });

  expect(response2.body).toMatchObject({
    lovers: 1,
  });
});

test('Produtos de mesmo código devem compartilhar os lovers', async () => {
  const response = await request(app)
    .post('/products')
    .send({
      ...products[0],
      code: 201,
    });

  await request(app)
    .post(`/products/${response.body.code}/love`)
    .send(response.body);

  const response2 = await request(app)
    .post('/products')
    .send({
      ...products[0],
      code: 201,
    });

  await request(app)
    .post(`/products/${response2.body.code}/love`)
    .send(response2.body);


  expect(response2.body).toMatchObject({
    lovers: 2,
  });
});

//Testes desenvolvidos para atividade 
test('Não deve ser aceita a descrição com 2 caracteres', () => {
  expect(() => {
    Validator.validProduct(new Product(
      144,
      'Pl',
      50.00,
      80.00,
      ['tecnologia', 'computador', 'gamer']
    ))
  }).toThrow(new Error('Descrição deve de estar entre 3 e 50 caracteres'))
})
test('Deve aceitar descrição com 3 caracteres', () => {
  const product = Validator.validProduct(new Product(
    144,
    'abc',
    50.00,
    80.00,
    ['tecnologia', 'computador', 'gamer']
  ))
  expect(product.description).toBe('abc')
})
test('O preço de venda terá que ser maior que o preço de compra', () => {
  const product = Validator.validProduct(new Product(
    123,
    'Mouse sem fio',
    105.00,
    100.00,
    ['tecnologia', 'computador', 'gamer']
  ))
  expect(product.sellPrice).toBe(product.sellPrice>product.buyPrice)
})
test('O preço de compra não pode ser igual ou maior que o preço de venda', () => {
  const product = Validator.validProduct(new Product(
  123,
  'Mouse sem fio',
  105.00,
  105.00,
  ['tecnologia', 'computador', 'gamer']
))
expect(product.buyPrice).toBe(buyPrice<sellPrice)
})
test('O valor de compra precisa ser positivo', () => {
  const product = Validator.validProduct(new Product(
  123,
  'Mouse sem fio',
  -105.00,
  150.00,
  ['tecnologia', 'computador', 'gamer']
))
expect(product.buyPrice).toBe(150.00)
})
test('O valor de compra não pode ser igual ou menor que zero', () => {
  const product = Validator.validProduct(new Product(
  123,
  'Mouse sem fio',
  -105.00,
  150.00,
  ['tecnologia', 'computador', 'gamer']
))
expect(product.buyPrice).toBe(buyPrice>0)
})
test('O valor de venda não pode ser menor ou igual a 0', () => {
  const product = Validator.validProduct(new Product(
  123,
  'Mouse sem fio',
  105.00,
  0.00,
  ['tecnologia', 'computador', 'gamer']
))
expect(product.buyPrice).toBe(sellPrice>0)
})
test('O valor de venda não pode ser negativo', () => {
  const product = Validator.validProduct(new Product(
  123,
  'Mouse sem fio',
  -105.00,
  150.00,
  ['tecnologia', 'computador', 'gamer']
))
expect(product.buyPrice).toBe(sellPrice>0)
})