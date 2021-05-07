const notifier = require('node-notifier');
const path = require('path');
const https = require('https')
const open = require('child_process')

let notify_availability = () => {
  notifier.notify({
    title: 'Vaccine Notification',
    message: 'Vaccine Available',
    icon: path.join(__dirname, 'covidvaccine.png')
  });

  open.exec('open' + ' ' + 'https://selfregistration.cowin.gov.in/appointment')
}


let padding = (str,size) => {
  while (str.toString().length < 2){
    str = "0" + str;
  }
  return str;
}

const pin = '382424'
let date = new Date()
let current_date = padding(date.getDate()) + '-' + padding(date.getMonth() + 1) + '-' + padding(date.getFullYear())
let url = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByPin?pincode=${pin}&date=${current_date}`
console.log("Trying URL: " , url)

let check_availability = () => {
  https.get(url, (resp) => {
    let data = '';

    resp.on('data', (chunk) => {
      data += chunk
    });
    
    resp.on('end', () => {
      try {
        let json = JSON.parse(data)
        json["centers"].forEach( (elem) => {
          let capacity = elem["sessions"][0]["available_capacity"]
          let min_age_limit = elem["sessions"][0]["min_age_limit"]
          if(capacity > 0 && min_age_limit == 18){
            notify_availability()
          }else{
            console.log("Nothing Yet: ", capacity, min_age_limit);
            console.log("--------------------------------------");
          }
        })
      }catch(err){
        console.error(err)
      }
    })
  });

  setTimeout(check_availability , 60000, 'vaccine_check');
}

check_availability()


