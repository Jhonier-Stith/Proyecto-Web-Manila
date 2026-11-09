export class ItemPedido {
  id: string;
  nombre: string;
  cantidad: number;
  precio: number;

  constructor(id: string, nombre: string, cantidad: number, precio: number) {
    this.id = id;
    this.nombre = nombre;
    this.cantidad = cantidad;
    this.precio = precio;
  }
}