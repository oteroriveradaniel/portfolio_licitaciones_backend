export class Contrato {
  id: string;
  title: string;
  valueAmount: number;

  constructor(id: string, title: string, valueAmount: number) {
    this.id = id;
    this.title = title;
    this.valueAmount = valueAmount;
  }
}