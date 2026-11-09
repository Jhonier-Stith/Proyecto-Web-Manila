import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ItemPedido } from '../../entidades/item-pedido';
import { PedidoService } from '../../servicios/pedido.service';

interface DatosPedido {
  fecha: string;
  nombre: string;
  celular: string;
  direccion: string;
  items: ItemPedido[];
  total: number;
}

@Component({
  selector: 'app-pedido',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './pedido.component.html',
  styleUrl: './pedido.component.css'
})
export class PedidoComponent {
  nombre = '';
  celular = '';
  direccion = '';
  error = '';

  // Cuando el cliente da clic en "Realizar pedido" aquí queda el formato
  pedido: DatosPedido | null = null;

  constructor(private pedidoService: PedidoService) {}

  get items(): ItemPedido[] {
    return this.pedidoService.items;
  }

  get total(): number {
    return this.pedidoService.total;
  }

  cambiarCantidad(item: ItemPedido, campo: HTMLInputElement): void {
    this.pedidoService.cambiarCantidad(item, Number(campo.value));
    campo.value = String(item.cantidad);
  }

  quitar(item: ItemPedido): void {
    this.pedidoService.quitar(item.id);
  }

  realizarPedido(): void {
    const nombre = this.nombre.trim();
    const celular = this.celular.replace(/\s/g, '');
    const direccion = this.direccion.trim();

    if (this.items.length === 0) {
      this.error = 'Agrega al menos un plato o una bebida a tu pedido.';
      return;
    }
    if (nombre.length < 3) {
      this.error = 'Escribe tu nombre completo.';
      return;
    }
    if (!/^\d{10}$/.test(celular)) {
      this.error = 'El celular debe tener 10 dígitos.';
      return;
    }
    if (direccion.length < 5) {
      this.error = 'Escribe tu dirección.';
      return;
    }

    this.error = '';
    this.pedido = {
      fecha: new Date().toLocaleDateString('es-CO'),
      nombre,
      celular,
      direccion,
      items: this.items.map(i => new ItemPedido(i.id, i.nombre, i.cantidad, i.precio)),
      total: this.total,
    };
  }

  nuevoPedido(): void {
    this.pedidoService.vaciar();
    this.nombre = '';
    this.celular = '';
    this.direccion = '';
    this.error = '';
    this.pedido = null;
  }

  async descargarPdf(): Promise<void> {
    const pedido = this.pedido;
    if (!pedido) {
      return;
    }

    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const ancho = doc.internal.pageSize.getWidth();
    const alto = doc.internal.pageSize.getHeight();
    const margen = 20;
    let y = 25;

    // Logo
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(124, 58, 237);
    doc.text('MANILA', ancho / 2, y, { align: 'center' });
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(90);
    doc.text('Restaurante', ancho / 2, y, { align: 'center' });
    y += 6;
    doc.setDrawColor(124, 58, 237);
    doc.line(margen, y, ancho - margen, y);
    y += 10;

    // Datos del cliente
    doc.setFontSize(12);
    doc.setTextColor(30);
    const datos: [string, string][] = [
      ['Fecha:', pedido.fecha],
      ['Cliente:', pedido.nombre],
      ['Celular:', pedido.celular],
      ['Dirección:', pedido.direccion],
    ];
    for (const [etiqueta, valor] of datos) {
      const lineas = doc.splitTextToSize(valor, ancho - margen * 2 - 30) as string[];
      doc.setFont('helvetica', 'bold');
      doc.text(etiqueta, margen, y);
      doc.setFont('helvetica', 'normal');
      doc.text(lineas, margen + 30, y);
      y += lineas.length * 6 + 2;
    }
    y += 2;
    doc.line(margen, y, ancho - margen, y);
    y += 9;

    // Lista del pedido
    doc.setFont('helvetica', 'bold');
    doc.text('Producto', margen, y);
    doc.text('Cant.', 130, y, { align: 'center' });
    doc.text('Valor', ancho - margen, y, { align: 'right' });
    y += 3;
    doc.line(margen, y, ancho - margen, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    for (const item of pedido.items) {
      const lineas = doc.splitTextToSize(item.nombre, 95) as string[];
      if (y + lineas.length * 6 > alto - 40) {
        doc.addPage();
        y = 25;
      }
      doc.text(lineas, margen, y);
      doc.text(String(item.cantidad), 130, y, { align: 'center' });
      doc.text('$ ' + item.cantidad * item.precio, ancho - margen, y, { align: 'right' });
      y += lineas.length * 6 + 2;
    }

    // Total
    if (y > alto - 30) {
      doc.addPage();
      y = 25;
    }
    y += 2;
    doc.line(margen, y, ancho - margen, y);
    y += 9;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(124, 58, 237);
    doc.text('Total a pagar: $ ' + pedido.total, ancho - margen, y, { align: 'right' });

    doc.save('pedido-manila.pdf');
  }
}