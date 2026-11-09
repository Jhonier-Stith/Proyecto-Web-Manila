export class Bebida {
  id: string;
  nombre: string;
  tipo: string;
  categoria: string;
  ingredientes: string[];
  precio: number;
  imagen: string;

  constructor(
    id: string,
    nombre: string,
    tipo: string,
    categoria: string,
    ingredientes: string[],
    precio: number,
    imagen: string
  ) {
    this.id = id;
    this.nombre = nombre;
    this.tipo = tipo;
    this.categoria = categoria;
    this.ingredientes = ingredientes;
    this.precio = precio;
    this.imagen = imagen;
  }
}