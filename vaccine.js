const notifier = require('node-notifier');
const path = require('path');
const https = require('https')
const open = require('child_process')

function notify_availability() {
  notifier.notify({
    title: 'Vaccine Notification',
    message: 'Vaccine Available',
    icon: path.join(__dirname, 'covidvaccine.png')
  });

  open.exec('open' + ' ' + 'https://selfregistration.cowin.gov.in/appointment')
}

const pin = '382424'
let date = new Date()
const current_date = date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear()
let url = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByPin?pincode=${pin}&date=${current_date}`

function check_availability(){
  https.get(url, (resp) => {
    let data = '';

    resp.on('data', (chunk) => {
      data += chunk
    });
    
    resp.on('end', () => {
      JSON.parse(data)["centers"].forEach( (elem) => {
        let capacity = elem["sessions"][0]["available_capacity"]
        let min_age_limit = elem["sessions"][0]["min_age_limit"]
        if(capacity > 0 && min_age_limit == 18){
          notify_availability()
        }else{
          console.log("Nothing Yet:", capacity, min_age_limit);
          console.log("--------------------------------------");
        }
      })
    })
  });

  setTimeout(check_availability , 60000, 'vaccine_check');
}

check_availability()


