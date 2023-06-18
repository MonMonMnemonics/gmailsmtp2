import { QMainWindow } from '@nodegui/nodegui';
import { EventEmitter } from "events"
import { createTransport } from "nodemailer"

import * as loginMenu from "./login"
import * as dataMenu from "./data";
import * as attachmentMenu from "./attachment";

let tp = createTransport({
  host: "smtp.gmail.com",
  port: 587,
  tls: {
      rejectUnauthorized: false
  },
});

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
  `
);
win.show();

(global as any).win = win;

slotRep.on("switchMenu", e => {
  switch (e) {
    case 0:{
      loginMenu.init();
      win.setMinimumSize(loginMenu.size[0], loginMenu.size[1]);
      win.setCentralWidget(loginMenu.centralWidget);
      win.resize(loginMenu.size[0], loginMenu.size[1]);
      break;
    }

    case 1:{
      dataMenu.init();
      win.setMinimumSize(dataMenu.size[0], dataMenu.size[1]);
      win.setCentralWidget(dataMenu.centralWidget);
      win.resize(dataMenu.size[0], dataMenu.size[1]);
      break;
    }

    case 2:{
      attachmentMenu.init();
      win.setMinimumSize(attachmentMenu.size[0], attachmentMenu.size[1]);
      win.setCentralWidget(attachmentMenu.centralWidget);
      win.resize(attachmentMenu.size[0], attachmentMenu.size[1]);
      break;
    }

    default:{
      loginMenu.init();
      win.setMinimumSize(loginMenu.size[0], loginMenu.size[1]);
      win.setCentralWidget(loginMenu.centralWidget);
      win.resize(loginMenu.size[0], loginMenu.size[1]);
      break;
    }    
  }
})

slotRep.emit("switchMenu", 2);

let targetData: any[] = [];
function setTargetData(dt: any[]) {
  targetData = JSON.parse(JSON.stringify(dt));
}

let attachmentList: any[] = [];
function setAttachmentList(dt: any[]) {
  attachmentList = JSON.parse(JSON.stringify(dt));
}

export {
  tp,
  newTransport,
  slotRep,
  setAttachmentList,
  setTargetData
};
