import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface EnlaceMenu {
  texto: string;
  ruta: string;
}

@Component({
  selector: 'app-navegacion',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navegacion.component.html',
  styleUrl: './navegacion.component.css'
})

export class NavegacionComponent {
  nombreRestaurante: string = 'MANILA';
  enlaces: EnlaceMenu[] = [
    { texto: 'Inicio', ruta: '/inicio' },
    { texto: 'Comidas', ruta: '/comidas' },
    { texto: 'Bebidas', ruta: '/bebidas' },
    { texto: 'Pedido', ruta: '/pedido' },
    { texto: 'Juego', ruta: '/juego' },
  ];
}