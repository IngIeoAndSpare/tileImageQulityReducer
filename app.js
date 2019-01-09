// module
var fs = require('fs'),
	readLineSync = require('readline-sync'),
    checkSize = require('get-folder-size');


// user input value 16x8 size request
var userInputData = []; // 0. input path  1. reduce persent 

// menu text
const menuText = [];

// ???
const reducePersent = [
    
];

// folder file list
var fileList = [];

module.exports = {
    initAppHander : function () {
        this.getUserInput();


    },
    getUserInput : function () {
        for(let consoleLine of menuText) {
            userInputData.push(readLineSync.question(consoleLine));
        }
    },
    createTextFile : function (filePath, text, name) {
        let buffer = new buffer(text);
        fs.writeFile(filePath + '/' + name, buffer, (err) => {
            if(err) {
                console.log(name + ' create err. check err.');
                console.log(err);
            } else {
                console.log('create ' + name + ' text file');
            }
        });
    }
}