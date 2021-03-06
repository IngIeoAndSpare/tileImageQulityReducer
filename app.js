// module
var fs = require('fs'),
	readLineSync = require('readline-sync'),
    checkSize = require('get-folder-size'),
    imageCompressor = require('imagemin'),
    imageminMozjpeg = require('imagemin-mozjpeg'),
    imageminPngquant = require('imagemin-pngquant'),
    imageminGuetzli = require('imagemin-guetzli');

// user input value 16x8 size request
var userInputData = []; // 0. input path  1. image format  2. reduce persent  3. plugins

// origin file size, convert file size map
var fileSizeMap = {};

// menu text
const menuText = [
    'input folder name => ',
    'input image format (png, jpg) => ',
    'input image reduce persent <range : (0 ~ 100)> => ',
    'select imagemin plugins (1. MozJpeg   2. Pngquant   3.Guetzli) => '
];

// folder file list
var fileList = [];

// check convert count
var convertCount = 0;

module.exports = {
    initAppHandler : function () {
        // init app handler
        this.getUserInput();
        let folderPath = './' + userInputData[0];
        while(!this.checkDir(folderPath)){
            // folder check fail (not found). repeat request input folder path 
            console.log(userInputData[0]+' folder not found. please check folder name');
            userInputData = [];
            this.getUserInput();
            folderPath = './' + userInputData[0];
        }
        this.getImageFileList(folderPath);
        for(let imageFileName of fileList) {
            //get origin file size
            fileSizeMap[imageFileName] = {};
            this.getFileSize(folderPath, imageFileName, 0);
            //convert and save image file
            this.imageCompressor(imageFileName, folderPath);
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
    imageCompressor : function (imageFileName ,folderPath) {
        //XXX: 추 후에 사용하려면 더 적절한 패키지를 찾을 것 (이유 : 사용 목적에 비해 디펜던시, 노드모듈이 너무 많음.)
        const thisApp = this;
        let setQuality = Number(userInputData[2]),
            convertFolderPath = folderPath + '/'+ userInputData[3] +'convert_' + setQuality,
            selectPlugin = (
                Number(userInputData[3]) == 1 ?
                    imageminMozjpeg({
                        quality : setQuality
                    })
                :
                Number(userInputData[3]) == 2 ?
                    imageminPngquant({
                        quality : setQuality
                    })
                :
                    imageminGuetzli({
                        quality : setQuality
                    })                                
                );
        let startTime = new Date().getTime();
        imageCompressor([folderPath +'/'+ imageFileName], convertFolderPath, {
            plugins: [
                selectPlugin
            ]
        }).then(() => {
            //send convert file path.
            //XXX : result parameter 존재 (path<String>, data<Buffer>)
            console.log(imageFileName + ' image convert end');
            let endTime = new Date().getTime();
            thisApp.getFileSize(convertFolderPath, imageFileName, 1, (endTime - startTime));
        });
    },
    getFileSize : function (folderPath, fileName, flag, processTime) {
        const thisApp = this;
        let fileSize = 0;
        let path = folderPath + '/' + fileName;
        
        checkSize(path, (err, size) => {
            convertCount++;
            if(err) {
                thisApp.errDisplay(err, fileName + ' file size check fail.');
                fileSize = null
            } else {
                fileSize = (size/1024).toFixed(2);
            }
            // add data map 
            if(flag == 0) {
                // originFile size input
                fileSizeMap[fileName].originFileSize = Number(fileSize);
            } else {
                fileSizeMap[fileName].convertSize = Number(fileSize);
                fileSizeMap[fileName].dfValue = Number((fileSizeMap[fileName].originFileSize - Number(fileSize)).toFixed(2));
                fileSizeMap[fileName].processTime = processTime;
            }
            if(convertCount == (fileList.length *2)){
                //XXX : 추 후에 사용한다면 이곳 코드를 다른 곳으로 이동
                thisApp.createTextFile(folderPath);
            }
        });
    },
    checkDir : function (path) {
        if(fs.existsSync(path)) {
            return true;
        } else {
            return false;
        } 
    },
    createTextFile : function (folderPath) {
        // text file creater
        const thisApp = this;
        //imageFileList add
        let jsonContents = this.createResultJson();        
        fs.writeFile(folderPath + '/result.json', jsonContents, 'utf8',(err) => {
            if(err) {
                thisApp.errDisplay(err, +'result json create err. check err.')
            } else {
                console.log('create result json file');
            }
        });
    },
    createResultJson : function () {
        // create json content
        //reducer
        const reducer = (acc, value) => acc + value; 
        const compareMax = (preVal, curVal) => preVal > curVal ? preVal : curVal;
        const compareMin = (preVal, curVal) => preVal > curVal ? curVal : preVal;

        // 0. originSizeList 1. convertSizeList 2. dfferenceSizeList
        let sizeValueArray = [[],[],[],[]];
        
        for(let item of fileList) {
            sizeValueArray[0].push(fileSizeMap[item].originFileSize);
            sizeValueArray[1].push(fileSizeMap[item].convertSize);
            sizeValueArray[2].push(fileSizeMap[item].dfValue);
            sizeValueArray[3].push(fileSizeMap[item].processTime);
        }
        let totalSizeArray = [
            Number((sizeValueArray[0].reduce(reducer)).toFixed(2)),
            Number((sizeValueArray[1].reduce(reducer)).toFixed(2)),
            Number((sizeValueArray[2].reduce(reducer)).toFixed(2)),
            Number((sizeValueArray[3].reduce(reducer)).toFixed(4))
        ]
        fileSizeMap['originResult']= {
            maxSize : sizeValueArray[0].reduce(compareMax),
            minSize : sizeValueArray[0].reduce(compareMin),
            totalSize : Number((totalSizeArray[0] / 1024).toFixed(2)),
            averageSize : Number((totalSizeArray[0] / fileList.length).toFixed(2))
        };
        fileSizeMap['convertResult'] = {
            maxSize : sizeValueArray[1].reduce(compareMax),
            minSize : sizeValueArray[1].reduce(compareMin),
            totalSize : Number((totalSizeArray[1] / 1024).toFixed(2)),
            averageSize : Number((totalSizeArray[1] / fileList.length).toFixed(2))
        };
        fileSizeMap['dfValueResult'] = {
            maxSize : sizeValueArray[2].reduce(compareMax),
            minSize : sizeValueArray[2].reduce(compareMin),
            totalSize : totalSizeArray[2]
        };
        fileSizeMap['processTimeResult'] = {
            maxTime : sizeValueArray[3].reduce(compareMax),
            minTime : sizeValueArray[3].reduce(compareMin),
            totalTime : totalSizeArray[3],
            averageTime : Number((totalSizeArray[3] / fileList.length).toFixed(3))
        };
        fileSizeMap['fileNameList'] = fileList;
        return JSON.stringify(fileSizeMap, null, '\t');
    },
    errDisplay : function (err, text) {
        // err display
        console.log(text);
        console.log(err);
    }
}