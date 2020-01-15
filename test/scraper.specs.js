const {assert, expect} = require('chai');
const fsPromises = require('fs').promises;
const scraper = require('../scraper.amazon');

let driver;
const USERNAME = 'elantiswing@hotmail.com';
const USERNAME2 = 'maxgomezsite@gmail.com';
const PASSWORD = 'cft6vgy7bhu8';

describe('Scraper tests', () => {

  beforeEach(async () => {
    driver = await scraper.initialize();
    return;
  });

  afterEach(async () => {
    // await driver.quit();
    return;
  });

  describe('Login tests', () => {

    it.skip('Test login invalid username', async () => {
      const badUsername = 'elantiswing@gmail.com';
      let error;

      try {
        await scraper.login(driver, badUsername, PASSWORD);
      } catch (e) {
        error = e
      }
      
      expect(error).to.be.an.instanceof(scraper.LoginFailed);
    });

    it.skip('Test login invalid password', async () => {
      const badPassword = '123123';
      let error;

      try {
        await scraper.login(driver, USERNAME, badPassword);
      } catch (e) {
        error = e
      }
      
      expect(error).to.be.an.instanceof(scraper.LoginFailed);
    });

    it('Test login valid', async () => {
      let error;

      try {
        await scraper.login(driver, USERNAME, PASSWORD);
      } catch (e) {
        error = e;
      }
      
      expect(error).to.not.be.an.instanceof(scraper.LoginFailed);
    });
  });

  describe.skip('Get orders', () => {

    it('Test empty orders', async () => {
      let error;

      try {
        await scraper.login(driver, USERNAME2, PASSWORD);
        await scraper.getOrders(driver);
      } catch (e) {
        error = e;
      }
      
      expect(error).to.be.an.instanceof(scraper.NotOrdersFinded);
    });

    it('Test orders quantity', async () => {
      let error;
      let orders = [];

      try {
        await scraper.login(driver, USERNAME, PASSWORD);
        orders = await scraper.getOrders(driver);
      } catch (e) {
        error = e;
      }
      
      expect(error).to.not.be.an.instanceof(scraper.NotOrdersFinded);
      assert.equal(true, orders.length !== 0);
    });
  });

  describe.skip('Get orders data', () => {

    let orders = [];

    // beforeEach(async () => {
    //   await scraper.login(driver, USERNAME, PASSWORD);
    //   orders = await scraper.getOrders(driver);
    //   return;
    // });

    // it('Test order data has values', async () => {
    //   let orderData;

    //   try {
    //     orderData = await scraper.getDataFromOrder(orders[5]);
    //   } catch (e) {}
      
    //   assert.equal(true, orderData.date !== null);
    //   assert.equal(true, orderData.amount !== null);
    //   assert.equal(true, orderData.number !== null);
    // });

    it('File was downloaded', async () => {
      const tmpDir = './tmp';

      try {
        await fsPromises.stat(tmpDir);
      } catch (error) {
        if(error.code === 'ENOENT') {
          await fsPromises.mkdir(tmpDir);
        }
      }

      try {
        customDriver = await scraper.initialize(tmpDir);
        await scraper.login(customDriver, USERNAME, PASSWORD);
        orders = await scraper.getOrders(driver);
        await scraper.getPdfFromOrder(orders[0]);
      } catch (e) {
        console.log('errorrorrorr')
        console.log(e)
      }
      
    });
  });
});