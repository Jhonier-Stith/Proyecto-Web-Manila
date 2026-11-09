import { Resumen } from '../entidades/resumen';

export function precioAleatorio(): number {
  return (Math.floor(Math.random() * 56) + 15) * 1000;
}

export function interseccion(listas: Resumen[][]): Resumen[] {
  if (listas.length === 0) {
    return [];
  }
  return listas[0].filter(item =>
    listas.every(lista => lista.some(otro => otro.id === item.id))
  );
}

export function resumirTexto(texto: string, maximo: number = 220): string {
  const limpio = (texto ?? '').replace(/\s+/g, ' ').trim();
  if (limpio.length <= maximo) {
    return limpio;
  }
  return limpio.substring(0, maximo).replace(/\s+\S*$/, '') + '…';
}