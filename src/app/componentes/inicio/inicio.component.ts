import { Component, OnInit } from '@angular/core';
import { Destacado } from '../../entidades/destacado';
import { ComidasService } from '../../servicios/comidas.service';
import { BebidasService } from '../../servicios/bebidas.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements OnInit {
  imagenesCarrusel: string[] = [
    'https://i.pinimg.com/1200x/bb/2c/13/bb2c13a90c544f45ce6158b63f144349.jpg',
    'https://i.pinimg.com/736x/51/39/66/5139669f86dbb8cf1ca0238a00446bdb.jpg',
    'https://i.pinimg.com/736x/cd/96/1c/cd961c3df3ed18225a6426871a6f4ef6.jpg',
  ];

  platoEstrella: Destacado = new Destacado(
    'Cargando...',
    '',
    'https://placehold.co/600x400/241b3a/a78bfa?text=Cargando'
  );

  bebidaEstrella: Destacado = new Destacado(
    'Cargando...',
    '',
    'https://placehold.co/600x400/241b3a/a78bfa?text=Cargando'
  );

  constructor(
    private comidasService: ComidasService,
    private bebidasService: BebidasService
  ) {}

  ngOnInit(): void {
    this.comidasService.platoEstrella('Arrabiata').subscribe(plato => {
      if (plato) {
        this.platoEstrella = plato;
      }
    });

    this.bebidasService.bebidaEstrella('Margarita').subscribe(bebida => {
      if (bebida) {
        this.bebidaEstrella = bebida;
      }
    });
  }
}