const {assert, expect} = require('chai');
const utils = require('../scraper.utils');
const moment = require("moment");

describe.skip('Scraper utils tests', () => {

    it('Should tranform spanish date string to unix', async () => {
      const validDate = '22 de noviembre de 2019';
      let formatedValidDate;

      try {
        formatedValidDate = utils.spanishStringDateToTimestamp(validDate);
      } catch (error) {
        expect(error).to.not.be.an.instanceOf(utils.InvalidDate);
      }

      assert.equal(1574380800, formatedValidDate);
    });
});