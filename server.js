import express from 'express';
import { get_last_recs_historical, get_rec_by_owner_name } from './src/sxt.js';

const app = express();
const port = 3000;

// Página de inicio
app.get('/recs-historical/last', async (req, res) => {
    try {
        const recsHistorical = await get_last_recs_historical();
        console.log(recsHistorical[0]);
        res.send(recsHistorical[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Hubo un error al obtener los registros.');
    }
});

// Ruta /saludo
app.get('/recs/:ownerName', async (req, res) => {
    try {
        const recs = await get_rec_by_owner_name(req.params.ownerName);
        console.log(recs[0]);
        res.send(recs[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Hubo un error al obtener los registros.');
    }
});

app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
