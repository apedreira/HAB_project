const webdriver = require('selenium-webdriver');
const dotEnv = require('dotenv').config();

class LoginFailed extends Error {};
class NotAccessible extends Error {};
class NotOrdersFinded extends Error {};

const LOGIN_URL = `https://www.amazon.es/gp/your-account/order-history?orderFilter=year-${new Date().getFullYear()}`;
const USERNAME = process.env.AMAZON_USERNAME;
const PASSWORD = process.env.AMAZON_PASSWORD;

const scrape = async () => {
  let links = [];

  try {
    const driver = await initialize();

    await login(driver, USERNAME, PASSWORD);

    const orders = await driver.findElements(webdriver.By.className('order'));

    for (let i = 0; i < orders.length; i++) {
        const actions = await orders[i].findElement(webdriver.By.className('actions'));

        await actions.findElement(webdriver.By.className('a-popover-trigger')).click();
        
        const popover = await driver.findElement(webdriver.By.id(`a-popover-${i + 1}`));
        await driver.wait(async () => {
          return await popover.findElement(webdriver.By.className('a-popover-wrapper')).getAttribute('aria-busy') == 'false';
        }, 5000);

        const linkElements = await popover.findElements(webdriver.By.partialLinkText('Factura'));

        for(let element of linkElements) {
          const link = await element.getAttribute('href');
          await driver.get(link);
          // links.push(link);
        }
    }
  } finally {
    // await driver.quit();
  }
};

const initialize = async (downloadDir) => {
  // const defaultDownloadDir = '/app/files';
  const defaultDownloadDir = '/home/max/Documents/BOOTCAMP-HACKABOS/final_project/selenium-scrapper/files'
  downloadDir = downloadDir || defaultDownloadDir;

  var chromeCapabilities = webdriver.Capabilities.chrome();
  var chromeOptions = {
    args: [
      "start-maximized",
      'disable-gpu',
      'disable-dev-shm-usage', 
      'no-sandbox', 
      'ignore-certificate-errors',
      'allow-running-insecure-content',
      'allow-insecure-localhost'
    ],
    prefs: {
      "download.default_directory": downloadDir,
      "download.prompt_for_download": false,
      "download.directory_upgrade": true,
      "plugins.always_open_pdf_externally": true
    }
  };
  chromeCapabilities.set('chromeOptions', chromeOptions);

  return await new webdriver.Builder().withCapabilities(chromeCapabilities).build();
}

const login = async (driver, username, password) => {
  try {
    await driver.get(LOGIN_URL);
    await driver.findElement(webdriver.By.name('email')).sendKeys(username, webdriver.Key.RETURN);
    await driver.findElement(webdriver.By.name('password')).sendKeys(password, webdriver.Key.RETURN);
    await driver.wait(async () => {
      return await driver.findElement(webdriver.By.id('ordersContainer'));
    }, 5000);
  } catch (error) {
    throw new LoginFailed();
  }
}

const getOrders = async (driver) => {
  let ordersContainer;
  let orders = [];

  try {
    ordersContainer = await driver.findElement(webdriver.By.id('ordersContainer'));
    orders = await ordersContainer.findElements(webdriver.By.className('order'));
  } catch (error) {
    throw new NotAccessible();
  }

  if(orders.length === 0) {
    throw new NotOrdersFinded();
  }

  return orders;
}

const getOrdersData = async (driver, orders) => {
  for (let i = 0; i < orders.length; i++) {
    getDataFromOrder(order);
  }
}

const getDataFromOrder = async order => {
  const orderData = {
    date: null,
    amount: null,
    number: null
  }

  try {
    const data = await order
      .findElement(webdriver.By.className('order-info'))
      .findElements(webdriver.By.className('value'));
      
    orderData.date = await data[0].getText();
    orderData.amount = await data[1].getText();
    orderData.number = await data[data.length -1].getText();
  } catch (error) {
    throw new NotAccessible();
  }

  return orderData;
}

const getPdfFromOrder = async order => {
  const actions = await orders[i].findElement(webdriver.By.className('actions'));

  await actions.findElement(webdriver.By.className('a-popover-trigger')).click();
  
  const popover = await driver.findElement(webdriver.By.id(`a-popover-${i + 1}`));
  await driver.wait(async () => {
    return await popover.findElement(webdriver.By.className('a-popover-wrapper')).getAttribute('aria-busy') == 'false';
  }, 5000);

  const linkElements = await popover.findElements(webdriver.By.partialLinkText('Factura'));

  for(let element of linkElements) {
    const link = await element.getAttribute('href');
    await driver.get(link);
    // links.push(link);
  }
}

module.exports = {
  LoginFailed,
  NotAccessible,
  NotOrdersFinded,
  scrape, 
  initialize, 
  login,
  getOrders,
  getOrdersData,
  getDataFromOrder
};