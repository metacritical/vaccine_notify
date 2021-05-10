const notifier = require('node-notifier');
const path = require('path');
const https = require('https')
const open = require('child_process')
const readline = require("readline-sync");

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

let age, url;


let bootStart = () => {
  process.stdout.write("Enter PIN : ")
  let pin = Number(readline.question())
  process.stdout.write("Enter Minimum Age limit 18/45 : ") 
  age = Number(readline.question())
  let date = new Date()
  let current_date = padding(date.getDate()) + '-' + padding(date.getMonth() + 1) + '-' + padding(date.getFullYear())
  url = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByPin?pincode=${pin}&date=${current_date}`
  console.log("\nRequest URL: " , url, "\n")

  check_availability(url, age)
}

let check_availability = () => {
  https.get(url, (resp) => {
    let data = '';

    resp.on('data', (chunk) => {
      data += chunk
    });
    
    resp.on('end', () => {
      try {
        let json = JSON.parse(data)
        let longest = 0
        json["centers"].forEach( (elem) => {
          let capacity = elem["sessions"][0]["available_capacity"]
          let min_age_limit = elem["sessions"][0]["min_age_limit"]
          let name = elem["name"]
          if(capacity > 0 && min_age_limit == age){
            notify_availability()
          }else{
            let msg = "Availability, Age: "+  capacity + ", " + min_age_limit +  " | Hospital : " + name
            if(msg.length > longest)
              longest = msg.length
            console.log(msg)
          }

          console.log(Array(longest+2).join('-'))
        })
        console.log("\n")
      }catch(err){
        console.error(err)
      }
    })
  });

  setTimeout(check_availability , 60000, "");
}

bootStart()
