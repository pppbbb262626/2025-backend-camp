const {
  describe, it, expect, afterEach, beforeEach, beforeAll, afterAll
// eslint-disable-next-line import/no-extraneous-dependencies
} = require('@jest/globals')
const { StatusCodes } = require('http-status-codes')

const TestServer = require('../testServer')
const { dataSource } = require('../../../db/data-source')

const route = '/api/admin/coaches/revenue'
const fullMonthMap = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12
}
// reverse fullMonthMap
const monthMap = Object.fromEntries(Object.entries(fullMonthMap).map(([k, v]) => [v, k]))

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
  const testCoachUserInfo2 = {
    name: '測試教練用戶2222',
    email: `coach2${new Date().getTime()}@example.com`,
    password: 'hexSchool12345'
  }
  const coachInfo = {
    experience_years: 1,
    description: 'test',
    profile_image_url: 'https://example.com'
  }
  const courseInfo = {
    skill_id: null,
    name: `瑜伽課程-${new Date().getTime()}`,
    description: '瑜伽課程介紹',
    start_at: '2025-01-01 16:00:00',
    end_at: '2025-01-01 18:00:00',
    max_participants: 1,
    meeting_url: 'https://....'
  }
  const courseInfo2 = {
    skill_id: null,
    name: `瑜伽課程2-${new Date().getTime()}`,
    description: '瑜伽課程介紹',
    start_at: '2025-01-01 16:00:00',
    end_at: '2025-01-01 18:00:00',
    max_participants: 1,
    meeting_url: 'https://....'
  }
  const testCreditPackageData = {
    name: `10 堂組合包方案-${new Date().getTime()}`,
    credit_amount: 10,
    price: 1000
  }
  let userId
  let testUserToken
  let coachToken
  let coachToken2
  let courseId
  let creditPackageId
  let courseId2
  let testRevenue
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
    const signupCoachUser2 = await server
      .post('/api/users/signup')
      .send(testCoachUserInfo2)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.CREATED)
    userId = signupCoachUser.body.data.user.id
    const secondUserId = signupCoachUser2.body.data.user.id
    await server
      .post(`/api/admin/coaches/${userId}`)
      .send(coachInfo)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.CREATED)
    await server
      .post(`/api/admin/coaches/${secondUserId}`)
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
    courseInfo2.skill_id = skills.body.data[0].id
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
    const loginResult2 = await server
      .post('/api/users/login')
      .send({
        email: testCoachUserInfo2.email,
        password: testCoachUserInfo2.password
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.CREATED)
    coachToken2 = loginResult2.body.data.token
    const course = await server
      .post('/api/admin/coaches/courses')
      .send(courseInfo)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${coachToken}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.CREATED)
    const course2 = await server
      .post('/api/admin/coaches/courses')
      .send(courseInfo2)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${coachToken}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.CREATED)
    courseId = course.body.data.course.id
    courseId2 = course2.body.data.course.id
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
    await server
      .post(`/api/courses/${courseId2}`)
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${testUserToken}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.CREATED)
    const creditPackages = await server
      .get('/api/credit-package')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(StatusCodes.OK)
    let totalCreditPackagePrice = 0
    let totalCreditAmount = 0
    creditPackages.body.data.forEach(({ price, credit_amount: creditAmount }) => {
      totalCreditPackagePrice += parseInt(price, 10)
      totalCreditAmount += creditAmount
    })
    const perCreditPackagePrice = totalCreditPackagePrice / totalCreditAmount
    testRevenue = Math.floor(perCreditPackagePrice * 2)
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

  it('取得指定教練月營收資(無營收資料)，回傳HTTP', async () => {
    const result = await server
      .get(route)
      .query({
        month: monthMap[new Date().getMonth() + 1]
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${coachToken2}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.OK)
    expect(result.body.status).toEqual('success')
    expect(result.body.data.total.revenue).toEqual(0)
    expect(result.body.data.total.participants).toEqual(0)
    expect(result.body.data.total.course_count).toEqual(0)
  })

  it('取得指定教練月營收資料，回傳HTTP Code 200', async () => {
    const result = await server
      .get(route)
      .query({
        month: monthMap[new Date().getMonth() + 1]
      })
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${coachToken}`)
      .expect('Content-Type', /json/)
      .expect(StatusCodes.OK)
    expect(result.body.status).toEqual('success')
    expect(result.body.data.total.revenue).toEqual(testRevenue)
    expect(result.body.data.total.participants).toEqual(1)
    expect(result.body.data.total.course_count).toEqual(2)
  })

  it('資料庫發生錯誤，回傳HTTP Code 500', async () => {
    jest.spyOn(dataSource, 'getRepository').mockImplementation(() => {
      throw new Error('資料庫發生錯誤')
    })
    const result = await server
      .get(route)
      .query({
        month: monthMap[new Date().getMonth() + 1]
      })
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
