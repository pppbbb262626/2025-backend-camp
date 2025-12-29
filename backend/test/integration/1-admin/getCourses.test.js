const {
  describe, it, expect, afterEach, beforeEach, beforeAll, afterAll
// eslint-disable-next-line import/no-extraneous-dependencies
} = require('@jest/globals')
const { StatusCodes } = require('http-status-codes')

const TestServer = require('../testServer')
const { dataSource } = require('../../../db/data-source')

const route = '/api/admin/coaches/courses'

describe(`GET ${route}`, () => {
  let server
  const testCoachUserInfo = {
    name: '測試教練用戶46',
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
    name: '瑜伽課程111',
    description: '瑜伽課程介紹111',
    start_at: '2025-01-01 16:00:00',
    end_at: '2025-01-01 18:00:00',
    max_participants: 1,
    meeting_url: 'https://....'
  }
  let userId
  let coachToken
  let courseId
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
    coachToken = loginResult.body.data.token
    const course = await server
      .post('/api/admin/coaches/courses')
      .send(courseInfo)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${coachToken}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.CREATED)
    courseId = course.body.data.course.id
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

  it('取得指定教練課程清單，回傳HTTP Code 200', async () => {
    const result = await server
      .get(route)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${coachToken}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.OK)
    expect(result.body.status).toEqual('success')
    Array.isArray(result.body.data)
    expect(Array.isArray(result.body.data)).toBe(true)
    result.body.data.forEach((item) => {
      expect(typeof item).toBe('object')
      expect(typeof item.id).toBe('string')
      expect(typeof item.name).toBe('string')
      expect(typeof item.status).toBe('string')
      expect(['尚未開始', '進行中', '已結束']).toContain(item.status)
      expect(typeof item.start_at).toBe('string')
      expect(typeof item.end_at).toBe('string')
      expect(typeof item.max_participants).toBe('number')
      expect(typeof item.meeting_url).toBe('string')
      expect(typeof item.participants).toBe('number')
      expect(item.id).toBe(courseId)
      expect(item.name).toBe(courseInfo.name)
      expect(item.start_at).toBe(new Date(courseInfo.start_at).toISOString())
      expect(item.end_at).toBe(new Date(courseInfo.end_at).toISOString())
      expect(item.max_participants).toBe(courseInfo.max_participants)
      expect(item.meeting_url).toBe(courseInfo.meeting_url)
      expect(item.participants).toBe(0)
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
