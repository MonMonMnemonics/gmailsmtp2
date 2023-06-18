import { QWidget, QLabel, FlexLayout, QPushButton, QListWidget, AlignmentFlag, QListWidgetItem, QFileDialog, FileMode } from '@nodegui/nodegui';
import { slotRep } from "./index";

const centralWidget = new QWidget();
centralWidget.setObjectName("mainPanel");
const mainWindow = new FlexLayout();
centralWidget.setLayout(mainWindow);

let results: any[] = [];

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
label.setAlignment(AlignmentFlag.AlignCenter);
topWindow.addWidget(label);

const button3 = new QPushButton();
button3.setObjectName("button");
button3.setText("Muat Lampiran");
button3.addEventListener("clicked", openFile);
topWindow.addWidget(button3);

const button2 = new QPushButton();
button2.setObjectName("button");
button2.setText("Next");
button2.addEventListener("clicked", () => {
    slotRep.emit("switchMenu", 4);
});
topWindow.addWidget(button2);

const label2 = new QLabel();
label2.setObjectName("label");
label2.setText("Daftar file lampiran");
label2.setStyleSheet(`
  flex-grow: 1;
`);
label2.setAlignment(AlignmentFlag.AlignCenter);
mainWindow.addWidget(label2);

const listWidget = new QListWidget();
listWidget.setObjectName("list");
mainWindow.addWidget(listWidget);

async function openFile() {
  const fileDia = new QFileDialog();
  fileDia.setFileMode(FileMode.ExistingFile);
  fileDia.setNameFilter('Any (*.*)');
  fileDia.exec();

  const files = fileDia.selectedFiles();
  listWidget.clear();
  for(const file of files) {
    let a = new QListWidgetItem();
    a.setText(file);
    listWidget.addItem(a);
  }

  results = files.map(e => {
    return{
        dir: e,
        name: e.split("/").pop()?.trim()
    }
  });
}

function init() {
  label.setText("Klik tombol muat lampiran untuk memulai --->");
}

const size = [800, 600];
export {
  centralWidget,
  size,
  init
}