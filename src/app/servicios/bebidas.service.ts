import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Bebida } from '../entidades/bebida';
import { Resumen } from '../entidades/resumen';
import { Destacado } from '../entidades/destacado';
import { interseccion, precioAleatorio, resumirTexto } from './Utilidades';

export interface FiltrosBebida {
  nombre: string;
  ingrediente: string;
  tipo: string;       // '', 'Alcoholic', 'Non_Alcoholic'
  categoria: string;  // '', 'Ordinary_Drink', 'Cocktail'
}

@Injectable({ providedIn: 'root' })
export class BebidasService {
  private url = 'https://www.thecocktaildb.com/api/json/v1/1';
  private cache = new Map<string, Bebida>();

  private tipos: Record<string, string> = {
    'Alcoholic': 'Alcohólica',
    'Non alcoholic': 'Sin alcohol',
    'Optional alcohol': 'Alcohol opcional',
  };

  private categorias: Record<string, string> = {
    'Cocktail': 'Cóctel',
    'Ordinary Drink': 'Bebida ordinaria',
    'Other / Unknown': 'Otra',
  };

  constructor(private http: HttpClient) {}

  todas(): Observable<Resumen[]> {
    return forkJoin([
      this.lista('filter.php', { c: 'Ordinary_Drink' }),
      this.lista('filter.php', { c: 'Cocktail' }),
    ]).pipe(map(([ordinarias, cocteles]) => [...ordinarias, ...cocteles]));
  }

  buscar(filtros: FiltrosBebida): Observable<Resumen[]> {
    const consultas: Observable<Resumen[]>[] = [];

    if (filtros.nombre) {
      consultas.push(this.porNombre(filtros.nombre));
    }
    if (filtros.ingrediente) {
      consultas.push(this.lista('filter.php', { i: filtros.ingrediente.replace(/\s+/g, '_') }));
    }
    if (filtros.tipo) {
      consultas.push(this.lista('filter.php', { a: filtros.tipo }));
    }
    if (filtros.categoria) {
      consultas.push(this.lista('filter.php', { c: filtros.categoria }));
    }

    if (consultas.length === 0) {
      return this.todas();
    }
    return forkJoin(consultas).pipe(map(listas => interseccion(listas)));
  }

  // Trae el detalle (ingredientes, tipo, categoría) de varias bebidas
  detalles(ids: string[]): Observable<Bebida[]> {
    if (ids.length === 0) {
      return of([]);
    }
    const peticiones: Observable<Bebida | null>[] = ids.map(id => {
      const guardada = this.cache.get(id);
      if (guardada) {
        return of(guardada);
      }
      return this.http.get<any>(`${this.url}/lookup.php`, { params: { i: id } }).pipe(
        map(r => (r?.drinks?.[0] ? this.aBebida(r.drinks[0]) : null)),
        catchError(() => of(null))
      );
    });
    return forkJoin(peticiones).pipe(
      map(bebidas => bebidas.filter((b): b is Bebida => b !== null))
    );
  }

  bebidaEstrella(nombre: string): Observable<Destacado | null> {
    return this.http.get<any>(`${this.url}/search.php`, { params: { s: nombre } }).pipe(
      map(r => this.aDestacado(r?.drinks?.[0])),
      catchError(() => of(null))
    );
  }

  bebidaAleatoria(): Observable<Destacado | null> {
    return this.http.get<any>(`${this.url}/random.php`).pipe(
      map(r => this.aDestacado(r?.drinks?.[0])),
      catchError(() => of(null))
    );
  }

  private porNombre(nombre: string): Observable<Resumen[]> {
    return this.http.get<any>(`${this.url}/search.php`, { params: { s: nombre } }).pipe(
      map(r => {
        const bebidas: any[] = Array.isArray(r?.drinks) ? r.drinks : [];
        return bebidas.map(d => {
          const bebida = this.aBebida(d);
          return { id: bebida.id, nombre: bebida.nombre, imagen: bebida.imagen };
        });
      }),
      catchError(() => of([]))
    );
  }

  private lista(ruta: string, parametros: Record<string, string>): Observable<Resumen[]> {
    return this.http.get<any>(`${this.url}/${ruta}`, { params: parametros }).pipe(
      map(r => {
        const bebidas: any[] = Array.isArray(r?.drinks) ? r.drinks : [];
        return bebidas.map(d => ({ id: d.idDrink, nombre: d.strDrink, imagen: d.strDrinkThumb }));
      }),
      catchError(() => of([]))
    );
  }

  private aDestacado(d: any): Destacado | null {
    if (!d) {
      return null;
    }
    return new Destacado(
      d.strDrink,
      resumirTexto(d.strInstructionsES || d.strInstructions),
      d.strDrinkThumb
    );
  }

  private aBebida(d: any): Bebida {
    const guardada = this.cache.get(d.idDrink);
    if (guardada) {
      return guardada;
    }
    const ingredientes: string[] = [];
    for (let i = 1; i <= 15; i++) {
      const ingrediente = d['strIngredient' + i];
      if (ingrediente && ingrediente.trim() !== '') {
        ingredientes.push(ingrediente.trim());
      }
    }
    const bebida = new Bebida(
      d.idDrink,
      d.strDrink,
      this.tipos[d.strAlcoholic] ?? d.strAlcoholic,
      this.categorias[d.strCategory] ?? d.strCategory,
      Array.from(new Set(ingredientes)),
      precioAleatorio(),
      d.strDrinkThumb
    );
    this.cache.set(bebida.id, bebida);
    return bebida;
  }
}