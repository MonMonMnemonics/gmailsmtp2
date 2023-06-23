import { QWidget, QLabel, FlexLayout, QPushButton, AlignmentFlag, QFileDialog, FileMode, QTextEdit, QComboBox, QLineEdit, QListWidget, QListWidgetItem, WrapMode, } from '@nodegui/nodegui';
import { slotRep, targetData, attachmentList, setConfigObj } from "./index";
import { readFile } from "fs/promises";

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
button.addEventListener("clicked", () => {slotRep.emit("switchMenu", 2);});
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

const button3 = new QPushButton();
button3.setObjectName("button");
button3.setText("Muat Template");
button3.addEventListener("clicked", openFile);
topWindow.addWidget(button3);

const button2 = new QPushButton();
button2.setObjectName("button");
button2.setText("Next");
button2.addEventListener("clicked", () => {
  setConfigObj("atasNama", inptAtasNama.text());
  setConfigObj("title", inptSubject.text());
  setConfigObj("content", contentText.toPlainText());
  setConfigObj("attachmentCol", comboAttachment.currentIndex().toString());
  slotRep.emit("switchMenu", 4);
});
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

const labelTitle = new QLabel();
labelTitle.setText("Pengirim :");
labelTitle.setObjectName("label");
labelTitle.setWordWrap(true);
leftWindow.addWidget(labelTitle);
const inptAtasNama = new QLineEdit();
inptAtasNama.setText("Placeholder atas nama");
inptAtasNama.addEventListener("textChanged", updateAtasNama);
leftWindow.addWidget(inptAtasNama);

const labelSubject = new QLabel();
labelSubject.setObjectName("label");
labelSubject.setText("Judul email :");
labelSubject.setWordWrap(true);
leftWindow.addWidget(labelSubject);
const inptSubject = new QLineEdit();
inptSubject.setText("Placeholder judul email ke <{Email}>");
inptSubject.addEventListener("textChanged", updateSubject);
leftWindow.addWidget(inptSubject);

const labelContent = new QLabel();
labelContent.setText("Isi email :");
labelContent.setObjectName("label");
labelContent.setWordWrap(true);
leftWindow.addWidget(labelContent);
const labelHint = new QLabel();
labelHint.setObjectName("label");
labelHint.setText("Gunakan notasi <{(nama kolom)}> untuk substitusi data dari kolom tersebut.");
labelHint.setWordWrap(true);
leftWindow.addWidget(labelHint);
const contentText = new QTextEdit();
contentText.setObjectName("contentEdit");
contentText.setWordWrapMode(WrapMode.WordWrap);
contentText.setText(`
  Contoh isi email ke <{Email}>
`)
contentText.addEventListener("textChanged", updateContent);
leftWindow.addWidget(contentText)

const labelAttachment = new QLabel();
labelAttachment.setObjectName("label");
labelAttachment.setText("Nama file lampiran berdasarkan kolom :");
labelAttachment.setWordWrap(true);
leftWindow.addWidget(labelAttachment);
const comboAttachment = new QComboBox();
comboAttachment.addEventListener('currentIndexChanged', (idx) => {
  reloadAttachmentList();
});
leftWindow.addWidget(comboAttachment);

let currentRow = 0;
function reloadAttachmentList() {
  attachmentListView.clear();
  if (targetData[currentRow + 1][comboAttachment.currentIndex()].trim() != "") {
    attachmentList.forEach(e => {
      if (e.name.indexOf(targetData[currentRow + 1][comboAttachment.currentIndex()].trim()) == 0) {
        let a = new QListWidgetItem();
        a.setText(e.name);
        attachmentListView.addItem(a);      
      }
    })
  }
  labelAttachmentR.setText("Daftar file lampiran : (" + attachmentListView.count() + " file)");
}

function updateAtasNama() {
  let t = inptAtasNama.text();
  for (let idx = 0; idx < targetData[0].length; idx++) {
    t = t.replaceAll("<{" + targetData[0][idx] + "}>", targetData[currentRow + 1][idx]);
  }
  labelTitleR.setText("Pengirim : " + t);
}

function updateSubject() {
  let t = inptSubject.text();
  for (let idx = 0; idx < targetData[0].length; idx++) {
    t = t.replaceAll("<{" + targetData[0][idx] + "}>", targetData[currentRow + 1][idx]);
  }
  labelSubjectR.setText("Subject : " + t);
}

function updateContent() {
  let t = contentText.toPlainText();
  for (let idx = 0; idx < targetData[0].length; idx++) {
    t = t.replaceAll("<{" + targetData[0][idx] + "}>", targetData[currentRow + 1][idx]);
  }
  resultText.setText(t);
}

function reloadLabelsData() {
  updateAtasNama();
  updateSubject();
  updateContent();
  labelDataset.setText("Preview Email\n(Data baris " + (currentRow + 1) + ")");
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

const topRightWidget = new QWidget();
topRightWidget.setInlineStyle(`
  flex-direction: row;
  margin-bottom: 7px;
`)
const topRightWindow = new FlexLayout();
topRightWidget.setLayout(topRightWindow);
rightWindow.addWidget(topRightWidget);

const buttonRPrev = new QPushButton();
buttonRPrev.setObjectName("button");
buttonRPrev.setText("Prev\nDatum");
buttonRPrev.addEventListener("clicked", () => {
  if (currentRow > 0) {
    currentRow -= 1;
    reloadAttachmentList();
    reloadLabelsData();
  }
});
topRightWindow.addWidget(buttonRPrev);

const labelDataset = new QLabel();
labelDataset.setObjectName("label");
labelDataset.setText("Preview Email");
labelDataset.setStyleSheet(`
  flex-grow: 1;
`);
labelDataset.setAlignment(AlignmentFlag.AlignCenter);
topRightWindow.addWidget(labelDataset);

const buttonRNext = new QPushButton();
buttonRNext.setObjectName("button");
buttonRNext.setText("Next\nDatum");
buttonRNext.addEventListener("clicked", () => {
  if (currentRow < targetData.length - 2) {
    currentRow += 1;
    reloadAttachmentList();
    reloadLabelsData();
  }
});
topRightWindow.addWidget(buttonRNext);

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
labelAttachmentR.setWordWrap(true);
rightWindow.addWidget(labelAttachmentR);
const attachmentListView = new QListWidget();
attachmentListView.setObjectName("attachmentList");
rightWindow.addWidget(attachmentListView);

async function openFile() {
  const fileDia = new QFileDialog();
  fileDia.setFileMode(FileMode.ExistingFile);
  fileDia.setNameFilter('Any (*.txt)');
  fileDia.exec();

  const file = fileDia.selectedFiles();

  readFile(file[0]).then(e => {
    contentText.setText(e.toString("utf8"));
  })
}

function init() {
  label.setText("Klik tombol muat template untuk memmuat file template --->");
  if (targetData.length > 0) {
    targetData[0].forEach((e: any) => {
     comboAttachment.addItem(undefined, String(e));
    })
  }
  currentRow = 0;
  comboAttachment.setCurrentIndex(0);
  reloadLabelsData();
}

const size = [800, 600];
export {
  centralWidget,
  size,
  init
}