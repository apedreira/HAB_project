/*
const getPageLinks = async (driver, year) => {
  const pagination = await driver.findElements(webdriver.By.className('a-normal'))
  const itemsPerPage = 10
  const lastIndex = pagination.length * itemsPerPage
  let pageLinks = []
  for (let index = 0; index <= lastIndex; index += itemsPerPage) {
      pageLinks.push(year+"&search=&startIndex="+index)
  }

  return pageLinks
}*/