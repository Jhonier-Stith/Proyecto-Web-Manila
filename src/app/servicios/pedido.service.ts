import { Injectable } from '@angular/core';
import { ItemPedido } from '../entidades/item-pedido';

@Injectable({ 
  providedIn: 'root' 
})
export class PedidoService {
  items: ItemPedido[] = [];

  agregar(id: string, nombre: string, precio: number): void {
    const existente = this.items.find(item => item.id === id);
    if (existente) {
      existente.cantidad++;
    } else {
      this.items.push(new ItemPedido(id, nombre, 1, precio));
    }
  }

  cambiarCantidad(item: ItemPedido, cantidad: number): void {
    item.cantidad = Number.isFinite(cantidad) && cantidad >= 1 ? Math.floor(cantidad) : 1;
  }

  quitar(id: string): void {
    this.items = this.items.filter(item => item.id !== id);
  }

  vaciar(): void {
    this.items = [];
  }

  get total(): number {
    return this.items.reduce((suma, item) => suma + item.cantidad * item.precio, 0);
  }
}