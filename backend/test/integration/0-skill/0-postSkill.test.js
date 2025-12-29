const {
  describe, it, expect, afterEach, beforeEach, beforeAll, afterAll
// eslint-disable-next-line import/no-extraneous-dependencies
} = require('@jest/globals')

const TestServer = require('../testServer')
const { dataSource } = require('../../../db/data-source')

const route = '/api/coaches/skill'

describe(`POST ${route}`, () => {
  let server
  const testData = {
    name: `瑜伽-${new Date().getTime()}`
  }
  beforeAll(async () => {
    server = await TestServer.getServer()
  })
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('新增專長，回傳HTTP Code 200', async () => {
    const result = await server
      .post(route)
      .send(testData)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
    expect(result.body.status).toEqual('success')
    expect(typeof result.body.data).toBe('object')
    expect(typeof result.body.data.id).toBe('string')
    expect(result.body.data.name).toBe(testData.name)
    await server
      .post(route)
      .send({
        name: `瑜伽-${new Date().getTime()}`
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
    expect(result.body.status).toEqual('success')
    expect(typeof result.body.data).toBe('object')
    expect(typeof result.body.data.id).toBe('string')
    expect(result.body.data.name).toBe(testData.name)
    await server
      .post(route)
      .send({
        name: `瑜伽-${new Date().getTime() + 1}`
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
    expect(result.body.status).toEqual('success')
    expect(typeof result.body.data).toBe('object')
    expect(typeof result.body.data.id).toBe('string')
    expect(result.body.data.name).toBe(testData.name)
  })
  it('不輸入專長名稱，回傳HTTP Code 400', async () => {
    const result = await server
      .post(route)
      .send({})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('欄位未填寫正確')
  })
  it('輸入錯誤格式的專長名稱，回傳HTTP Code 400', async () => {
    const result = await server
      .post(route)
      .send({ name: 123 })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('欄位未填寫正確')
  })
  it('新增相同的專長，回傳HTTP Code 409', async () => {
    const result = await server
      .post(route)
      .send(testData)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(409)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('資料重複')
  })
  it('資料庫發生錯誤，回傳HTTP Code 500', async () => {
    jest.spyOn(dataSource, 'getRepository').mockImplementation(() => {
      throw new Error('資料庫發生錯誤')
    })
    const result = await server
      .post(route)
      .send(testData)
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
