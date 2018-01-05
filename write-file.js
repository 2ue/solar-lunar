/**
 * Created by 2ue on 2018/1/5.
 */

const fs = require('fs')
const path = require('path')
// const resolveHtml = require('./resolve-html')
const {endYear} = require('./config');

//写入数据
function writeFile(data,year,cb) {

    const dataPath = path.relative(__dirname, './date-year'), targetPath = path.join(dataPath,`/${year}.json`);

    //dataPath目录是否存在，一个可写入的流
    let dataPathIsExists, writerStream;

    //判断dataPath目录是否存在
    dataPathIsExists = fs.existsSync(dataPath);

    //如果不存在就创建
    if (!dataPathIsExists) {
        fs.mkdir(dataPath, function (err) {
            if (err) {
                console.log(`=====${year} 目录创建失败！${year} =====`);
                return console.error(err);
            }
            console.log(`=====${year} 目录创建成功！${year} =====`);
        });
    };

    //创建一个可写入的流
    writerStream = fs.createWriteStream(targetPath);
    writerStream.write(JSON.stringify(data, null, 4), 'utf-8');
    writerStream.end();//标记结束
    writerStream.on('finish', function () {
        console.log(`=====${year} 数据写入完成！ ${year}=====`);
    }).on('error', function (err) {
        console.log(err.stack);
        console.log(`=====${year} 数据写入失败！ ${year}=====`);
    });
    console.log(endYear)
    // if(year < endYear) setTimeout(function () {
    //     resolveHtml(year+1,function (res,year) {
    //         writeFile(res,year);
    //     });
    // },1500);
    if(year < endYear) setTimeout(function () {
        cb(year+1);
    },1500);
}

// resolveHtml(startYear,function (res,year) {
//     writeFile(res,year);
// })

module.exports = writeFile;