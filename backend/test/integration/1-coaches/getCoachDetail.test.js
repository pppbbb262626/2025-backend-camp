const {
  describe, it, expect, afterEach, beforeEach, beforeAll, afterAll
// eslint-disable-next-line import/no-extraneous-dependencies
} = require('@jest/globals')
const { StatusCodes } = require('http-status-codes')

const TestServer = require('../testServer')
const { dataSource } = require('../../../db/data-source')

const route = '/api/coaches/:coachId'

describe(`GET ${route}`, () => {
  let server
  let coachId
  let requestRoute = '/api/coaches'
  beforeAll(async () => {
    server = await TestServer.getServer()
    const result = await server
      .get('/api/coaches/')
      .query({ page: 1, per: 10 })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.OK)
    coachId = result.body.data[0].id
    requestRoute = `${requestRoute}/${coachId}`
  })
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('帶入錯誤的教練ID，回傳HTTP Code 400', async () => {
    const result = await server
      .get('/api/coaches/undefined')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('帶入不存在的教練，回傳HTTP Code 400', async () => {
    const result = await server
      .get('/api/coaches/1c8da31a-5fd2-44f3-897e-4a259e7ec62b')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('找不到該教練')
  })

  it('帶入正確的教練ID，回傳HTTP Code 200', async () => {
    const result = await server
      .get(requestRoute)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.OK)
    expect(result.body.status).toEqual('success')
    expect(result.body.status).toEqual('success')
    expect(typeof result.body.data.user.name).toEqual('string')
    expect(result.body.data.user.role).toEqual('COACH')
    expect(result.body.data.coach.id).toBe(coachId)
    expect(typeof result.body.data.coach.user_id).toBe('string')
    expect(typeof result.body.data.coach.experience_years).toBe('number')
    expect(typeof result.body.data.coach.description).toBe('string')
    if (result.body.data.coach.profile_image_url) {
      expect(typeof result.body.data.coach.profile_image_url).toBe('string')
    }
    expect(typeof result.body.data.coach.created_at).toBe('string')
    expect(typeof result.body.data.coach.updated_at).toBe('string')
    expect(Array.isArray(result.body.data.coach.skills)).toBe(true)
    result.body.data.coach.skills.forEach((skill) => {
      expect(typeof skill).toBe('string')
    })
  })
  it('資料庫發生錯誤，回傳HTTP Code 500', async () => {
    jest.spyOn(dataSource, 'getRepository').mockImplementation(() => {
      throw new Error('資料庫發生錯誤')
    })
    const result = await server
      .get(requestRoute)
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
