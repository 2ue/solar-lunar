/**
 * Created by 2ue on 2018/1/4.
 * 解析采集到的数据按照格式组装
 */

//lunar农历，阴历
//solar阳历，太阳历
//divisions节气，分支

const request = require('request');
const iconv = require('iconv-lite');
const writeFile = require('./write-file');
let { startYear, lunarYear, lunarMon, nmCN, lunarCN, divisionsTr, otherCN } = require('../utils/config');

//把旧历汉字转换成数字
function lunarTransformCn(text) {
    if (!text) return 0;
    let num = text.length > 1 ? text.split('').reduce((prev, curr) => lunarCN.indexOf(prev) * 10 + nmCN.indexOf(curr) + 1) : (nmCN.indexOf(text) + 1);

    return num > 30 ? 30 : num;
}

//数据采集
//http://data.weather.gov.hk/gts/time/calendar/text/T1901c.txt
function getUrl(year) {
    return `http://data.weather.gov.hk/gts/time/calendar/text/T${year}c.txt`;
};

//解析页面
function getHtml(year) {
    if (!year) return [];
    return new Promise(function (resolve, reject) {
        request({ url: getUrl(year), encoding: null }, function (error, response, body) {
            console.log(`=== 开始抓取 ===>  ${getUrl(year)}`);
            if (!error && response.statusCode === 200) {
                resolve(iconv.decode(body, 'big5').toString());
            } else {
                reject(error);
            }
        });
    })
}

function index(year) {
    getHtml(year).then((data) => {
        let result = {};
        let arr = JSON.parse(JSON.stringify(data.split(/\n/))
            .replace(/\s+/g, ' ')
            .replace(/\r/g, '')
            .replace(/二十/g, lunarCN[ 1 ] + lunarCN[ 1 ])
            .replace(/正/g, nmCN[ 0 ])); //将汉字正月中正转换成一，以便正确计算

        //去除开始和尾部的多余数据
        arr = arr.splice(3, arr.length - 5);
        arr.map((item) => {
            if (item && item.replace(/\s/g, '')) {
                let info = item.split(' '),
                    temp = true,
                    solar = info[ 0 ].split(/[^0-9]/), lunar = info[ 1 ],
                    divisions = divisionsTr.indexOf(info[ 3 ]) + 1;

                //判断是否带月，带月表示当前月第一天
                if (lunar.indexOf('月') > 0) {
                    //解析旧历月份
                    lunarMon = lunarTransformCn(lunar.replace(new RegExp(`[月${otherCN.join('')}]`, 'g'), ''));
                    //月份为一时，说明是下一年，年份加一
                    //防止润一月时，lunarYear重复加
                    if (lunarMon === 1 && temp) {
                        lunarYear = lunarYear + 1;
                        temp = false;
                    }
                    lunar = nmCN[ 0 ];
                }
                solar = solar.splice(0, solar.length - 1).join('-');
                lunar = [ lunarYear, lunarMon, lunarTransformCn(lunar) ].join('-');
                result[ solar ] = { s: solar, l: lunar };
                if (divisions) result[ solar ].d = divisions;
            }
        });
        writeFile(result, year, (nextYear) => {
            index(nextYear)
        });
    });
}

index(startYear);
