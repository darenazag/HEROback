import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
const PORT = process.env.APP_PORT;
const app = express();

app.use(express.urlencoded());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("hello world");
})


app.listen(PORT, () => {
    console.log(`Servidor en marcha en puerto ${PORT}`);
})