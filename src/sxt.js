
import * as dotenv from 'dotenv'
dotenv.config();
import { exec } from 'child_process';
import SpaceAndTimeSDK from "./SpaceAndTimeSDK.js";
const initSDK = SpaceAndTimeSDK.init();
let dateTime = new Date();

const fields = process.env.FIELDS_S_PROJECTS
const values = `(${2}, ${2}, ${2}, '${dateTime.toISOString().slice(0, -5)}')`
//const command = 'java -jar /home/ahronsz/Documents/tools/sxtcli-0.0.2.jar sql-support table-authz --accessType="PUBLIC_READ" --privateKey="23ADAEA1C93FB4B40568079CBB42D2CF86286D96DEA0A737FADA0BDA8AE4D1FE" --resourceId=drex.solar_projects';
const command = 'java -jar /home/ubuntu/spaceandtime/sxtcli-0.0.2.jar sql-support table-authz --accessType="PUBLIC_READ" --privateKey="23ADAEA1C93FB4B40568079CBB42D2CF86286D96DEA0A737FADA0BDA8AE4D1FE" --resourceId=drex.solar_projects';
let biscuitToken;


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function auth() {
    console.log("process.env.PRIVATEKEY: " + process.env.PRIVATEKEY)
    console.log("process.env.PUBLICKEY: " + process.env.PUBLICKEY)
    let [data, error] = await initSDK.Authenticate(process.env.PRIVATEKEY, process.env.PUBLICKEY);
    if (error) {
        console.log(error);
    }
    await sleep(1000);
}

async function dml(biscuit) {
    const table = "solar_projects"
    const resourceId = `drex.${table}`
    const sqlText = `INSERT INTO drex.${table} ${fields} VALUES ${values}`
    let [data, error] = await initSDK.DML(resourceId, sqlText, biscuit);
    if (!error) {
        console.log(data);
    } else {
        console.log(error);
    }
}

async function dql(table, sqlText) {
    const resourceId = `drex.${table}`
    let [data, error] = await initSDK.DQL(resourceId, sqlText, biscuitToken);
    if (!error) {
        return data;
    } else {
        console.log(error);
    }
}


exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error ejecutando el comando: ${error.message}`);
        return;
    }
    if (stderr) {
        console.error(`Error del comando: ${stderr}`);
        return;
    }
    biscuitToken = stdout.split('\n')[0].replace('Biscuit: ', '')
})

async function get_last_recs_historical() {
    await auth();
    return dql("recs", "SELECT * FROM drex.recs_historical ORDER BY creation_date_time DESC LIMIT 1");
}

async function get_rec_by_owner_name(ownerName) {
    await auth();
    return dql("recs", `SELECT * FROM drex.recs WHERE owner_name = '${ownerName}'`);
}

export { get_last_recs_historical, get_rec_by_owner_name }