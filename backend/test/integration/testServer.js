const supertest = require('supertest')

const { dataSource } = require('../../db/data-source')
const app = require('../../app')

class TestServer {
  constructor () {
    this.server = supertest.agent(app)
    this.initialized = false
  }

  setAllHeader () {
    this.setAccept()
    this.setOrigin()
  }

  setAccept () {
    this.server = this.server.set('Accept', 'application/json')
    this.server = this.server.set('Content-Type', 'application/json')
  }

  setOrigin () {
    this.server = this.server.set('Origin', 'http://localhost')
  }

  async getServer () {
    // Ensure database is initialized and ready
    // Global setup should handle initial connection, but we verify here
    if (!dataSource.isInitialized) {
      await dataSource.initialize()
    }

    // Wait a bit to ensure schema synchronization is complete
    if (!this.initialized && dataSource.options.synchronize) {
      await new Promise(resolve => setTimeout(resolve, 100))
      this.initialized = true
    }

    return this.server
  }

  // eslint-disable-next-line class-methods-use-this
  async close () {
    // Don't destroy here - let global teardown handle it
    // This prevents issues with multiple test files
  }
}
module.exports = new TestServer()
