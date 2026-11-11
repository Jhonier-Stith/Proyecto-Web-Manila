

export class Destacado {
  nombre: string;
  descripcion: string;
  imagen: string;
  id: string;
  precio: number;

  constructor(nombre: string, descripcion: string, imagen: string, id: string = '', precio: number = 0) {
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.imagen = imagen;
    this.id = id;
    this.precio = precio;
  }
}