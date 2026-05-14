import Database from "better-sqlite3";

const options = {
    readonly:false,
    fileMustExist: false,
    timeOut: 5000,
    verbose: null,
}

const db = new Database("sqlite.db", options);

export { db };