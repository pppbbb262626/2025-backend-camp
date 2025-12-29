const {
  describe, it, expect, afterEach, beforeEach, beforeAll, afterAll
// eslint-disable-next-line import/no-extraneous-dependencies
} = require('@jest/globals')
const { StatusCodes } = require('http-status-codes')

const TestServer = require('../testServer')
const { dataSource } = require('../../../db/data-source')

const route = '/api/admin/coaches/courses/:courseId'

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
  let requestRoute
  let skills
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
    skills = await server
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
    requestRoute = `/api/admin/coaches/courses/${courseId}`
  })
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('未帶入token，回傳HTTP Code 401', async () => {
    const result = await server
      .get(requestRoute)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.UNAUTHORIZED)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('請先登入')
  })

  it('帶入不存在的courseId，回傳HTTP Code 400', async () => {
    const result = await server
      .get('/api/admin/coaches/courses/1c8da31a-5fd2-44f3-897e-4a259e7ec62b')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${coachToken}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('課程不存在')
  })

  it('取得指定教練課程詳細資料，回傳HTTP Code 200', async () => {
    const result = await server
      .get(requestRoute)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${coachToken}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.OK)
    expect(result.body.status).toEqual('success')
    expect(typeof result.body.data).toBe('object')
    expect(typeof result.body.data.id).toBe('string')
    expect(typeof result.body.data.name).toBe('string')
    expect(typeof result.body.data.skill_name).toBe('string')
    expect(typeof result.body.data.start_at).toBe('string')
    expect(typeof result.body.data.end_at).toBe('string')
    expect(typeof result.body.data.max_participants).toBe('number')
    expect(result.body.data.id).toBe(courseId)
    expect(result.body.data.name).toBe(courseInfo.name)
    expect(result.body.data.start_at).toBe(new Date(courseInfo.start_at).toISOString())
    expect(result.body.data.end_at).toBe(new Date(courseInfo.end_at).toISOString())
    expect(result.body.data.max_participants).toBe(courseInfo.max_participants)
    expect(result.body.data.skill_name).toBe(skills.body.data[0].name)
    expect(typeof result.body.data.skill_id).toBe('string')
    expect(result.body.data.skill_id).toBe(courseInfo.skill_id)
    expect(typeof result.body.data.description).toBe('string')
    expect(typeof result.body.data.meeting_url).toBe('string')
    expect(result.body.data.description).toBe(courseInfo.description)
    expect(result.body.data.meeting_url).toBe(courseInfo.meeting_url)
  })
  it('資料庫發生錯誤，回傳HTTP Code 500', async () => {
    jest.spyOn(dataSource, 'getRepository').mockImplementation(() => {
      throw new Error('資料庫發生錯誤')
    })
    const result = await server
      .get(requestRoute)
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
