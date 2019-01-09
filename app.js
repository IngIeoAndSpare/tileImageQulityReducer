// module
var fs = require('fs'),
	readLineSync = require('readline-sync'),
    checkSize = require('get-folder-size'),
    imageCompressor = require('compressorjs');

// user input value 16x8 size request
var userInputData = []; // 0. input path  1. image format  2. reduce persent 

// menu text
const menuText = [
    'input folder name => ',
    'input image format => ',
    'input image reduce persent <range : (0 ~ 1) ex) 0.8> => '
];

// ???
const reducePersent = [
    
];

// folder file list
var fileList = [];

module.exports = {
    initAppHandler : function () {
        // init app handler
        this.getUserInput();
        let folderPath = './' + userInputData[0];
        while(!this.checkDir(folderPath)){
            console.log(userInputData[0]+' folder not found. please check folder name');
            userInputData = [];
            this.getUserInput();
            folderPath = './' + userInputData[0];
        }
        this.getImageFileList(folderPath);
    },
    getUserInput : function () {
        // get user input text
        for(let consoleLine of menuText) {
            userInputData.push(readLineSync.question(consoleLine));
        }
    },
    getImageFileList : function (folderPath) {
        // image file list
        let readFileList = fs.readdirSync(folderPath);
        for(let file of readFileList) {
            // get file format
            let check = (file.split('.')[1] == userInputData[1] ? true : false);
            // image format check 
            if(check) {
                fileList.push(file);
            }
        }
    },
    imageCompressor : function (fileName, path, data) {
        
    },
    checkDir : function (path) {
        if(fs.existsSync(path)) {
            return true;
        } else {
            return false;
        } 
    },
    createTextFile : function (filePath, text, name) {
        // text file creater
        const thisApp = this;
        let buffer = new buffer(text);
        fs.writeFile(filePath + '/' + name, buffer, (err) => {
            if(err) {
                thisApp.errDisplay(err, name + ' create err. check err.')
            } else {
                console.log('create ' + name + ' text file');
            }
        });
    },
    errDisplay : function (err, text) {
        console.log(text);
        console.log(err);
    }
}