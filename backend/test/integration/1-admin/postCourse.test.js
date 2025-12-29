const {
  describe, it, expect, afterEach, beforeEach, beforeAll
// eslint-disable-next-line import/no-extraneous-dependencies
} = require('@jest/globals')
const { StatusCodes } = require('http-status-codes')

const TestServer = require('../testServer')
const { dataSource } = require('../../../db/data-source')

const route = '/api/admin/coaches/courses'

describe(`POST ${route}`, () => {
  let server
  const testUserInfo = {
    name: '測試用戶',
    email: `test${new Date().getTime()}@example.com`,
    password: 'hexSchool12345'
  }
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
  const courseInfo = {
    skill_id: null,
    name: '瑜伽課程',
    description: '瑜伽課程介紹',
    start_at: '2025-01-01 16:00:00',
    end_at: '2025-01-01 18:00:00',
    max_participants: 10,
    meeting_url: 'https://....'
  }
  let userId
  let testUserToken
  let token
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
    courseInfo.skill_id = skills.body.data[0].id
    const loginResult = await server
      .post('/api/users/login')
      .send({
        email: testCoachUserInfo.email,
        password: testCoachUserInfo.password
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.CREATED)
    token = loginResult.body.data.token
  })
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('未帶入token，回傳HTTP Code 401', async () => {
    const result = await server
      .post(route)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.UNAUTHORIZED)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('請先登入')
  })

  it('不輸入課程資訊，回傳HTTP Code 400', async () => {
    const result = await server
      .post(route)
      .send({})
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('輸入錯誤的專長ID，回傳HTTP Code 400', async () => {
    const result = await server
      .post(route)
      .send({
        skill_id: 123
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('輸入錯誤的課程名稱，回傳HTTP Code 400', async () => {
    const result = await server
      .post(route)
      .send({
        skill_id: courseInfo.skill_id,
        name: 1234
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('輸入錯誤的課程簡介，回傳HTTP Code 400', async () => {
    const result = await server
      .post(route)
      .send({
        skill_id: courseInfo.skill_id,
        name: courseInfo.name,
        description: 123
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('輸入錯誤的課程開始時間，回傳HTTP Code 400', async () => {
    const result = await server
      .post(route)
      .send({
        skill_id: courseInfo.skill_id,
        name: courseInfo.name,
        description: courseInfo.description,
        start_at: null
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('輸入錯誤的課程結束時間，回傳HTTP Code 400', async () => {
    const result = await server
      .post(route)
      .send({
        skill_id: courseInfo.skill_id,
        name: courseInfo.name,
        description: courseInfo.description,
        start_at: courseInfo.start_at,
        end_at: null
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('輸入錯誤的最大上課人數，回傳HTTP Code 400', async () => {
    const result = await server
      .post(route)
      .send({
        skill_id: courseInfo.skill_id,
        name: courseInfo.name,
        description: courseInfo.description,
        start_at: courseInfo.start_at,
        end_at: courseInfo.end_at,
        max_participants: 'test'
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('輸入錯誤的線上直播網址，回傳HTTP Code 400', async () => {
    const result = await server
      .post(route)
      .send({
        skill_id: courseInfo.skill_id,
        name: courseInfo.name,
        description: courseInfo.description,
        start_at: courseInfo.start_at,
        end_at: courseInfo.end_at,
        max_participants: courseInfo.max_participants,
        meeting_url: 'test'
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('欄位未填寫正確')
  })

  it('輸入非教練的使用者，回傳HTTP Code 400', async () => {
    const result = await server
      .post(route)
      .send(courseInfo)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.UNAUTHORIZED)
    expect(result.body.status).toEqual('failed')
    expect(typeof result.body.message).toBe('string')
    expect(result.body.message).toBe('使用者尚未成為教練')
  })

  it('帶入正確的課程資訊，回傳HTTP Code 201', async () => {
    const result = await server
      .post(route)
      .send(courseInfo)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.CREATED)
    expect(result.body.status).toEqual('success')
    expect(typeof result.body.data.course.id).toBe('string')
    expect(typeof result.body.data.course.user_id).toBe('string')
    expect(result.body.data.course.skill_id).toEqual(courseInfo.skill_id)
    expect(result.body.data.course.name).toEqual(courseInfo.name)
    expect(result.body.data.course.description).toEqual(courseInfo.description)
    expect(result.body.data.course.start_at).toEqual(new Date(courseInfo.start_at).toISOString())
    expect(result.body.data.course.end_at).toEqual(new Date(courseInfo.end_at).toISOString())
    expect(result.body.data.course.max_participants).toEqual(
      courseInfo.max_participants
    )
    expect(result.body.data.course.meeting_url).toEqual(courseInfo.meeting_url)
  })

  it('資料庫發生錯誤，回傳HTTP Code 500', async () => {
    jest.spyOn(dataSource, 'getRepository').mockImplementation(() => {
      throw new Error('資料庫發生錯誤')
    })
    const result = await server
      .post(route)
      .set('Authorization', `Bearer ${token}`)
      .send(courseInfo)
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
