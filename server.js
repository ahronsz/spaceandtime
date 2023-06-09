import express from 'express';
import cors from 'cors';
import { get_last_recs_historical, get_rec_by_owner_name, generateGraphicByDeviceLabelAndTime } from './src/sxt.js';

const app = express();
const port = 5000;

app.use(cors());

app.get('/recs-historical/last', async (req, res) => {
    try {
        const recsHistorical = await get_last_recs_historical();
        res.send(recsHistorical[0]);
        console.info("Data obtained satisfactorily");
    } catch (error) {
        console.error(error);
        res.status(500).send('There was an error getting the logs.');
    }
});

app.get('/recs/:ownerName', async (req, res) => {
    try {
        const recs = await get_rec_by_owner_name(req.params.ownerName);
        res.send(recs[0]);
        console.info("Data obtained satisfactorily");
    } catch (error) {
        console.error(error);
        res.status(500).send('There was an error getting the logs.');
    }
});

app.get('/energy/:deviceLabel/graphic?time=:time', async (req, res) => {
    try {
        const deviceLabel = req.params.deviceLabel;
        const time = req.params.time;
        const recs = await generateGraphicByDeviceLabelAndTime(deviceLabel, time);
        res.send(recs);
        console.info("Data obtained satisfactorily");
    } catch (error) {
        console.error(error);
        res.status(500).send('There was an error getting the logs.');
    }
});

app.listen(port, () => {
    console.log(`Server running on the port ${port}`);
});
