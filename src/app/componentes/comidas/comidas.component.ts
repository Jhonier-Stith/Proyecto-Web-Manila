import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Plato } from '../../entidades/platos';
import { Resumen } from '../../entidades/resumen';
import { ComidasService } from '../../servicios/comidas.service';
import { PedidoService } from '../../servicios/pedido.service';

interface GrupoCategoria {
  nombre: string;
  resumenes: Resumen[];
  platos: Plato[];
  cursor: number;
  cargando: boolean;
}

@Component({
  selector: 'app-comidas',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './comidas.component.html',
  styleUrl: './comidas.component.css'
})
export class ComidasComponent implements OnInit, OnDestroy {
  private porCategoria = 4;
  private porBusqueda = 8;

  private traducciones: Record<string, string> = {
    Beef: 'Res',
    Breakfast: 'Desayuno',
    Chicken: 'Pollo',
    Dessert: 'Postres',
    Goat: 'Cabra',
    Lamb: 'Cordero',
    Miscellaneous: 'Varios',
    Pasta: 'Pasta',
    Pork: 'Cerdo',
    Seafood: 'Mariscos',
    Side: 'Acompañamientos',
    Starter: 'Entradas',
    Vegan: 'Vegano',
    Vegetarian: 'Vegetariano',
  };

  grupos: GrupoCategoria[] = [];
  cargandoCategorias = true;

  
  nombreBusqueda = '';
  ingredienteBusqueda = '';
  modoBusqueda = false;
  buscando = false;
  resumenesBusqueda: Resumen[] = [];
  resultados: Plato[] = [];
  cursorBusqueda = 0;

  aviso = '';

  private busqueda?: Subscription;
  private temporizadorAviso?: any;

  constructor(
    private comidasService: ComidasService,
    private pedidoService: PedidoService
  ) {}

  ngOnInit(): void {
    this.comidasService.categorias().subscribe(categorias => {
      this.cargandoCategorias = false;
      this.grupos = categorias.map(nombre => ({
        nombre,
        resumenes: [],
        platos: [],
        cursor: 0,
        cargando: true,
      }));
      this.grupos.forEach(grupo => {
        this.comidasService.porCategoria(grupo.nombre).subscribe(resumenes => {
          grupo.resumenes = resumenes;
          this.cargarMasGrupo(grupo);
        });
      });
    });
  }

  ngOnDestroy(): void {
    this.busqueda?.unsubscribe();
    clearTimeout(this.temporizadorAviso);
  }

  tituloCategoria(nombre: string): string {
    return this.traducciones[nombre] ?? nombre;
  }

  cargarMasGrupo(grupo: GrupoCategoria): void {
    const ids = grupo.resumenes
      .slice(grupo.cursor, grupo.cursor + this.porCategoria)
      .map(resumen => resumen.id);
    grupo.cursor += ids.length;
    grupo.cargando = true;
    this.comidasService.detalles(ids).subscribe(platos => {
      grupo.platos = [...grupo.platos, ...platos];
      grupo.cargando = false;
    });
  }

  buscar(): void {
    const nombre = this.nombreBusqueda.trim();
    const ingrediente = this.ingredienteBusqueda.trim();

    if (!nombre && !ingrediente) {
      this.limpiar();
      return;
    }

    this.busqueda?.unsubscribe();
    this.modoBusqueda = true;
    this.buscando = true;
    this.resultados = [];
    this.resumenesBusqueda = [];
    this.cursorBusqueda = 0;

    this.busqueda = this.comidasService.buscar(nombre, ingrediente).subscribe(resumenes => {
      this.resumenesBusqueda = resumenes;
      this.cargarMasBusqueda();
    });
  }

  cargarMasBusqueda(): void {
    const ids = this.resumenesBusqueda
      .slice(this.cursorBusqueda, this.cursorBusqueda + this.porBusqueda)
      .map(resumen => resumen.id);
    this.cursorBusqueda += ids.length;
    this.buscando = true;
    this.comidasService.detalles(ids).subscribe(platos => {
      this.resultados = [...this.resultados, ...platos];
      this.buscando = false;
    });
  }

  limpiar(): void {
    this.busqueda?.unsubscribe();
    this.nombreBusqueda = '';
    this.ingredienteBusqueda = '';
    this.modoBusqueda = false;
    this.buscando = false;
    this.resultados = [];
    this.resumenesBusqueda = [];
  }

  agregar(plato: Plato): void {
    this.pedidoService.agregar('comida-' + plato.id, plato.nombre, plato.precio);
    this.aviso = plato.nombre + ' agregado al pedido';
    clearTimeout(this.temporizadorAviso);
    this.temporizadorAviso = setTimeout(() => (this.aviso = ''), 2000);
  }
}