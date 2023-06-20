import { QMainWindow, QStackedWidget } from '@nodegui/nodegui';
import { EventEmitter } from "events"
import { createTransport } from "nodemailer"

import * as loginMenu from "./login"
import * as dataMenu from "./data";
import * as attachmentMenu from "./attachment";
import * as templateMenu from "./template";

let tp = createTransport({
  host: "smtp.gmail.com",
  port: 587,
  tls: {
      rejectUnauthorized: false
  },
});

let targetData: any[] = [
  ["A1", "A2", "A3", "A4"],
  ["B1", "B2", "B3", "B4"],
  ["C1", "C2", "C3", "C4"],
  ["D1", "D2", "D3", "D4"],
  ["E1", "E2", "E3", "E4"],
];
function setTargetData(dt: any[]) {
  targetData = JSON.parse(JSON.stringify(dt));
}

let attachmentList: any[] = [
  {dir: "", name:"asdf"},
  {dir: "", name:"B2_xzcv"},
  {dir: "", name:"B3_sadf"},
  {dir: "", name:"B2_reqw"},
  {dir: "", name:"asdf"},
  {dir: "", name:"B1_rewt"},
];
function setAttachmentList(dt: any[]) {
  attachmentList = JSON.parse(JSON.stringify(dt));
}

let config: any;
function setConfigObj(key: string, val: string) {
  if (["title", "content", "attachmentCol", "atasNama"].indexOf(key) != -1) {
    config[key] = val;
  }
}

function newTransport(user: string, pass: string) {
  tp = createTransport({
      host: "smtp.gmail.com",
      port: 587,
      tls: {
          rejectUnauthorized: false
      },
      auth: {
          user: user,
          pass: pass
      }
  })
}

const slotRep = new EventEmitter();
const win = new QMainWindow();
win.setWindowTitle("Gmail auto-sender");
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
    #checkBox {
      color: #FFFFFF;
      font-size: 12px;
      font-weight: bold;
    }
    #table {
      width: "100%";
      margin-bottom: 7px;
      flex-grow: 1;
    }
    #table2 {
      height: 100%;
      margin-bottom: 7px;
      flex-grow: 1;
    }
    #list {
      width: "100%";
      margin-bottom: 7px;
      flex-grow: 1;
    }
    #contentEdit {
      flex-grow: 1;
    }
    #resultText {
      background-color: #DCDCDC;
      flex-grow: 1;
    }
    #attachmentList {
      height: 60px;
    }
  `
);

const stackedMenu = new QStackedWidget();
stackedMenu.addWidget(loginMenu.centralWidget);
stackedMenu.addWidget(dataMenu.centralWidget);
stackedMenu.addWidget(attachmentMenu.centralWidget);
stackedMenu.addWidget(templateMenu.centralWidget);
win.setCentralWidget(stackedMenu);

win.show();

(global as any).win = win;

slotRep.on("switchMenu", e => {
  switch (e) {
    case 0:{
      win.setMinimumSize(loginMenu.size[0], loginMenu.size[1]);
      stackedMenu.setCurrentIndex(0);
      win.resize(loginMenu.size[0], loginMenu.size[1]);
      loginMenu.init();
      break;
    }

    case 1:{
      win.setMinimumSize(dataMenu.size[0], dataMenu.size[1]);
      stackedMenu.setCurrentIndex(1);
      win.resize(dataMenu.size[0], dataMenu.size[1]);
      dataMenu.init();
      break;
    }

    case 2:{
      win.setMinimumSize(attachmentMenu.size[0], attachmentMenu.size[1]);
      stackedMenu.setCurrentIndex(2);
      win.resize(attachmentMenu.size[0], attachmentMenu.size[1]);
      attachmentMenu.init();
      break;
    }

    case 3:{
      win.setMinimumSize(templateMenu.size[0], templateMenu.size[1]);
      stackedMenu.setCurrentIndex(3);
      win.resize(templateMenu.size[0], templateMenu.size[1]);
      templateMenu.init();
      break;
    }

    default:{
      win.setMinimumSize(loginMenu.size[0], loginMenu.size[1]);
      stackedMenu.setCurrentIndex(0);
      win.resize(loginMenu.size[0], loginMenu.size[1]);
      loginMenu.init();
      break;
    }    
  }
})

slotRep.emit("switchMenu", 3);

export {
  tp,
  newTransport,
  slotRep,
  setAttachmentList,
  setTargetData,
  setConfigObj,
  targetData,
  attachmentList,
  config
};
