export class Plato {
  id: string;
  nombre: string;
  categoria: string;
  ingredientes: string[];
  precio: number;
  imagen: string;

  constructor(
    id: string,
    nombre: string,
    categoria: string,
    ingredientes: string[],
    precio: number,
    imagen: string
  ) {
    this.id = id;
    this.nombre = nombre;
    this.categoria = categoria;
    this.ingredientes = ingredientes;
    this.precio = precio;
    this.imagen = imagen;
  }
}