const webdriver = require('selenium-webdriver');
const dotEnv = require('dotenv').config();
const fs = require('fs')
const downloadDir = '/home/adri/Escritorio/tmp/'
const LOGIN_URL = process.env.R_URL
const USERNAME = process.env.R_USERNAME
const PASSWORD = process.env.R_PASSWORD

const scrape = async () => {
  const driver = await initialize(downloadDir);
  
  try {
    await login(driver, USERNAME, PASSWORD);
    await driver.manage().setTimeouts({ implicit: 10000 });
    const lastYear = await getLastAvaliableYear(driver)
    console.log(lastYear)
     for (let i = lastYear; i >= 2011; i--) {
      await driver.findElement(webdriver.By.xpath(`//option[@value='${i}']`)).click()
      const orderList = await getOrdersList(driver)
      if (!orderList) {
        return
      }
      if (await checkIfDownloaded(orderList)) {
        return
      }
      await getOrderData(driver, orderList)
      await driver.get(LOGIN_URL);
    }
  }
 finally {
    await driver.quit()
  }

}

const getLastAvaliableYear = async (driver) => {
  const lastYear= await driver.findElement(webdriver.By.xpath('//*[@id="combo_anos_facturacion"]/option[1]'))
  return await lastYear.getAttribute("value") 
}

const initialize = async (downloadDir) => {
  const defaultDownloadDir = '/home/adri/Escritorio'
  downloadDir = downloadDir || defaultDownloadDir;

  const chromeCapabilities = webdriver.Capabilities.chrome();
  const chromeOptions = {
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
    await driver.findElement(webdriver.By.id('dniCif')).sendKeys(username);
    await driver.findElement(webdriver.By.id('contrasena')).sendKeys(password, webdriver.Key.RETURN);
    await driver.manage().setTimeouts({ implicit: 10000 });
    await driver.wait(async () => {
      return await driver.findElement(webdriver.By.id('capa_cuentas_facturas'));
    }, 5000);
  } catch (error) {

  }
}

const checkIfDownloaded = async (orderArray) => {
  const fullPath = `/home/adri/Escritorio/tmp/${orderArray[0].toLowerCase()}.pdf`
  if (fs.existsSync(fullPath)) {
    return true
  }
  return
}

const getOrdersList = async (driver) => {
  let orders = []
  let ordersContainer = await driver.findElements(webdriver.By.xpath("//*[@id='capa_datos_facturas']/div[1]/div/div[1]/table/tbody/tr"))
  await driver.manage().setTimeouts({ implicit: 10000 });
  for (let i = ordersContainer.length; i >= 1; i--) {
    let order = driver.findElement(webdriver.By.xpath(`//*[@id='capa_datos_facturas']/div[1]/div/div[1]/table/tbody/tr[${i}]/td[1]`)).getText()
    orders.push(await order)
  }
  return orders
}

const getOrderData = async (driver, orderList) => {
  let ordersData = []
  for (i = 0; i < orderList.length; i++) {
    await driver.get(`https://clientes.mundo-r.com/clientes2/mis_facturas/ver_mis_facturas/detalle/?num_factura=${orderList[i]}`)
    await driver.manage().setTimeouts({ implicit: 10000 });
    let orderID = await driver.findElement(webdriver.By.xpath(`//*[@id="capa_datos_factura"]/div/div[1]/div[1]/table/tbody/tr[1]/td[2]/strong`)).getText()
    let orderDate = await driver.findElement(webdriver.By.xpath(`//*[@id="capa_datos_factura"]/div/div[1]/div[1]/table/tbody/tr[2]/td[2]/strong`)).getText()
    let orderAmount = await driver.findElement(webdriver.By.xpath(`//*[@id="capa_datos_factura"]/div/div[1]/div[1]/table/tbody/tr[3]/td[2]/strong`)).getText()

    ordersData.push(
      {
        id: orderID,
        amount: orderAmount,
        date: orderDate
      })

    await getPdfFromOrder(driver)

  }
  return ordersData
}

const getPdfFromOrder = async (driver) => {
  await driver.manage().setTimeouts({ implicit: 10000 });
  let downloadButton = await driver.findElement(webdriver.By.xpath("//*[@id='capa_datos_factura']/div/div[1]/div[3]/div/a"))
  downloadButton.click()
  await driver.manage().setTimeouts({ implicit: 10000 });
}


scrape()
