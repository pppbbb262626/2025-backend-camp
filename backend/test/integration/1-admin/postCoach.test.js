const {
  describe, it, expect, afterEach, beforeEach, beforeAll
// eslint-disable-next-line import/no-extraneous-dependencies
} = require('@jest/globals')
const { StatusCodes } = require('http-status-codes')

const TestServer = require('../testServer')
const { dataSource } = require('../../../db/data-source')

const route = '/api/admin/coaches/:userId'

describe(`POST ${route}`, () => {
  let server
  const testCoachUserInfo = {
    name: '測試教練用戶',
    email: `coach${new Date().getTime()}@example.com`,
    password: 'hexSchool12345'
  }
  const coachInfo = {
    experience_years: 1,
    description: 'test',
    profile_image_url: 'https://example.com'
  }
  let userId
  let requestRoute = '/api/admin/coaches'
  beforeAll(async () => {
    server = await TestServer.getServer()
    const signupCoachUser = await server
      .post('/api/users/signup')
      .send(testCoachUserInfo)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.CREATED)
    userId = signupCoachUser.body.data.user.id
    requestRoute = `${requestRoute}/${userId}`
  })
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('不輸入教練資訊，回傳HTTP Code 400', async () => {
    const result = await server
      .post(requestRoute)
      .send({})
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('欄位未填寫正確')
  })
  it('輸入錯誤的教練年資，回傳HTTP Code 400', async () => {
    const result = await server
      .post(requestRoute)
      .send({
        experience_years: 'hi'
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('欄位未填寫正確')
  })
  it('不輸入教練簡介，回傳HTTP Code 400', async () => {
    const result = await server
      .post(requestRoute)
      .send({
        experience_years: 1
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('欄位未填寫正確')
  })
  it('輸入錯誤的教練簡介，回傳HTTP Code 400', async () => {
    const result = await server
      .post(requestRoute)
      .send({
        experience_years: 1,
        description: 2931
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('欄位未填寫正確')
  })
  it('輸入錯誤的教練頭像，回傳HTTP Code 400', async () => {
    const result = await server
      .post(requestRoute)
      .send({
        experience_years: 1,
        description: 'test',
        profile_image_url: 'aabbcc'
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('更新使用者失敗，回傳HTTP Code 400', async () => {
    const userRepo = dataSource.getRepository('User')
    jest.spyOn(userRepo, 'update').mockImplementation(() => ({
      affected: 0
    }))
    const result = await server
      .post(requestRoute)
      .send(coachInfo)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('更新使用者失敗')
  })

  it('帶入正確的教練資訊，回傳HTTP Code 201', async () => {
    const result = await server
      .post(requestRoute)
      .send(coachInfo)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.CREATED)
    expect(result.body.status).toEqual('success')
    expect(result.body.data.user.name).toEqual(testCoachUserInfo.name)
    expect(result.body.data.user.role).toEqual('COACH')
    expect(typeof result.body.data.coach.id).toBe('string')
    expect(result.body.data.coach.user_id).toBe(userId)
    expect(result.body.data.coach.experience_years).toBe(coachInfo.experience_years)
    expect(result.body.data.coach.description).toBe(coachInfo.description)
    expect(result.body.data.coach.profile_image_url).toBe(coachInfo.profile_image_url)
    expect(typeof result.body.data.coach.created_at).toBe('string')
    expect(typeof result.body.data.coach.updated_at).toBe('string')
  })
  it('輸入重複的教練資訊，回傳HTTP Code 409', async () => {
    const result = await server
      .post(requestRoute)
      .send(coachInfo)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.CONFLICT)
    expect(result.body.status).toEqual('failed')
    expect(typeof result.body.message).toBe('string')
    expect(result.body.message).toBe('使用者已經是教練')
  })
  it('輸入不存在的使用者，回傳HTTP Code 409', async () => {
    const result = await server
      .post('/api/admin/coaches/1c8da31a-5fd2-44f3-897e-4a259e7ec62b')
      .send(coachInfo)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(typeof result.body.message).toBe('string')
    expect(result.body.message).toBe('使用者不存在')
  })
  it('資料庫發生錯誤，回傳HTTP Code 500', async () => {
    jest.spyOn(dataSource, 'getRepository').mockImplementation(() => {
      throw new Error('資料庫發生錯誤')
    })
    const result = await server
      .post(requestRoute)
      .send(coachInfo)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500)
    expect(result.body.status).toEqual('error')
    expect(result.body.message).toEqual('伺服器錯誤')
  })
  afterEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })
  afterAll(async () => {
    await TestServer.close()
  })
})
