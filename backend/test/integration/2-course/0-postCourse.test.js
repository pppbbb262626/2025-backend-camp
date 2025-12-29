const {
  describe, it, expect, afterEach, beforeEach, beforeAll
// eslint-disable-next-line import/no-extraneous-dependencies
} = require('@jest/globals')
const { StatusCodes } = require('http-status-codes')

const TestServer = require('../testServer')
const { dataSource } = require('../../../db/data-source')

const route = '/api/courses/:courseId'

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
  let requestRoute = '/api/courses'
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
    requestRoute = `${requestRoute}/${courseId}`
  })
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('未帶入token，回傳HTTP Code 401', async () => {
    const result = await server
      .post(requestRoute)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.UNAUTHORIZED)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('請先登入')
  })

  it('帶入正確的課程資訊，回傳HTTP Code 201', async () => {
    const result = await server
      .post(requestRoute)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.CREATED)
    expect(result.body.status).toEqual('success')
    expect(result.body.data).toBe(null)
  })

  it('使用者無可使用堂數，回傳HTTP Code 400', async () => {
    const result = await server
      .post(requestRoute)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${coachToken}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('已無可使用堂數')
  })

  it('報名名額已滿的課程，回傳HTTP Code 400', async () => {
    await server
      .post(`/api/credit-package/${creditPackageId}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${coachToken}`)
      .expect('Content-Type', /json/)
      .expect(200)
    const result = await server
      .post(requestRoute)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${coachToken}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('已達最大參加人數，無法參加')
  })

  it('重複報名的課程，回傳HTTP Code 400', async () => {
    const result = await server
      .post(requestRoute)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.BAD_REQUEST)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('已經報名過此課程')
  })

  it('資料庫發生錯誤，回傳HTTP Code 500', async () => {
    jest.spyOn(dataSource, 'getRepository').mockImplementation(() => {
      throw new Error('資料庫發生錯誤')
    })
    const result = await server
      .post(requestRoute)
      .set('Authorization', `Bearer ${testUserToken}`)
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
