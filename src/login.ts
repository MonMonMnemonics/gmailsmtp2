import { QWidget, QLabel, FlexLayout, QPushButton, QLineEdit, EchoMode, TextInteractionFlag, AlignmentFlag, QCheckBox, CheckState } from '@nodegui/nodegui';
import { tp, newTransport, slotRep } from "./index";
import { readFile, writeFile } from "fs/promises"
import * as crypto from "crypto"

const cryptoKey = crypto.createHash("sha512").update("12345").digest("hex").substring(0, 32);
const cryptoIV = crypto.createHash("sha512").update("zxcvd").digest("hex").substring(0, 16);

const centralWidget = new QWidget();
centralWidget.setObjectName("mainPanel");
const mainWindow = new FlexLayout();
centralWidget.setLayout(mainWindow);

const label = new QLabel();
label.setObjectName("label");
label.setText("Alamat Email: ");
label.setStyleSheet(`
  margin-bottom: 3px;
`);
mainWindow.addWidget(label);

const addressInput = new QLineEdit();
addressInput.setObjectName("lineInput");
addressInput.setStyleSheet(`
  margin-bottom: 3px;
`);
mainWindow.addWidget(addressInput);

const label2 = new QLabel();
label2.setObjectName("label");
label2.setText("App Password: ");
label2.setStyleSheet(`
  margin-bottom: 3px;
`);
mainWindow.addWidget(label2);

const passInput = new QLineEdit();
passInput.setObjectName("lineInput");
passInput.setEchoMode(EchoMode.Password);
passInput.setStyleSheet(`
  margin-bottom: 1px;
`);
mainWindow.addWidget(passInput);

const label3 = new QLabel();
label3.setObjectName("label");
label3.setText(`
  Generate password di (select app -> Other, beri nama terserah)<br>
  <a href=\"https://myaccount.google.com/apppasswords\">https://myaccount.google.com/apppasswords</a>
`);
label3.setOpenExternalLinks(true);
label3.setStyleSheet(`
  margin-bottom: 5px;
  font-size: 12px;
`);
mainWindow.addWidget(label3);

const button = new QPushButton();
button.setObjectName("button");
button.setText("Login");
button.setStyleSheet(`
  height: 32px;
  margin-bottom: 3px;
`)
button.addEventListener("clicked", loginClick);
mainWindow.addWidget(button);

const checkBox = new QCheckBox();
checkBox.setObjectName("checkBox");
checkBox.setText("Simpan data login");
checkBox.setCheckState(CheckState.Unchecked);
checkBox.setStyleSheet(`
  margin-bottom: 3px;
`)
mainWindow.addWidget(checkBox);

const label4 = new QLabel();
label4.setObjectName("label");
label4.setText(`
  ---*---*---*---
`);
label4.setTextInteractionFlags(TextInteractionFlag.TextBrowserInteraction);
label4.setWordWrap(true);
label4.setOpenExternalLinks(true);
label4.setAlignment(AlignmentFlag.AlignCenter);
mainWindow.addWidget(label4);

function loginClick() {
  if ((addressInput.text() == "") || (passInput.text() == "")) {
    return;
  }

  label4.setText("Logging in...");
  tp.close()
  newTransport(addressInput.text(), passInput.text());
  tp.verify().then(e => {
    if (checkBox.checkState() == CheckState.Checked) {
      const encryptor = crypto.createCipheriv("aes-256-gcm", cryptoKey, cryptoIV);
      const a = Buffer.from(encryptor.update(JSON.stringify({
        add: addressInput.text(),
        pass: passInput.text()
      }), "utf8", "hex") + encryptor.final("hex")).toString('utf8');
      writeFile("configTransport", a, "utf8").then(e => {
        slotRep.emit("switchMenu", 1);
        label4.setText("");
        addressInput.setText("");
        passInput.setText("");
      }).catch(e => {});
    } else {
      slotRep.emit("switchMenu", 1);
      label4.setText("");
      addressInput.setText("");
      passInput.setText("");
    }
  }).catch(e => {
    switch (e.responseCode) {
      case 535:{
        label4.setText("Alamat email dan password tidak cocok.");
        break;
      }        

      case 534:{
        label4.setText(`
          Butuh app password<br>
          Generate password di (select app -> Other, beri nama terserah)<br>
          <a href=\"https://myaccount.google.com/apppasswords\">https://myaccount.google.com/apppasswords</a>          
        `);
        break;
      }

      default: {
        label4.setText(e);
        break;
      }
    }
    addressInput.setText("");
    passInput.setText("");
  });
}

function init() {
  checkBox.setCheckState(CheckState.Unchecked);
  readFile("configTransport").then(e => {
    const decryptor = crypto.createDecipheriv("aes-256-gcm", cryptoKey, cryptoIV);
    const a = JSON.parse(decryptor.update(e.toString("utf8"), "hex", "utf8"));
    if (a) {
      if (a["add"] && a["pass"]) {
        addressInput.setText(a["add"]);
        passInput.setText(a["pass"]);
        label4.setText("---*---*---*---");
        return;
      } 
    }

    passInput.setText("");
    addressInput.setText("");
    label4.setText("---*---*---*---")
  }).catch(e => {
    passInput.setText("");
    addressInput.setText("");
    label4.setText("---*---*---*---")
  })
}

const size = [400, 350];
export {
  centralWidget,
  size,
  init
}