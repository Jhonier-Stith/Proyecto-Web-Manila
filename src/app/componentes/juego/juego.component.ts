import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Destacado } from '../../entidades/destacado';
import { ComidasService } from '../../servicios/comidas.service';
import { BebidasService } from '../../servicios/bebidas.service';

interface Casilla {
  id: number;
  tipo: 'vacia' | 'plato' | 'bebida';
  revelada: boolean;
}

@Component({
  selector: 'app-juego',
  standalone: true,
  imports: [],
  templateUrl: './juego.component.html',
  styleUrl: './juego.component.css'
})
export class JuegoComponent implements OnInit {
  platoObjetivo: Destacado = new Destacado(
    'Plato',
    '',
    'https://i.pinimg.com/736x/16/af/31/16af315399af2ec8f70f232a0ce8daea.jpg'
  );
  bebidaObjetivo: Destacado = new Destacado(
    'Bebida',
    '',
    'https://i.pinimg.com/736x/91/a3/4b/91a34b999e5e7628892bd2582ad7f88f.jpg'
  );

  casillas: Casilla[] = [];
  intentos = 0;
  encontradas = 0;
  rondasGanadas = 0;
  mensaje = '';
  cargando = true;

  private anteriores: [number, number] | null = null;

  constructor(
    private comidasService: ComidasService,
    private bebidasService: BebidasService
  ) {}

  ngOnInit(): void {
    forkJoin([
      this.comidasService.platoAleatorio(),
      this.bebidasService.bebidaAleatoria(),
    ]).subscribe(([plato, bebida]) => {
      if (plato) {
        this.platoObjetivo = plato;
      }
      if (bebida) {
        this.bebidaObjetivo = bebida;
      }
      this.cargando = false;
      this.iniciar();
    });
  }


  iniciar(): void {
    let posPlato: number;
    let posBebida: number;
    do {
      posPlato = Math.floor(Math.random() * 16);
      posBebida = Math.floor(Math.random() * 16);
    } while (
      posPlato === posBebida ||
      posPlato === this.anteriores?.[0] ||
      posBebida === this.anteriores?.[1]
    );
    this.anteriores = [posPlato, posBebida];

    this.casillas = Array.from({ length: 16 }, (_, i) => ({
      id: i,
      tipo: i === posPlato ? 'plato' : i === posBebida ? 'bebida' : 'vacia',
      revelada: false,
    }));
    this.intentos = 0;
    this.encontradas = 0;
    this.mensaje = '';
  }

  elegir(casilla: Casilla): void {
    if (casilla.revelada || this.encontradas === 2) {
      return;
    }

    casilla.revelada = true;
    this.intentos++;

    if (casilla.tipo !== 'vacia') {
      this.encontradas++;
    }

    if (this.encontradas === 2) {
      this.rondasGanadas++;
      this.mensaje = '¡Lo lograste en ' + this.intentos + ' intentos! Presiona "Reiniciar juego" para jugar de nuevo.';
    }
  }
}