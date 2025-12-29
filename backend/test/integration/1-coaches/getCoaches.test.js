const {
  describe, it, expect, afterEach, beforeEach, beforeAll, afterAll
// eslint-disable-next-line import/no-extraneous-dependencies
} = require('@jest/globals')
const { StatusCodes } = require('http-status-codes')

const TestServer = require('../testServer')
const { dataSource } = require('../../../db/data-source')

const route = '/api/coaches/'

describe(`GET ${route}`, () => {
  let server
  beforeAll(async () => {
    server = await TestServer.getServer()
  })
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('未帶入page，回傳HTTP Code 400', async () => {
    const result = await server
      .get(route)
      .query({ per: 10 })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('未帶入per，回傳HTTP Code 400', async () => {
    const result = await server
      .get(route)
      .query({ page: 10 })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('帶入錯誤的page，回傳HTTP Code 400', async () => {
    const result = await server
      .get(route)
      .query({ per: 10, page: 'test' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('帶入錯誤的per，回傳HTTP Code 400', async () => {
    const result = await server
      .get(route)
      .query({ per: 'test', page: 1 })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('取得教練清單，回傳HTTP Code 200', async () => {
    const result = await server
      .get(route)
      .query({ page: 1, per: 10 })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.OK)
    expect(result.body.status).toEqual('success')
    Array.isArray(result.body.data)
    expect(Array.isArray(result.body.data)).toBe(true)
    result.body.data.forEach((item) => {
      expect(typeof item).toBe('object')
      expect(typeof item.id).toBe('string')
      expect(typeof item.user_id).toBe('string')
      expect(typeof item.name).toBe('string')
    })
  })
  it('資料庫發生錯誤，回傳HTTP Code 500', async () => {
    jest.spyOn(dataSource, 'getRepository').mockImplementation(() => {
      throw new Error('資料庫發生錯誤')
    })
    const result = await server
      .get(route)
      .query({ page: 1, per: 10 })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.INTERNAL_SERVER_ERROR)
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
