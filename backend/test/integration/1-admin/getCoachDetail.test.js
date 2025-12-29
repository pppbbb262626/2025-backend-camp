const {
  describe, it, expect, afterEach, beforeEach, beforeAll, afterAll
// eslint-disable-next-line import/no-extraneous-dependencies
} = require('@jest/globals')
const { StatusCodes } = require('http-status-codes')

const TestServer = require('../testServer')
const { dataSource } = require('../../../db/data-source')

const route = '/api/admin/coaches'

describe(`GET ${route}`, () => {
  let server
  const testCoachUserInfo = {
    name: '測試教練用戶41',
    email: `coach${new Date().getTime()}@example.com`,
    password: 'hexSchool12345'
  }
  const coachInfo = {
    experience_years: 1,
    description: 'test',
    profile_image_url: 'https://example.com'
  }
  let userId
  let coachToken
  beforeAll(async () => {
    server = await TestServer.getServer()
    const signupCoachUser = await server
      .post('/api/users/signup')
      .send(testCoachUserInfo)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.CREATED)
    userId = signupCoachUser.body.data.user.id
    await server
      .post(`/api/admin/coaches/${userId}`)
      .send(coachInfo)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.CREATED)
    const loginResult = await server
      .post('/api/users/login')
      .send({
        email: testCoachUserInfo.email,
        password: testCoachUserInfo.password
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.CREATED)
    coachToken = loginResult.body.data.token
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

  it('取得指定教練詳細資料，回傳HTTP Code 200', async () => {
    const result = await server
      .get(route)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${coachToken}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.OK)
    expect(result.body.status).toEqual('success')
    expect(typeof result.body.data.id).toBe('string')
    expect(typeof result.body.data.experience_years).toBe('number')
    expect(typeof result.body.data.description).toBe('string')
    expect(typeof result.body.data.profile_image_url).toBe('string')
    expect(Array.isArray(result.body.data.skill_ids)).toBe(true)
    expect(result.body.data.experience_years).toBe(coachInfo.experience_years)
    expect(result.body.data.description).toBe(coachInfo.description)
    expect(result.body.data.profile_image_url).toBe(coachInfo.profile_image_url)
    // expect(result.body.data.skill_ids.length).toEqual(coachInfo.skill_ids.length)
    result.body.data.skill_ids.forEach((id) => {
      expect(id).toBe(coachInfo.skill_ids.find((skillId) => skillId === id))
    })
  })
  it('資料庫發生錯誤，回傳HTTP Code 500', async () => {
    jest.spyOn(dataSource, 'getRepository').mockImplementation(() => {
      throw new Error('資料庫發生錯誤')
    })
    const result = await server
      .get(route)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${coachToken}`)
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
