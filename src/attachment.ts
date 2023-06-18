import { QWidget, QLabel, FlexLayout, QPushButton, QTableWidget, AlignmentFlag, QTableWidgetItem, ItemFlag, QFileDialog, FileMode } from '@nodegui/nodegui';
import { slotRep } from "./index";
import { writeFile } from "fs/promises";
import { createReadStream, existsSync } from "fs";

import * as xlsx from "xlsx";
import * as fs from "fs";
xlsx.set_fs(fs);

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
button.addEventListener("clicked", () => {slotRep.emit("switchMenu", 0);});
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
button3.setText("Muat Data");
button3.addEventListener("clicked", openFile);
topWindow.addWidget(button3);

const button2 = new QPushButton();
button2.setObjectName("button");
button2.setText("Next");
button2.addEventListener("clicked", () => {slotRep.emit("switchMenu", 2);});
topWindow.addWidget(button2);

const table = new QTableWidget(3, 3);
table.setObjectName("table");
mainWindow.addWidget(table);

let opened: boolean = false;
async function openFile() {
  if (!opened) {
    opened = true;
    const fileDia = new QFileDialog();
    fileDia.setFileMode(FileMode.ExistingFiles);
    fileDia.setNameFilter('Spreadsheets (*.csv; *.xls; *.xlsx)');
    fileDia.exec();

    const files = fileDia.selectedFiles();
    
    button2.setEnabled(false);    
    label.setText("Memuat data");
    let columnList: string[] = [];
    let dataBulk: any[] = [];
    for (const file of files) {
      const sheetList = xlsx.readFile(file).Sheets;
    
      for (const sheet of Object.values(sheetList)) {
        let columnMapper: any = {};
        let rcount: number = -1;
        let dataBuffer: any[] = [];
    
        for (const [cell, value] of Object.entries(sheet)) {
          if (value.v) {
            const cellAddr = xlsx.utils.decode_cell(cell);
            if (cellAddr.r == 0) {
              if (columnList.indexOf(value.v) == -1) {
                columnList.push(value.v);
              } 
              columnMapper[cellAddr.c] = columnList.indexOf(value.v);
            } else {
              if (cellAddr.r != rcount) {
                if (rcount != -1) {
                  dataBulk.push(JSON.parse(JSON.stringify(dataBuffer)));
                }
                dataBuffer = [];
                while (dataBuffer.length < columnList.length) {
                  dataBuffer.push("");
                }
                rcount = cellAddr.r;
              } 
    
              dataBuffer[columnMapper[cellAddr.c]] = String(value.v);
            }
          }
        }
    
        if (rcount != -1) {
          dataBulk.push(JSON.parse(JSON.stringify(dataBuffer)));
        }
      }
    }

    if (columnList.indexOf("Status Kirim") == -1) {
      columnList.push("Status Kirim");
    }

    dataBulk.map(e => {
      while (e.length < columnList.length) {
        e.push("");
      }
      return e;
    });
    
    if (dataBulk.length != 0) {
      results = [];
      results.push(columnList);
      results = results.concat(dataBulk);
    
      if (results.length > 0) {
        table.setColumnCount(results[0].length)
        table.setRowCount(0);
    
        table.setHorizontalHeaderLabels(results[0]);
        for (let i = 1; i < results.length; i++) {
          table.insertRow(table.rowCount());
          for (let j = 0; j < results[i].length; j++) {
            const a = new QTableWidgetItem(results[i][j]);
            a.setFlags(a.flags() &~ ItemFlag.ItemIsEditable);
            table.setItem(table.rowCount() - 1, j, a);
          }
        }
    
        if (results[0].indexOf("Email") == -1) {
          label.setText("Kolom \"Email\" tidak ditemukan");
        } else {
          label.setText("");
          button2.setEnabled(true);
        }        
      } else {
        table.setColumnCount(3)
        table.setRowCount(0);
        table.setHorizontalHeaderLabels(["Name", "Email", "Status"]);
        writeFile("target.csv", ["Name", "Email", "Status"].join(','));
        label.setText("");
        button2.setEnabled(true);
      }
    } else {
      if (results.length > 0) {
        if (results[0].indexOf("Email") == -1) {
          label.setText("Kolom \"Email\" tidak ditemukan");
        } else {
          label.setText("");
          button2.setEnabled(true);
        }        
      } 
    }

    opened = false;
  }
}

function init() {
  results = [];
  table.setColumnCount(0)
  table.setRowCount(0);  
  button2.setEnabled(false);
  label.setText("Klik tombol muat data untuk memulai --->");
}

const size = [800, 600];
export {
  centralWidget,
  size,
  init
}