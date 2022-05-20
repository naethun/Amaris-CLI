import csv from "csv-parser";
import * as fs from "fs";

export class CSVParser {
    constructor() {
        this.results = [];
    }
    read(path) {
        return new Promise((resolve, reject) => {
            fs.createReadStream('./presave/magiceden.csv')
            .pipe(csv())
            .on('data', (data) => {
                this.results.push(data);
            })
            .on('end', () => {
                resolve(this.results);
            });

            fs.createReadStream('./presave/cmv2.csv')
            .pipe(csv())
            .on('data', (data) => {
                this.results.push(data);
            })
            .on('end', () => {
                resolve(this.results);
            });
        });
    }
}