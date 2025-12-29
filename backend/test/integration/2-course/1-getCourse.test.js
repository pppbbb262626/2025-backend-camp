const {
  describe, it, expect, afterEach, beforeEach, beforeAll, afterAll
// eslint-disable-next-line import/no-extraneous-dependencies
} = require('@jest/globals')
const { StatusCodes } = require('http-status-codes')

const TestServer = require('../testServer')
const { dataSource } = require('../../../db/data-source')

const route = '/api/courses/'

describe(`GET ${route}`, () => {
  let server
  beforeAll(async () => {
    server = await TestServer.getServer()
  })
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('取得課程清單，回傳HTTP Code 200', async () => {
    const result = await server
      .get(route)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.OK)
    expect(result.body.status).toEqual('success')
    Array.isArray(result.body.data)
    expect(Array.isArray(result.body.data)).toBe(true)
    result.body.data.forEach((course) => {
      expect(typeof course).toBe('object')
      expect(typeof course.id).toBe('string')
      expect(typeof course.name).toBe('string')
      expect(typeof course.description).toBe('string')
      expect(typeof course.start_at).toBe('string')
      expect(typeof course.end_at).toBe('string')
      expect(typeof course.max_participants).toBe('number')
      expect(typeof course.coach_name).toBe('string')
      expect(typeof course.skill_name).toBe('string')
    })
  })
  it('資料庫發生錯誤，回傳HTTP Code 500', async () => {
    jest.spyOn(dataSource, 'getRepository').mockImplementation(() => {
      throw new Error('資料庫發生錯誤')
    })
    const result = await server
      .get(route)
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
