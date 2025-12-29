const {
  describe, it, expect, afterEach, beforeEach, beforeAll
// eslint-disable-next-line import/no-extraneous-dependencies
} = require('@jest/globals')
const { StatusCodes } = require('http-status-codes')

const TestServer = require('../testServer')
const { dataSource } = require('../../../db/data-source')
const route = '/api/users/courses'

describe(`GET ${route}`, () => {
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
    start_at: '2026-01-01 16:00:00',
    end_at: '2026-12-31 18:00:00',
    max_participants: 1,
    meeting_url: 'https://....'
  }
  const testCreditPackageData = {
    name: `1 堂組合包方案-${new Date().getTime()}`,
    credit_amount: 1,
    price: 1000
  }
  let userId
  let testUserToken
  let coachToken
  let courseId
  let creditPackageId
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
    coachToken = loginResult.body.data.token
    const course = await server
      .post('/api/admin/coaches/courses')
      .send(courseInfo)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${coachToken}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.CREATED)
    courseId = course.body.data.course.id
    const creditPackage = await server
      .post('/api/credit-package')
      .send(testCreditPackageData)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
    creditPackageId = creditPackage.body.data.id
    await server
      .post(`/api/credit-package/${creditPackageId}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect('Content-Type', /json/)
      .expect(200)
    await server
      .post(`/api/courses/${courseId}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.CREATED)
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
  it('帶入正確的token，回傳HTTP Code 200', async () => {
    const result = await server
      .get(route)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.OK)
    expect(result.body.status).toEqual('success')
    expect(result.body.data.credit_remain).toEqual(0)
    expect(result.body.data.credit_usage).toEqual(1)
    expect(result.body.data.course_booking.length).toEqual(1)
    expect(result.body.data.course_booking[0].course_id).toEqual(courseId)
    expect(result.body.data.course_booking[0].name).toEqual(courseInfo.name)
    expect(result.body.data.course_booking[0].start_at).toEqual(
      new Date(courseInfo.start_at).toISOString()
    )
    expect(result.body.data.course_booking[0].end_at).toEqual(
      new Date(courseInfo.end_at).toISOString()
    )
    expect(result.body.data.course_booking[0].meeting_url).toEqual(
      courseInfo.meeting_url
    )
    expect(result.body.data.course_booking[0].coach_name).toEqual(
      testCoachUserInfo.name
    )
    expect(result.body.data.course_booking[0].cancelled_at).toBeNull()
  })
  it('資料庫發生錯誤，回傳HTTP Code 500', async () => {
    jest.spyOn(dataSource, 'getRepository').mockImplementation(() => {
      throw new Error('資料庫發生錯誤')
    })
    const result = await server
      .get(route)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${testUserToken}`)
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
