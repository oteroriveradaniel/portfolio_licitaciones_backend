import express, { type Express, type Request, type Response } from 'express';
import { MongoClient, ServerApiVersion, type Db, type Collection } from 'mongodb';
import dotenv from 'dotenv';

const app: Express = express();
const port = 3000;
dotenv.config();

class Contrato {
  id: String;
  title: String;
  valueAmount: number;

  constructor(id: String, title: String, valueAmount: number) {
    this.id = id;
    this.title = title;
    this.valueAmount = valueAmount;
  }
}

app.get('/', async (req: Request, res: Response) => {
   const uri = process.env.MONGODB_URI ?? "";
   const contratos: Contrato[] = [];

   const client = new MongoClient(uri, {
      serverApi: {
         version: ServerApiVersion.v1,
         strict: true,
         deprecationErrors: true,
      },
   });

   const database: Db = client.db(process.env.MONGODB_DATABASE ?? "licitaciones");
   const collection: Collection = database.collection('contratos');

   const projectFields = { _id: 0, identifier: 1, valueAmount: 1 };

   for await (const item of collection.find().project(projectFields).skip(0).limit(50)) {
      const contrato: Contrato = new Contrato(item["identifier"], item["title"], item["valueAmount"]);
      contratos.push(contrato);
   }

   res.send(contratos.sort((a, b) => a.valueAmount - b.valueAmount));
});

app.listen(port, () => {
   console.log(`Example app listening on port ${port}`);
});