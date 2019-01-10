// module
var fs = require('fs'),
	readLineSync = require('readline-sync'),
    checkSize = require('get-folder-size'),
    imageCompressor = require('imagemin'),
    imageminMozjpeg = require('imagemin-mozjpeg'),
    imageminPngquant = require('imagemin-pngquant');

// user input value 16x8 size request
var userInputData = []; // 0. input path  1. image format  2. reduce persent 

// menu text
const menuText = [
    'input folder name => ',
    'input image format (png, jpg)=> ',
    'input image reduce persent <range : (0 ~ 100)> '
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
        for(let imageFileName of fileList) {
            let fileFullPath = folderPath +'/'+imageFileName;
            this.imageCompressor(fileFullPath, folderPath);
            // this.getImageData(imageFileName, folderPath);
        }
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
    // getImageData : function (fileName, path) {
    //     //not use now...
    //     const thisApp = this;
    //     fs.readFile(path + '/' + fileName, (err, data) => {
    //         if(err) {
    //             thisApp.errDisplay(err, 'get Image fail. please check file');
    //         } else {
    //             let convertData = new Buffer(data);
    //             thisApp.imageCompressor(convertData, fileName, path).then(response)
    //         }
    //     });
    // },
    imageCompressor : function (imagePath ,folderPath) {
        //XXX: 추 후에 사용하려면 더 적절한 패키지를 찾을 것 (이유 : 사용 목적에 비해 디펜던시, 노드모듈이 너무 많음.)
        let setQuality = Number(userInputData[2]);

        imageCompressor([imagePath], folderPath + '/convert', {
            plugins: [
                imageminMozjpeg({
                    quality : setQuality
                }),
                imageminPngquant({quality: [(setQuality-10)/100, setQuality/100 ]})
            ]
        }).then(result => {
            //TODO : 후속처리 및 파일 크기 비교

        });
    },
    getFileSize : function (path) {
        //TODO : get file size
        
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