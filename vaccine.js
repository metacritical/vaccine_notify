const notifier = require('node-notifier');
const path = require('path');
const https = require('https')
const open = require('child_process')
const readline = require("readline-sync");
const colors = require('colors');

let notify_availability = () => {
  notifier.notify({
    title: 'Vaccine Notification',
    message: 'Vaccine Available',
    icon: path.join(__dirname, 'covidvaccine.png')
  });

  let cmd = (process.platform == 'darwin'? 'open': process.platform == 'win32'? 'start': 'xdg-open');
  open.exec(cmd + ' ' + 'https://selfregistration.cowin.gov.in/appointment')

  process.exit(1);
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
  url = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByPin?pincode=${pin}&date=${current_date}`
  console.log("\nRequest URL: " , url, "\n")

  check_availability()
}

let print_availability = (capacity, min_age_limit, name) => {
  let longest = 0
  let msg = "Availability, Age: "+  capacity + ", " + min_age_limit +  " | Hospital : " + name
  if(capacity > 0 && min_age_limit == age){
    notify_availability()
    console.log(msg.green)
  }else{ console.log(msg.red) }
    
  if(msg.length > longest)
    longest = msg.length
  
  console.log(Array(longest+2).join('-'))
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
          console.log(json)
        json["sessions"].forEach( (elem) => {
          let capacity = elem["available_capacity"]
          let min_age_limit = elem["min_age_limit"]
          let name = elem["name"]
          print_availability(capacity, min_age_limit, name)
        })
        console.log("\n")
      }catch(err){
        console.warn("Parse Error => ".yellow, err)
      }
    })
  });

  setTimeout(check_availability, 20000, "");
}

bootStart()
