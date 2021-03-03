const axios = require('axios');
const cheerio = require('cheerio')
const sqlite3 = require("sqlite3");
const qs = require('qs');
const moment = require('moment');
const db = new sqlite3.Database('./db/floorsheet.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the chinook database.');
});
const startDate = '10/12/2014';
pullPage.eventvalidation = "/wEdABjO7O7kvB9N5/S6hSZf4s5FE5nMbn28TPzdgjg7eE0jkNbStPbXoNaIQ+hWf8D2Fj0tbr+hMZy/VOHVogmDPsNuekTjy/2/5QGIFd0XVi2KTajarIbnkUxUDpGoXPo9t/2rfX+cVAcVPY4vrJptxKa2ZGkMXGXXjNBaXOJOwjf4IsAzYZO4W+R068HDv6c4EUN87lnTdoI2ZRf9A5JVcv81pGDJ9kwTbZDXywY0EPt/dV9k5U4bMQ2TyeZeM/F8+UT2CtZivv6XBZ33Guyur2aAachUYpJnsHN4L0t7scE9kePSTLn5KOoAQi5M87PZ0bgKbALtyp3rpcC5+5yhZz/RXkoLlYu1ILxQjFrJegKHl23qJNIuKASb//fve6SGU6c+huc4gdCQZR+tDe5Qj0zft/DEChlPa0YFJKzkEKUO7yaJrbBlMKgncTVLubRuVBOELefJUCISHqsKgwxu6ehF8mZwQjeN2l0TAXhs76wqyHTA8MOZB6TJDmvLszkX2hk5WrEdQDEpsCMPBr3069xmwadPlcx7yyUv/89W2oUHNA==";
pullPage.viewState = "/wEPDwUKMTU0NjQzNTE2Ng9kFgJmD2QWAgIBD2QWEGYPDxYCHgdWaXNpYmxlaGRkAgIPFgIfAGhkAgQPFgIfAGhkAgUPFgIfAGdkAg0PZBYEAgEPZBYCAgMPD2QWCB4Gb25ibHVyZR4LcGxhY2Vob2xkZXIFFkNvbXBhbnkgbmFtZSBvciBzeW1ib2weCm9ua2V5cHJlc3MFOEF1dG9TdWdnZXN0LmdldEF1dG9TdWdnZXN0RGF0YUJ5RWxlbWVudCgiQ29tcGFueSIsdGhpcyk7HgdvbmtleXVwBSNBdXRvU3VnZ2VzdC5jbGVhclZhbHVlKGV2ZW50LHRoaXMpO2QCAw8PZBYCHgxkYXRhLXRyaWdnZXIFDmNvbXBhbnktZGV0YWlsZAIPD2QWBgIBD2QWAgIDDw9kFggfAWUfAgUWQ29tcGFueSBuYW1lIG9yIHN5bWJvbB8DBThBdXRvU3VnZ2VzdC5nZXRBdXRvU3VnZ2VzdERhdGFCeUVsZW1lbnQoIkNvbXBhbnkiLHRoaXMpOx8EBSNBdXRvU3VnZ2VzdC5jbGVhclZhbHVlKGV2ZW50LHRoaXMpO2QCAw8WAh4JZGF0YS1uZXdzBQ5jb21wYW55LWRldGFpbGQCBQ8PZBYCHwUFDmNvbXBhbnktZGV0YWlsZAIRDxYCHwBoZAITD2QWBmYPZBYCAgEPZBYCAgMPD2QWCB8BZR8CBQxTdG9jayBTeW1ib2wfAwU4QXV0b1N1Z2dlc3QuZ2V0QXV0b1N1Z2dlc3REYXRhQnlFbGVtZW50KCJDb21wYW55Iix0aGlzKTsfBAUjQXV0b1N1Z2dlc3QuY2xlYXJWYWx1ZShldmVudCx0aGlzKTtkAgEPFgIfAGhkAgIPZBYCAgMPZBYGAgEPFgIeCWlubmVyaHRtbAUHNDUzLDQ3NWQCAw8WAh8HBQ4xNzEsMzI5LDMyMy4yNWQCBQ8WAh8HBQYzNzcuODFkZJpyVb1t3awt6UVD/iidKIV6nk6qff4bicJRKp0p1dnS";
pullPage.viewStateGenerator = '1F15F17F';
pullPage.updateStatus = db.prepare("REPLACE INTO status (rowid, date, page, eventvalidation, viewstate) VALUES (1, ?, ?, ?, ?)");
load.insertFloorsheet = db.prepare("REPLACE INTO floorsheet VALUES (?,?,?,?,?,?,?)");

start();

function start() {
    db.get("SELECT date, page, eventvalidation, viewstate FROM status", (error, row) => {
        if (!row) {
            pullDate(moment(startDate, 'MM/DD/YYYY'));
        } else {
            console.log('Resuming from date:' + row.date);
            pullPage(moment(row.date, 'MM/DD/YYYY'), row.page);
            if (!!row.eventvalidation) {
                pullPage.eventvalidation = row.eventvalidation;
            }
            if (!!row.viewState) {
                pullPage.viewState = row.viewState;
            }
        }
    })
}

function pullDate(date) {
    console.log('Pull from date:' + date.format('MM/DD/YYYY'));
    pullPage(date, 1);
}


function pullPage(date, page) {


    console.log('page: ' + page);
    if (!!!pullPage.eventvalidation || !!!pullPage.viewState) {
        console.log('eventvalidation is null');
    }
    axios.post('https://merolagani.com/Floorsheet.aspx#', qs.stringify({
        '__EVENTTARGET': 'ctl00$ContentPlaceHolder1$lbtnSearchFloorsheet',
        '__EVENTVALIDATION': pullPage.eventvalidation,
        '__VIEWSTATE': pullPage.viewState,
        '__VIEWSTATEGENERATOR': pullPage.viewStateGenerator,
        'ctl00$ContentPlaceHolder1$txtFloorsheetDateFilter': date.format('MM/DD/YYYY'),
        'ctl00$ContentPlaceHolder1$PagerControl1$hdnCurrentPage': page,
        'ctl00$ContentPlaceHolder1$PagerControl2$hdnCurrentPage': page,
        'ctl00$ContentPlaceHolder1$PagerControl1$btnPaging': ''
    })).then(res => {
        if (res.data.indexOf('Could not find floorsheet matching the search criteria') > 0) {
            console.log('Finished for date:' + date.format('MM/DD/YYYY'));
            if (moment().diff(date, 'days') > -1) {
                pullDate(date.add(1, 'days'));
            } else {
                db.close();
            }
            return;
        }
        if (res.data.indexOf('Something went wrong on the server') > 0) {
            throw 'server stuck';
        }
        const $ = cheerio.load(res.data);
        pullPage.eventvalidation = $('input#__EVENTVALIDATION').val();
        pullPage.viewState = $('input#__VIEWSTATE').val();
        load(res, date, page);
        pullPage.updateStatus.run(date.format('MM/DD/YYYY'), page, pullPage.eventvalidation, pullPage.viewState);
    }).catch(async error => {
        await sleep(10000).then(() => {
            console.log('resuming');
            pullPage(date, page)
        });
    });
}

function sleep(ms) {
    console.log('timeout waiting for ' + ms / 1000 + ' seconds');
    return new Promise(resolve => setTimeout(resolve, ms));
}

function load(res, date, page) {
    const $ = cheerio.load(res.data);
    const headers = [];
    const data = [];
    $('table.table.sortable thead tr th span').each((i, elem) => headers[i] = $(elem).text());


    $('table.table.sortable tbody tr').each((i, elem) => {
        const row = {};
        $(elem).find('td').each((j, td) => {
            row[headers[j]] = $(td).text().trim();
            row[j] = $(td).text().trim();
        })
        data.push(row);
    });

    data.forEach(row => {
        load.insertFloorsheet.run(row[1], row[2], row[3], row[4], row[5], row[6], row[7], error => {
            if (error != null) {
                throw 'error: ' + row[1];
            }
        });
    })
    console.log("\u001b[2K\u001b[0E:wrote "+ data.length + " rows.");

    new Promise(t => {
        pullPage(date, page + 1);
    });
}
