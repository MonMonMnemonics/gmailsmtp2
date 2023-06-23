import { QWidget, QLabel, FlexLayout, QPushButton, AlignmentFlag, QTableWidget, QTableWidgetItem, QTextEdit, QListWidget, QListWidgetItem, WrapMode, ItemFlag } from '@nodegui/nodegui';
import { slotRep, targetData, attachmentList, config, tp } from "./index";
import { appendFile  } from 'fs/promises';

const centralWidget = new QWidget();
centralWidget.setObjectName("mainPanel");
const mainWindow = new FlexLayout();
centralWidget.setLayout(mainWindow);

const topWidget = new QWidget();
topWidget.setInlineStyle(`
  flex-direction: row;
  margin-bottom: 7px;
`)
const topWindow = new FlexLayout();
topWidget.setLayout(topWindow);
mainWindow.addWidget(topWidget);

const button = new QPushButton();
button.setObjectName("button");
button.setText("Back");
button.addEventListener("clicked", () => {slotRep.emit("switchMenu", 3);});
topWindow.addWidget(button);

const label = new QLabel();
label.setObjectName("label");
label.setText("");
label.setStyleSheet(`
  flex-grow: 1;
`);
label.setWordWrap(true);
label.setAlignment(AlignmentFlag.AlignCenter);
topWindow.addWidget(label);

const button2 = new QPushButton();
button2.setObjectName("button");
button2.setText("Mulai pengiriman");
button2.addEventListener("clicked", initSending);
topWindow.addWidget(button2);

const middleWidget = new QWidget();
middleWidget.setInlineStyle(`
  flex-direction: row;
  flex-grow: 1;
  align-self: stretch;
`)
const middleWindow = new FlexLayout();
middleWidget.setLayout(middleWindow);
mainWindow.addWidget(middleWidget);

function initSending() {
  button.setEnabled(false);
  button2.setEnabled(false);

  if (currentRow + 1 >= targetData.length) {
    button.setEnabled(true);
    button2.setEnabled(true);    
  } else {
    reloadLabelsData();
    if (table.item(currentRow, 0).text().trim() == "") {
      table.item(currentRow, 1).setText("ERR : " + "ALAMAT EMAIL KOSONG");
      currentRow++;
      initSending();
    } else if (table.item(currentRow, 1).text() == "TERKIRIM") {
      currentRow++;
      initSending();
    } else {
      table.item(currentRow, 1).setText("MENGIRIM...")
      let attlist: any[] = [];
      if (targetData[currentRow + 1][Number(config["attachmentCol"])].trim() != "") {
        attachmentList.forEach(e => {
          if (e.name.indexOf(targetData[currentRow + 1][Number(config["attachmentCol"])].trim()) == 0) {
            attlist.push(e);
          }
        })
      }
    
      tp.sendMail({
        from: labelTitleR.text().substring(11) + "<" + config["user"] + ">",
        to: table.item(currentRow, 0).text(),
        subject: labelSubjectR.text().substring(10),
        text: resultText.toPlainText(),
        attachments: attlist.map(e => {return {
          path: e.dir,
          filename: e.name
        }})
      }).then(async () => {
        await appendFile("./log.txt", (new Date().toString()) + " " + table.item(currentRow, 0).text() + "\n" + "TERKIRIM" + "\n");
        if (currentRow < targetData.length - 1) {
          table.item(currentRow, 1).setText("TERKIRIM");
          currentRow++;
          initSending();
        } else {
          button.setEnabled(true);
          button2.setEnabled(true);
        }
      }).catch(async (e) => {
        await appendFile("./log.txt", (new Date().toString()) + " " + table.item(currentRow, 0).text() + "\n" + e + "\n");
        if (currentRow < targetData.length - 1) {
          table.item(currentRow, 1).setText("ERR : " + e);
          currentRow++;
          initSending();
        } else {
          button.setEnabled(true);
          button2.setEnabled(true);
        }
      });
    }    
  } 
}

//-------------------------------   LEFT WIDGET   -------------------------------
const leftWidget = new QWidget();
leftWidget.setObjectName("leftWidget");
leftWidget.setInlineStyle(`
  flex-grow: 1;
  align-self: stretch;
  padding: 4px;
  padding-right: 11px;
  border-right: 3px solid white; 
`)
const leftWindow = new FlexLayout();
leftWidget.setLayout(leftWindow);
middleWindow.addWidget(leftWidget);

const table = new QTableWidget(0, 2);
table.setObjectName("table");
leftWindow.addWidget(table);

let currentRow = 0;
function reloadAttachmentList() {
  attachmentListView.clear();
  if (targetData[currentRow + 1][Number(config["attachmentCol"])].trim() != "") {
    attachmentList.forEach(e => {
      if (e.name.indexOf(targetData[currentRow + 1][Number(config["attachmentCol"])].trim()) == 0) {
        let a = new QListWidgetItem();
        a.setText(e.name);
        attachmentListView.addItem(a);      
      }
    })
  }
  labelAttachmentR.setText("Daftar file lampiran : (" + attachmentListView.count() + " file)");
}

function updateAtasNama() {
  let t = config["atasNama"];
  for (let idx = 0; idx < targetData[0].length; idx++) {
    t = t.replaceAll("<{" + targetData[0][idx] + "}>", targetData[currentRow + 1][idx]);
  }
  labelTitleR.setText("Pengirim : " + t);
}

function updateSubject() {
  let t = config["title"];
  for (let idx = 0; idx < targetData[0].length; idx++) {
    t = t.replaceAll("<{" + targetData[0][idx] + "}>", targetData[currentRow + 1][idx]);
  }
  labelSubjectR.setText("Subject : " + t);
}

function updateContent() {
  let t = config["content"];
  for (let idx = 0; idx < targetData[0].length; idx++) {
    t = t.replaceAll("<{" + targetData[0][idx] + "}>", targetData[currentRow + 1][idx]);
  }
  resultText.setText(t);
}

function reloadLabelsData() {
  updateAtasNama();
  updateSubject();
  updateContent();
  reloadAttachmentList();
  labelDataset.setText("Preview Email\n(Data baris " + (currentRow + 1) + ")");
  table.selectRow(currentRow);
}
//-------------------------------   RIGHT WIDGET   -------------------------------
const rightWidget = new QWidget();
rightWidget.setObjectName("rightWidget");
rightWidget.setInlineStyle(`
  flex-grow: 1;
  align-self: stretch;
  padding: 4px;
  padding-left: 11px;
`)
const rightWindow = new FlexLayout();
rightWidget.setLayout(rightWindow);
middleWindow.addWidget(rightWidget);

const labelDataset = new QLabel();
labelDataset.setObjectName("label");
labelDataset.setText("Preview Email");
labelDataset.setAlignment(AlignmentFlag.AlignCenter);
rightWindow.addWidget(labelDataset);

const labelTitleR = new QLabel();
labelTitleR.setObjectName("label");
labelTitleR.setText("Mengirim atas nama :");
rightWindow.addWidget(labelTitleR);

const labelSubjectR = new QLabel();
labelSubjectR.setObjectName("label");
labelSubjectR.setText("Judul email :");
labelSubjectR.setWordWrap(true);
rightWindow.addWidget(labelSubjectR);

const labelContentR = new QLabel();
labelContentR.setText("Preview isi email :");
labelContentR.setObjectName("label");
labelContentR.setWordWrap(true);
rightWindow.addWidget(labelContentR);
const resultText = new QTextEdit();
resultText.setReadOnly(true);
resultText.setWordWrapMode(WrapMode.WordWrap);
resultText.setObjectName("resultText");
rightWindow.addWidget(resultText);

const labelAttachmentR = new QLabel();
labelAttachmentR.setObjectName("label");
labelAttachmentR.setText("Daftar file lampiran :");
rightWindow.addWidget(labelAttachmentR);
const attachmentListView = new QListWidget();
attachmentListView.setObjectName("attachmentList");
rightWindow.addWidget(attachmentListView);

function init() {
  currentRow = 0;
  if (targetData.length > 0) {
    table.setColumnCount(2)
    table.setRowCount(0);

    table.setHorizontalHeaderLabels(["Email", "Status"]);
    const EmailIdx: number = targetData[0].indexOf("Email");
    if (EmailIdx != -1) {
      for (let i = 1; i < targetData.length; i++) {
        table.insertRow(table.rowCount());
        const a = new QTableWidgetItem(targetData[i][EmailIdx]);
        a.setFlags(a.flags() &~ ItemFlag.ItemIsEditable);
        table.setItem(table.rowCount() - 1, 0, a);
        const b = new QTableWidgetItem("");
        b.setFlags(a.flags() &~ ItemFlag.ItemIsEditable);
        table.setItem(table.rowCount() - 1, 1, b);
      }  
    } 
  }
  table.resizeColumnsToContents();
  table.setColumnWidth(1, 150);
  reloadLabelsData();
}

const size = [800, 600];
export {
  centralWidget,
  size,
  init
}