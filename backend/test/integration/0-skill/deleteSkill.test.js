const {
  describe, it, expect, afterEach, beforeEach, beforeAll, afterAll
// eslint-disable-next-line import/no-extraneous-dependencies
} = require('@jest/globals')

const TestServer = require('../testServer')
const { dataSource } = require('../../../db/data-source')

const route = '/api/coaches/skill/:skillId'
const requestBaseRoute = '/api/coaches/skill'
describe(`DELETE ${route}`, () => {
  let server
  let skillId = null
  beforeAll(async () => {
    server = await TestServer.getServer()
    const getSkill = await server
      .get('/api/coaches/skill')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
    skillId = getSkill.body.data[0].id
  })
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('刪除專長，回傳HTTP Code 200', async () => {
    const result = await server
      .del(`${requestBaseRoute}/${skillId}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
    expect(result.body.status).toEqual('success')
  })
  it('刪除重複的專長，回傳HTTP Code 200', async () => {
    const result = await server
      .del(`${requestBaseRoute}/${skillId}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
    expect(result.body.status).toEqual('failed')
    expect(result.body.message).toEqual('ID錯誤')
  })
  it('輸入無效的ID，回傳HTTP Code 500', async () => {
    const result = await server
      .del(`${requestBaseRoute}/123456`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500)
    expect(result.body.status).toEqual('error')
    expect(result.body.message).toEqual('伺服器錯誤')
  })
  it('資料庫發生錯誤，回傳HTTP Code 500', async () => {
    jest.spyOn(dataSource, 'getRepository').mockImplementation(() => {
      throw new Error('資料庫發生錯誤')
    })
    const result = await server
      .del(`${requestBaseRoute}/test-1234`)
      .set('Accept', 'application/json')
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
