const webdriver = require('selenium-webdriver');
const dotEnv = require('dotenv').config();
const fs = require('fs')
const downloadDir = '/home/adri/Escritorio/development/hack_a_bos/Project/invoice_aggregator/tmp/'
const LOGIN_URL = process.env.AMAZON_URL
const USERNAME = process.env.AMAZON_USERNAME
const PASSWORD = process.env.AMAZON_PASSWORD


const scrape = async () => {
  const driver = await initialize(downloadDir);
  await login(driver, USERNAME, PASSWORD);
  const yearsLinks = await getYearsLinks(driver)

  for (let yearLink of yearsLinks) {
    await driver.get(yearLink)

    let pageLinks = await getPageLinks(driver)
    for (let pageLink of pageLinks) {
      await driver.get(pageLink)

      let orderLinks = await getOrderLinks(driver)
      for (let orderLink of orderLinks) {
        await driver.get(orderLink)
        const hasInvoice = await checkIfInvoice(driver)
        if (hasInvoice) {
          const orderData = await getOrderData(driver, hasInvoice)
          if (await checkIfDownloaded(downloadDir, orderData)) {
            return
          }
          //clearInvoice()
          const fileName ="Invoice.pdf"
          fs.unlink(downloadDir + fileName, function (err) {
            if (err) throw err;
          })
          await getPdfFromOrder(driver)
         
          await new Promise((resolve, reject) => {
            let count = 0
            const i = setInterval(async() => {
              count++
              if (count < 10) {
                console.log("Entra: "+count)
                clearInterval(i)
                resolve()
              }
              console.log("Fuera: "+count)
              try { 
                await renamePdf(orderData, downloadDir)
                clearInterval(i)
                resolve()
              }
              catch (e) { }
            }, 1000)
          })
          //await driver.sleep(5000)
        }
      }
    }
  }
}

const clearInvoice = async (downloadDir) => {
  const fileName ="Invoice.pdf"
  fs.unlink(downloadDir + fileName, function (err) {
    if(err) {console.log("Can't find Invoice.pdf")}
    else {console.log("Previous Invoice.pdf deleted")}
    
  })
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
    await driver.findElement(webdriver.By.id('ap_email')).sendKeys(username, webdriver.Key.RETURN);
    await driver.findElement(webdriver.By.id('ap_password')).sendKeys(password, webdriver.Key.RETURN);
    await driver.manage().setTimeouts({ implicit: 10000 });
  }
  catch (error) {
  }
}

const getYearsLinks = async (driver) => {
  await driver.findElement(webdriver.By.id('a-autoid-1-announce')).click()
  const baseUrl = 'https://www.amazon.es/gp/your-account/order-history?opt=ab&digitalOrders=1&unifiedOrders=1&returnTo=&__mk_es_ES=%C3%85M%C3%85%C5%BD%C3%95%C3%91&orderFilter=year-'
  const yearsTabs = await driver.findElements(webdriver.By.xpath("//a[contains(@data-value, 'year')]"))
  let yearsLinks = []
  for (tab of yearsTabs) {
    let year = await tab.getText()
    yearsLinks.push(baseUrl + year)
  }
  return yearsLinks
}


const getPageLinks = async (driver) => {
  const pageLinks = []
  const pagesList = await driver.findElements(webdriver.By.xpath("//a[contains(@href, 'startIndex')]"))
  for (page of pagesList) {
    let link = await page.getAttribute('href')
    pageLinks.push(link)
  }
  pageLinks.pop()//Delete the last (repeated) page link
  console.log(pageLinks)
  return pageLinks
}

const getOrderLinks = async (driver) => {
  let orderLinks = []
  let ordersList = await driver.findElements(webdriver.By.xpath("//a[contains(@href, 'order-details')]"))

  for (order of ordersList) {
    let link = await order.getAttribute('href')
    orderLinks.push(link)
  }
  return orderLinks
}

const getOrderData = async (driver, hasInvoice) => {
  if (hasInvoice) {
    let orderData = []
    let orderID = await driver.findElement(webdriver.By.xpath(`//*[@id="orderDetails"]/div[2]/div[1]/div/span[2]`)).getText()
    const iDStartIndex = 11
    orderID = (orderID.substring(iDStartIndex))
    let orderDate = await driver.findElement(webdriver.By.xpath(`//*[@id="orderDetails"]/div[2]/div[1]/div/span[1]`)).getText()
    const monthIndex = 2
    const orderStartIndex = 12
    orderDate = orderDate
      .substring(orderStartIndex)
      .replace(/de/g, "/")
      .split(" ")

    switch (orderDate[monthIndex]) {
      case "diciembre":
        orderDate[monthIndex] = "12"
        break;
      case "noviembre":
        orderDate[monthIndex] = "11"
        break;
      case "octubre":
        orderDate[monthIndex] = "10"
        break;
      case "septiembre":
        orderDate[monthIndex] = "9"
        break;
      case "agosto":
        orderDate[monthIndex] = "8"
        break;
      case "julio":
        orderDate[monthIndex] = "7"
        break;
      case "junio":
        orderDate[monthIndex] = "6"
        break;
      case "mayo":
        orderDate[monthIndex] = "5"
        break;
      case "abril":
        orderDate[monthIndex] = "4"
        break;
      case "marzo":
        orderDate[monthIndex] = "3"
        break;
      case "febrero":
        orderDate[monthIndex] = "3"
        break;
      case "enero":
        orderDate[monthIndex] = "3"
        break;
    }

    orderDate = orderDate.join("")

    const summaryElements = await driver.findElements(webdriver.By.className('a-text-bold'))
    const amountPosition = 1
    let orderAmount = await summaryElements[amountPosition].getText()
    const amountStartIndex = orderAmount.lastIndexOf(" ") + 1
    orderAmount = orderAmount.substring(amountStartIndex)
    //https://www.amazon.es/gp/your-account/order-details/ref=ppx_yo_dt_b_order_details_o08?ie=UTF8&orderID=406-2321111-6664363

    const productsNames = []
    const productsList = await driver.findElements(webdriver.By.xpath("//a[contains(@href, 'asin_title')]"))
    for (product of productsList) {
      let name = await product.getText()
      productsNames.push(name)
    }

    orderData.push(
      {
        id: orderID,
        amount: orderAmount,
        date: orderDate,
        products: productsNames
      })
    console.log(orderData)
    return orderData
  }
}

const checkIfInvoice = async (driver) => {
  let hasInvoice = false
  try {
    let r = await driver.findElement(webdriver.By.xpath('//*[@id="orderDetails"]/div[2]/div[2]/div/span/a/span')).click()
    await driver.findElement(webdriver.By.linkText("Factura 1"))
    hasInvoice = true
  }
  catch (e) {
  }
  return hasInvoice
}

const checkIfDownloaded = async (downloadDir, orderData) => {
  const filePath = `${downloadDir}${orderData[0].id}.pdf`
  if (fs.existsSync(filePath)) {
    console.log("El archivo existe")
    return true
  }
  return
}

const renamePdf = async (orderData, dir) => {
  console.log(`${dir}Invoice.pdf`, `${dir}${orderData.id}.pdf`)
  fs.rename(`${dir}Invoice.pdf`, `${dir}${orderData[0].id}.pdf`, function (err) {
    if (err) throw err;
    console.log("File renamed")
  })
}


const getPdfFromOrder = async (driver) => {
  try {
    let dropPopover = await driver.findElement(webdriver.By.xpath('//*[@id="orderDetails"]/div[2]/div[2]/div/span/a/span'))
    dropPopover.click()
    let downloadButton = await driver.findElement(webdriver.By.linkText("Factura 1"))
    downloadButton.click()
  }
  catch (e) {
  }

}

scrape()


