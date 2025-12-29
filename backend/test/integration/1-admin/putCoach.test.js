const {
  describe, it, expect, afterEach, beforeEach, beforeAll
// eslint-disable-next-line import/no-extraneous-dependencies
} = require('@jest/globals')
const { StatusCodes } = require('http-status-codes')

const TestServer = require('../testServer')
const { dataSource } = require('../../../db/data-source')

const route = '/api/admin/coaches'

describe(`PUT ${route}`, () => {
  let server
  const testCoachUserInfo = {
    name: '測試教練用戶45',
    email: `coach${new Date().getTime()}@example.com`,
    password: 'hexSchool12345'
  }
  const coachInfo = {
    experience_years: 1,
    description: 'test',
    profile_image_url: 'https://example.com'
  }
  const updateCoachInfo = {
    experience_years: 2,
    description: 'test2',
    profile_image_url: 'https://example.com/.jpg',
    skill_ids: null
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
    const skills = await server
      .get('/api/coaches/skill')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.OK)
    updateCoachInfo.skill_ids = skills.body.data.map(({ id }) => id)
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
      .put(route)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.UNAUTHORIZED)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('請先登入')
  })

  it('不輸入教練資訊，回傳HTTP Code 400', async () => {
    const result = await server
      .put(route)
      .send({})
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${coachToken}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('欄位未填寫正確')
  })
  it('輸入錯誤的教練年資，回傳HTTP Code 400', async () => {
    const result = await server
      .put(route)
      .send({
        experience_years: 'hi'
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${coachToken}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('欄位未填寫正確')
  })
  it('不輸入教練簡介，回傳HTTP Code 400', async () => {
    const result = await server
      .put(route)
      .send({
        experience_years: 1
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${coachToken}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('欄位未填寫正確')
  })
  it('輸入錯誤的教練簡介，回傳HTTP Code 400', async () => {
    const result = await server
      .put(route)
      .send({
        experience_years: 1,
        description: 2931
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${coachToken}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('欄位未填寫正確')
  })
  it('輸入錯誤的教練頭像，回傳HTTP Code 400', async () => {
    const result = await server
      .put(route)
      .send({
        experience_years: 1,
        description: 'test',
        profile_image_url: 'aabbcc'
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${coachToken}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('不輸入專長，回傳HTTP Code 400', async () => {
    const result = await server
      .put(route)
      .send({
        experience_years: 1,
        description: 'test',
        profile_image_url: 'https://...'
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${coachToken}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('輸入錯誤的專長，回傳HTTP Code 400', async () => {
    const result = await server
      .put(route)
      .send({
        experience_years: 1,
        description: 'test',
        profile_image_url: 'https://...',
        skill_ids: 'test'
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${coachToken}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('輸入錯誤的專長，回傳HTTP Code 400', async () => {
    const result = await server
      .put(route)
      .send({
        experience_years: 1,
        description: 'test',
        profile_image_url: 'https://...',
        skill_ids: []
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${coachToken}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('輸入錯誤的專長，回傳HTTP Code 400', async () => {
    const result = await server
      .put(route)
      .send({
        experience_years: 1,
        description: 'test',
        profile_image_url: 'https://...',
        skill_ids: [13456]
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${coachToken}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('帶入正確的教練資訊，回傳HTTP Code 200', async () => {
    const result = await server
      .put(route)
      .send(updateCoachInfo)
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
    expect(result.body.data.experience_years).toBe(updateCoachInfo.experience_years)
    expect(result.body.data.description).toBe(updateCoachInfo.description)
    expect(result.body.data.profile_image_url).toBe(updateCoachInfo.profile_image_url)
    expect(result.body.data.skill_ids.length).toEqual(updateCoachInfo.skill_ids.length)
    result.body.data.skill_ids.forEach((id) => {
      expect(id).toBe(updateCoachInfo.skill_ids.find((skillId) => skillId === id))
    })
  })

  it('資料庫發生錯誤，回傳HTTP Code 500', async () => {
    jest.spyOn(dataSource, 'getRepository').mockImplementation(() => {
      throw new Error('資料庫發生錯誤')
    })
    const result = await server
      .put(route)
      .send(updateCoachInfo)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${coachToken}`)
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
