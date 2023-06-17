import { QMainWindow } from '@nodegui/nodegui';
import { EventEmitter } from "events"
import { createTransport } from "nodemailer"

import * as loginMenu from "./login"
import * as dataMenu from "./data";

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
      height: "80%";
    }
  `
);
win.show();

(global as any).win = win;

slotRep.on("switchMenu", e => {
  switch (e) {
    case 0:{
      loginMenu.init();
      win.setCentralWidget(loginMenu.centralWidget);
      win.resize(loginMenu.size[0], loginMenu.size[1]);
      win.setMinimumSize(loginMenu.size[0], loginMenu.size[1]);
      break;
    }

    case 1:{
      dataMenu.init();
      win.setCentralWidget(dataMenu.centralWidget);
      win.resize(dataMenu.size[0], loginMenu.size[1]);
      win.setMinimumSize(dataMenu.size[0], dataMenu.size[1]);
      break;
    }

    default:{
      loginMenu.init();
      win.setCentralWidget(loginMenu.centralWidget);
      win.resize(loginMenu.size[0], loginMenu.size[1]);
      win.setMinimumSize(loginMenu.size[0], loginMenu.size[1]);
      break;
    }    
  }
})

slotRep.emit("switchMenu", 0);

export {
  tp,
  newTransport,
  slotRep
};
