import express, { type Express, type Request, type Response } from 'express';
import { MongoClient, ServerApiVersion, type Db, type Collection } from 'mongodb';
import dotenv from 'dotenv';
import { Contrato } from './Contrato';

const app: Express = express();
const PORT = 3000;

dotenv.config();

app.get('/', async (req: Request, res: Response) => {
   const uri: string = process.env.MONGODB_URI ?? "";
   const contratos: Contrato[] = [];

   const client = new MongoClient(uri, {
      serverApi: {
         version: ServerApiVersion.v1,
         strict: true,
         deprecationErrors: true,
      },
   });

   const database: Db = client.db("licitaciones");
   const collection: Collection = database.collection('contratos');

   const projectFields = { _id: 0, identifier: 1, valueAmount: 1 };

   for await (const item of collection.find().project(projectFields).skip(0).limit(50)) {
      const contrato: Contrato = new Contrato(item["identifier"], item["title"], item["valueAmount"]);
      contratos.push(contrato);
   }

   res.send(contratos.sort((a, b) => a.valueAmount - b.valueAmount));
});

app.listen(PORT, () => {
   console.log(`Example app listening on port ${PORT}`);
});