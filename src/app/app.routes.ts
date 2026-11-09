import { Routes } from '@angular/router';
import { InicioComponent } from './componentes/inicio/inicio.component';
import { ComidasComponent } from './componentes/comidas/comidas.component';
import { BebidasComponent } from './componentes/bebidas/bebidas.component';
import { PedidoComponent } from './componentes/pedido/pedido.component';
import { JuegoComponent } from './componentes/juego/juego.component';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: InicioComponent },
  { path: 'comidas', component: ComidasComponent },
  { path: 'bebidas', component: BebidasComponent },
  { path: 'pedido', component: PedidoComponent },
  { path: 'juego', component: JuegoComponent },
];