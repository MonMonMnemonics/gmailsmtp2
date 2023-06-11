import { QMainWindow, QWidget, QLabel, FlexLayout, QBoxLayout, QPushButton, QLineEdit, EchoMode, QTableWidget, QTableWidgetItem, ItemFlag } from '@nodegui/nodegui';

const nm = require("nodemailer");
const fs = require("fs");
const fsp = require("fs/promises");
const csv = require("csv-parser");

const config = require("./config.json");
const tp = nm.createTransport(config.transportConfig);
let results: any[] = [];

const win = new QMainWindow();
win.setWindowTitle("Gmail auto-sender");
win.resize(800, 600);

const centralWidget = new QWidget();
centralWidget.setObjectName("mainPanel");
const mainWindow = new FlexLayout();
centralWidget.setLayout(mainWindow);

const label = new QLabel();
label.setObjectName("label");
label.setText("Alamat Email: ");
mainWindow.addWidget(label);

const addressInput = new QLineEdit();
mainWindow.addWidget(addressInput);

const label2 = new QLabel();
label2.setObjectName("label");
label2.setText("Alamat Email: ");
label2.setText("App Password: ");
mainWindow.addWidget(label2);

const passInput = new QLineEdit();
passInput.setEchoMode(EchoMode.Password);
mainWindow.addWidget(passInput);

const button = new QPushButton();
button.setText("Test");
button.addEventListener("clicked", () => {
  addressInput.setText("");
  passInput.setText("");
})
mainWindow.addWidget(button);

const table = new QTableWidget(3, 3);
table.setObjectName("table");
mainWindow.addWidget(table);

win.setCentralWidget(centralWidget);
win.setStyleSheet(
  `
    #mainPanel {
      background-color: #121212;
      height: '100vh';
      padding: 13px;
    }
    #label {
      color: #FFFFFF;
      font-size: 16px;
      font-weight: bold;
    }
    #table {
      width: "100%";
      height: "80%";
    }
  `
);
win.show();

(global as any).win = win;

fs.createReadStream('target.csv')
.pipe(csv())
.on('data', (data: Object) => results.push({
  ...data,
  "Status": false,
}))
.on('end', () => {
  table.setColumnCount(Object.keys(results[0]).length)
  table.setRowCount(0);

  table.setHorizontalHeaderLabels(Object.keys(results[0]));

  results.forEach((e:any) => {
    table.insertRow(table.rowCount());
    let i = 0;
    for (let key in e) {
      const a = new QTableWidgetItem(e[key]);
      a.setFlags(a.flags() &~ ItemFlag.ItemIsEditable);
      table.setItem(table.rowCount() - 1, i++, a);
    }
  })
  //main();
});

function searchList(target: any, sList: any[]) {
  for (let i = 0; i < sList.length; i++) {
    if (sList[i].indexOf(target) == 0) {
      return i;
    }
  }
  return -1;
}

async function main() {    
  await tp.verify();
  const AttList = await fsp.readdir("./attachment");
  let temp = "";

  try {
    temp = (await fsp.readFile("./template.txt")).toString();
  } catch (err) {
    console.log("GAGAL LOAD TEMPLATE EMAIL");
    console.log(err);
    return;
  }

  for (let j = 0; j < results.length; j++) {
    const idx = searchList(results[j]["First Name"], AttList);
    if (idx == -1) {
      await fsp.appendFile("./log.txt", "ATTACHMENT " + results[j]["First Name"] + " TIDAK DITEMUKAN\n");
      console.log("ATTACHMENT " + results[j]["First Name"] + " TIDAK DITEMUKAN")
      return;
    } else {
      let emailText = JSON.parse(JSON.stringify(temp));
      Object.keys(results[j]).forEach(e => {
        emailText = emailText.replaceAll("<{" + e + "}>", results[j][e]);
      })
      
      try {
        console.log("MENGIRIM " + results[j]["First Name"]);
        await tp.sendMail({
          from: '"' + config.emailConfig.nama + '" <' + config.transportConfig.auth.user + '>',
          to: results[j]["Email Address"],
          subject: config.emailConfig.judul,
          text: emailText,
          attachments: [{
            path: "./attachment/" + AttList[idx]
          }]
        })  
        console.log("TERKIRIM " + results[j]["First Name"]);
        await fsp.appendFile("./log.txt", "TERKIRIM " + results[j]["First Name"] + "\n");
      } catch (err) {
        console.log("ERROR PENGIRIMAN " + results[j]["First Name"]);
        console.log(err); 
        await fsp.appendFile("./log.txt", "ERROR PENGIRIMAN " + results[j]["First Name"] + "\n");
        return;     
      }    
    }      
  }
}
