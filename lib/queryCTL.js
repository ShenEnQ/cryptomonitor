﻿let https = require('https');

async function queryCTL(config, margincall, alertcallback) {
    if (margincall !== undefined && margincall <= 0) {
        throw new Error("margincall must larger than 0");
    }
    let monitorUrl = `https://api.coinmarketcap.com/v1/ticker/${config.coin}/?convert=${config.curreny}`;
    const query = async () => {
        return new Promise((resolve, reject) => {
            https.get(monitorUrl, (res) => {
                let jsonStr = "";
                res.on("data", (chunk) => {
                    jsonStr += chunk;
                });
                res.on("end", () => {
                    try {
                        var jsonArray = JSON.parse(jsonStr);
                        if (!jsonArray.length) {
                            reject(new Error("invalid json array"));
                        }
                        resolve(jsonArray);
                    } catch (e) {
                        reject(e);
                    }
                });
                res.on("error", (e) => {
                    reject(e);
                });
            });
        });
    }
    var data = await query();
    var coinPrice = parseFloat(data[0]["price_" + config.curreny.toLowerCase()]);
    var rate = config.collateralCoinCount * coinPrice / config.debt;
    if (margincall && rate <= margincall) {
        alertcallback(rate);
    }
    return rate;
}

module.exports = queryCTL;