const {
  describe, it, expect, afterEach, beforeEach, beforeAll
// eslint-disable-next-line import/no-extraneous-dependencies
} = require('@jest/globals')
const { StatusCodes } = require('http-status-codes')

const TestServer = require('../testServer')
const { dataSource } = require('../../../db/data-source')
const route = '/api/users/credit-package'

describe(`GET ${route}`, () => {
  let server
  const testUserInfo = {
    name: '測試用戶',
    email: `test${new Date().getTime()}@example.com`,
    password: 'hexSchool12345'
  }
  const testCreditPackageData = {
    name: `1 堂組合包方案-${new Date().getTime()}`,
    credit_amount: 1,
    price: 1000
  }
  let testUserToken
  let creditPackageId
  beforeAll(async () => {
    server = await TestServer.getServer()
    await server
      .post('/api/users/signup')
      .send(testUserInfo)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.CREATED)
    const testUserLoginResult = await server
      .post('/api/users/login')
      .send({
        email: testUserInfo.email,
        password: testUserInfo.password
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.CREATED)
    testUserToken = testUserLoginResult.body.data.token
    const creditPackage = await server
      .post('/api/credit-package')
      .send(testCreditPackageData)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
    creditPackageId = creditPackage.body.data.id
    await server
      .post(`/api/credit-package/${creditPackageId}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect('Content-Type', /json/)
      .expect(200)
  })
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('未帶入token，回傳HTTP Code 401', async () => {
    const result = await server
      .get(route)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.UNAUTHORIZED)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('請先登入')
  })
  it('帶入正確的token，回傳HTTP Code 200', async () => {
    const result = await server
      .get(route)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.OK)
    expect(result.body.status).toEqual('success')
    expect(Array.isArray(result.body.data)).toBe(true)
    expect(typeof result.body.data[0].purchased_credits).toBe('number')
    expect(typeof result.body.data[0].price_paid).toBe('number')
    expect(typeof result.body.data[0].name).toBe('string')
    expect(typeof result.body.data[0].purchase_at).toBe('string')
  })
  it('資料庫發生錯誤，回傳HTTP Code 500', async () => {
    jest.spyOn(dataSource, 'getRepository').mockImplementation(() => {
      throw new Error('資料庫發生錯誤')
    })
    const result = await server
      .get(route)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${testUserToken}`)
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
