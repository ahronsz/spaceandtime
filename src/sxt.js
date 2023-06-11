
import * as dotenv from 'dotenv'
dotenv.config();
import { exec } from 'child_process';
import { v1 as uuidv1 } from 'uuid';
import SpaceAndTimeSDK from "./SpaceAndTimeSDK.js";
const initSDK = SpaceAndTimeSDK.init();
let dateTime = new Date();

const fields = process.env.FIELDS_S_PROJECTS
const fieldsEnergy = process.env.FIELDS_ENERGY
//const values = `(${2}, ${2}, ${2}, '${dateTime.toISOString().slice(0, -5)}')`
const command = 'java -jar /home/ahronsz/Documents/tools/sxtcli-0.0.2.jar sql-support table-authz --accessType="PUBLIC_READ" --privateKey="D9F662FCCBB81175EE3B16F65631D866632541E1FECE654620E9B677B71D46A6" --resourceId=drex.recs_historical';
//const command = 'java -jar /home/ubuntu/spaceandtime/sxtcli-0.0.2.jar sql-support table-authz --accessType="PUBLIC_READ" --privateKey="23ADAEA1C93FB4B40568079CBB42D2CF86286D96DEA0A737FADA0BDA8AE4D1FE" --resourceId=drex.solar_projects';
let biscuitToken;


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function auth() {
    let [data, error] = await initSDK.Authenticate(process.env.PRIVATEKEY, process.env.PUBLICKEY);
    if (error) {
        console.log(error);
    }
    await sleep(1000);
}

async function dml(table, fields, values) {
    const resourceId = `drex.${table}`
    const sqlText = `INSERT INTO drex.${table} ${fields} VALUES ${values}`
    let [data, error] = await initSDK.DML(resourceId, sqlText);
    if (error) {
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

async function get_recs_historical() {
    await auth();
    return dql("recs", "SELECT ISSUE_REQUEST_ID, ISSUE_REQUESTED, RECS_GENERATED, LISTED, SOLD, CREATION_DATE_TIME  FROM drex.recs_historical ORDER BY creation_date_time");
}

async function get_rec_by_owner_name(ownerName) {
    await auth();
    return dql("recs", `SELECT * FROM drex.recs WHERE owner_name = '${ownerName}'`);
}

async function generateGraphicByDeviceLabelAndTime(deviceLabel, time) {
    await auth();
    return dql("recs", `SELECT DATE_TRUNC(${time}, timestamp) AT TIME ZONE 'UTC' AS utc_date_time, MAX(energy_instant) AS energy FROM energy WHERE device_id = ${deviceLabel} GROUP BY utc_date_time ORDER BY utc_date_time`);
}

async function send_energy_data(body) {
    await auth();
    const energyId = uuidv1();
    const deviceId = 1;
    const energyInstant = body.energyInstantMwh;
    const energyCummulative = body.energyCummulativeMwh;
    const voltageAb = body.voltageAb;
    const voltageBc = body.voltageBc;
    const voltageCa = body.voltageCa;
    const currentA = body.currentA;
    const currentB = body.currentB;
    const currentC = body.currentC;
    const activePower = body.activePower;
    const reactivePower = body.reactivePower;
    const aparentPower = body.aparentPower;
    const powerFactor = body.powerFactor;
    const datetime = body.utcDateTime;
    const values = `('${energyId}', ${deviceId}, ${energyInstant}, ${energyCummulative}, ${voltageAb}, ${voltageBc}, ${voltageCa}, ${currentA}, ${currentB}, ${currentC}, ${activePower}, ${reactivePower}, ${aparentPower}, ${powerFactor}, '${datetime}')`
    return dml("energy", fieldsEnergy, values);
}


export { get_last_recs_historical, get_rec_by_owner_name, get_recs_historical, send_energy_data, generateGraphicByDeviceLabelAndTime }