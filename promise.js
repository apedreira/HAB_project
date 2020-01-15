
const downloadDir = '/home/adri/Escritorio/development/hack_a_bos/Project/invoice_aggregator/tmp/'
const fs = require('fs')

const clearInvoice = async (downloadDir) => {
    const fileName ="Invoice.pdf"
    fs.unlink(downloadDir + fileName, function (err) {
      if(err) {console.log("Can't find Invoice.pdf")}
      else {console.log("Previous Invoice.pdf deleted")}
      
    })
  }

clearInvoice(downloadDir)