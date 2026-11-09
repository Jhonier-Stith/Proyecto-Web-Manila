import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Enlace } from '../../entidades/enlaces';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  nombreRestaurante: string = 'MANILA';
  
  slogan: string = 'Elegancia, sabor y momentos para recordar.';

  direccion: string = 'Calle 10 # 5-20';
  telefono: string = '323 407 6566';
  correo: string = 'manilarestaurant@manila.com';
  horario: string = 'Lunes a Domingo · 12:00 m. a 10:00 p. m.';

  anio: number = new Date().getFullYear();

  enlaces: Enlace[] = [
    new Enlace('Inicio', '/inicio'),
    new Enlace('Comidas', '/comidas'),
    new Enlace('Bebidas', '/bebidas'),
    new Enlace('Pedido', '/pedido'),
    new Enlace('Juego', '/juego'),
  ];
}