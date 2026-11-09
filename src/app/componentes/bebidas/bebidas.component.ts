import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Bebida } from '../../entidades/bebida';
import { Resumen } from '../../entidades/resumen';
import { BebidasService } from '../../servicios/bebidas.service';
import { PedidoService } from '../../servicios/pedido.service';

@Component({
  selector: 'app-bebidas',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './bebidas.component.html',
  styleUrl: './bebidas.component.css'
})
export class BebidasComponent implements OnInit, OnDestroy {
  private porPagina = 12;

  nombre = '';
  ingrediente = '';
  tipo = '';
  categoria = '';

  resumenes: Resumen[] = [];
  bebidas: Bebida[] = [];
  cursor = 0;
  cargando = true;

  aviso = '';

  private busqueda?: Subscription;
  private temporizadorAviso?: any;

  constructor(
    private bebidasService: BebidasService,
    private pedidoService: PedidoService
  ) {}

  ngOnInit(): void {
    this.buscar();
  }

  ngOnDestroy(): void {
    this.busqueda?.unsubscribe();
    clearTimeout(this.temporizadorAviso);
  }

  buscar(): void {
    this.busqueda?.unsubscribe();
    this.cargando = true;
    this.resumenes = [];
    this.bebidas = [];
    this.cursor = 0;

    this.busqueda = this.bebidasService
      .buscar({
        nombre: this.nombre.trim(),
        ingrediente: this.ingrediente.trim(),
        tipo: this.tipo,
        categoria: this.categoria,
      })
      .subscribe(resumenes => {
        this.resumenes = resumenes;
        this.cargarMas();
      });
  }

  cargarMas(): void {
    const ids = this.resumenes
      .slice(this.cursor, this.cursor + this.porPagina)
      .map(resumen => resumen.id);
    this.cursor += ids.length;
    this.cargando = true;
    this.bebidasService.detalles(ids).subscribe(bebidas => {
      this.bebidas = [...this.bebidas, ...bebidas];
      this.cargando = false;
    });
  }

  limpiar(): void {
    this.nombre = '';
    this.ingrediente = '';
    this.tipo = '';
    this.categoria = '';
    this.buscar();
  }

  agregar(bebida: Bebida): void {
    this.pedidoService.agregar('bebida-' + bebida.id, bebida.nombre, bebida.precio);
    this.aviso = bebida.nombre + ' agregada al pedido';
    clearTimeout(this.temporizadorAviso);
    this.temporizadorAviso = setTimeout(() => (this.aviso = ''), 2000);
  }
}