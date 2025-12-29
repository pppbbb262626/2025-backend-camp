const {
  describe, it, expect, afterEach, beforeEach, beforeAll, afterAll
// eslint-disable-next-line import/no-extraneous-dependencies
} = require('@jest/globals')

const TestServer = require('../testServer')
const { dataSource } = require('../../../db/data-source')

const route = '/api/credit-package/:creditPackageId'
const requestBaseRoute = '/api/credit-package'
describe(`DELETE ${route}`, () => {
  let server
  let creditPackageId = null
  const testCreditPackageData = {
    name: `7 堂組合包方案-${new Date().getTime()}`,
    credit_amount: 7,
    price: 1000
  }
  beforeAll(async () => {
    server = await TestServer.getServer()
    const creditPackage = await server
      .post('/api/credit-package')
      .send(testCreditPackageData)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
    creditPackageId = creditPackage.body.data.id
  })
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('刪除購買方案，回傳HTTP Code 200', async () => {
    const result = await server
      .del(`${requestBaseRoute}/${creditPackageId}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
    expect(result.body.status).toEqual('success')
  })
  it('刪除重複的購買方案，回傳HTTP Code 400', async () => {
    const result = await server
      .del(`${requestBaseRoute}/${creditPackageId}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('ID錯誤')
  })
  it('輸入無效的ID，回傳HTTP Code 500', async () => {
    const result = await server
      .del(`${requestBaseRoute}/123456`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500)
    expect(result.body.status).toEqual('error')
    expect(result.body.message).toEqual('伺服器錯誤')
  })
  it('資料庫發生錯誤，回傳HTTP Code 500', async () => {
    jest.spyOn(dataSource, 'getRepository').mockImplementation(() => {
      throw new Error('資料庫發生錯誤')
    })
    const result = await server
      .del(`${requestBaseRoute}/test-1234`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500)
    expect(result.body.status).toEqual('error')
    expect(result.body.message).toEqual('伺服器錯誤')
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  afterAll(async () => {
    await TestServer.close()
  })
})
