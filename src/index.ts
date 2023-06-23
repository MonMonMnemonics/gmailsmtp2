import { QMainWindow, QStackedWidget } from '@nodegui/nodegui';
import { EventEmitter } from "events"
import { createTransport } from "nodemailer"

import * as loginMenu from "./login"
import * as dataMenu from "./data";
import * as attachmentMenu from "./attachment";
import * as templateMenu from "./template";
import * as sendingMenu from "./sending";

let tp = createTransport({
  host: "smtp.gmail.com",
  port: 587,
  tls: {
      rejectUnauthorized: false
  },
});

let targetData: any[] = [];
function setTargetData(dt: any[]) {
  targetData = JSON.parse(JSON.stringify(dt));
}

let attachmentList: any[] = [];
function setAttachmentList(dt: any[]) {
  attachmentList = JSON.parse(JSON.stringify(dt));
}

let config: any = {};
function setConfigObj(key: string, val: string) {
  if (["title", "content", "attachmentCol", "atasNama", "user"].indexOf(key) != -1) {
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
    #leftWidget {
      width: 100%;
    }
    #rightWidget {
      width: 100%;
    }
  `
);

const stackedMenu = new QStackedWidget();
stackedMenu.addWidget(loginMenu.centralWidget);
stackedMenu.addWidget(dataMenu.centralWidget);
stackedMenu.addWidget(attachmentMenu.centralWidget);
stackedMenu.addWidget(templateMenu.centralWidget);
stackedMenu.addWidget(sendingMenu.centralWidget);
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

    case 4:{
      win.setMinimumSize(sendingMenu.size[0], sendingMenu.size[1]);
      stackedMenu.setCurrentIndex(4);
      win.resize(sendingMenu.size[0], sendingMenu.size[1]);
      sendingMenu.init();
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

slotRep.emit("switchMenu", 0);

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
