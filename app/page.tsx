"use client";

/*Desarrolle un programa que permita comprimir archivos de texto en
formato TXT mediante el uso del algoritmo de Huffman. El sistema deberá
solicitar al usuario el ingreso de un texto o cadena, y mostrar de manera
detallada el desarrollo paso a paso del proceso de compresión. Inicialmente,
deberá generar y presentar la tabla de frecuencias (absoluta o relativa) de
aparición de cada carácter o símbolo en el texto ingresado. Luego, deberá
construir y mostrar el árbol de Huffman resultante, así como la codificación
asignada a cada carácter según dicho árbol. Asimismo, el programa deberá
generar y mostrar el archivo comprimido correspondiente. Posteriormente,
deberá permitir la descompresión del archivo utilizando el árbol de Huffman
previamente generado, mostrando el texto original recuperado. Además, el
programa deberá permitir al usuario seleccionar la información que desea
visualizar, entre las siguientes opciones: el número de bits empleados por la
cadena original, el número de bits utilizados al aplicar la codificación de
Huffman (según el árbol generado) o el porcentaje de reducción de bits
logrado. Finalmente, el programa deberá contar con una interfaz gráfica
amigable e intuitiva que facilite la interacción del usuario.
*/

import { Button, FieldError, Input, Label, TextField } from "@heroui/react";
import { useState } from "react";

type HuffmanNode = {
  caracter: string | null;
  frecuencia: number;
  izquierda?: HuffmanNode;
  derecha?: HuffmanNode;
};

// funcion para calcular las frecuencias de cada caracter en el texto ingresado
const calcularFrencuencias = (texto: string) => {
  const frecuencias: Record<string, number> = {};
  for (const caracter of texto) {
    if (frecuencias[caracter]) {
      frecuencias[caracter]++;
    } else {
      frecuencias[caracter] = 1;
    }
  }
  return frecuencias;
};

// funcion para construir el árbol de Huffman a partir de las frecuencias calculadas
const construirArbolHuffman = (frecuencias: Record<string, number>): HuffmanNode => {
  const nodos: HuffmanNode[] = Object.entries(frecuencias)
    .map(([caracter, frecuencia]) => ({ caracter, frecuencia }))
    .sort((a, b) => a.frecuencia - b.frecuencia);

  while (nodos.length > 1) {
    const nodo1 = nodos.shift()!;
    const nodo2 = nodos.shift()!;
    const nuevoNodo: HuffmanNode = {
      caracter: null,
      frecuencia: nodo1.frecuencia + nodo2.frecuencia,
      izquierda: nodo1,
      derecha: nodo2,
    };
    nodos.push(nuevoNodo);
    nodos.sort((a, b) => a.frecuencia - b.frecuencia);
  }

  return nodos[0];
};

// función para generar la codificación de cada caracter según el árbol de Huffman construido
const generarCodificacion = (nodo: HuffmanNode, codigo: string = "", codificacion: Record<string, string> = {}): Record<string, string> => {
  if (nodo.caracter != null) {
    codificacion[nodo.caracter] = codigo;
  } else {
    generarCodificacion(nodo.izquierda!, codigo + "0", codificacion);
    generarCodificacion(nodo.derecha!, codigo + "1", codificacion);
  }
  return codificacion;
};

// funcion para comprimir el texto utilizando la codificación generada
const comprimirTexto = (texto: string, codificacion: Record<string, string>) =>{
  let textoComprimido = "";
  for (const caracter of texto) {
    textoComprimido += codificacion[caracter];
  }
  return textoComprimido;
};

// funcion para descomprimir el texto utilizando el árbol de Huffman
const descomprimirTexto = (textoComprimido: string, nodo: HuffmanNode): string => {
  let textoDescomprimido = "";
  let nodoActual = nodo;
  for (const bit of textoComprimido) {
    nodoActual = bit === "0" ? nodoActual.izquierda! : nodoActual.derecha!;
    if (nodoActual.caracter != null) {
      textoDescomprimido += nodoActual.caracter;
      nodoActual = nodo;
    }
  }
  return textoDescomprimido;
}

export default function Home() {
  const [texto, setTexto] = useState("");
  const [frecuencias, setFrecuencias] = useState<Record<string, number>>({});
  const [arbolHuffman, setArbolHuffman] = useState<HuffmanNode | null>(null);
  const [codificacion, setCodificacion] = useState<Record<string, string>>({});
  const [textoComprimido, setTextoComprimido] = useState("");
  const [textoDescomprimido, setTextoDescomprimido] = useState("");
  const [isInvalidInput, setInvalidInput] = useState(false);

  const manejarComprimir = () => {
    if (texto.trim() === "") {
      setInvalidInput(true);
    } else {
      setInvalidInput(false);
      console.log("Texto ingresado:", texto);
    }

    const frecuenciasCalculadas  = calcularFrencuencias(texto);
    setFrecuencias(frecuenciasCalculadas);

    const arbol = construirArbolHuffman(frecuenciasCalculadas);
    setArbolHuffman(arbol);

    const codificacionGenerada = generarCodificacion(arbol);
    setCodificacion(codificacionGenerada);

    const textoComprimidoGenerado = comprimirTexto(texto, codificacionGenerada);
    setTextoComprimido(textoComprimidoGenerado);

    const textoDescomprimidoGenerado = descomprimirTexto(textoComprimidoGenerado, arbol);
    setTextoDescomprimido(textoDescomprimidoGenerado);
  }

  return (
      <main className="container-ejer">
        <h1 className="text-center font-bold">ALGORITMO DE HUFFMAN</h1>
        <div className="bg-slate-800 text-slate-100 p-4 rounded shadow mb-4 border border-slate-700">
          <div className="flex flex-col mb-4 gap-1 w-80">
            <TextField isRequired isInvalid={isInvalidInput}>
            <Label>Ingrese texto a comprimir:</Label>
              <Input
                type="text"
                placeholder="ejm: Palabra"
                value={texto}
                onChange={(e) => {
                  setTexto(e.target.value);
                  if (isInvalidInput && e.target.value.trim() !== "") {
                    setInvalidInput(false); // Limpia el error al escribir
                  }
                }}
              />
              <FieldError>Debe ingresar texto</FieldError>
            </TextField>
          </div>
          <div className="alerta">
            <span></span>
          </div>
          <div className="mb-4">
            <Button variant="primary" onClick={manejarComprimir}>Comprimir</Button>
          </div>
          <div className="mb-4">
            <Button variant="primary" onClick={manejarComprimir}>
              Descomprimir
            </Button>
          </div>
        </div>
        <div className="mb-4">
          {
            Object.keys(frecuencias).length > 0 && (
              <div className="bg-slate-800 text-slate-100 p-4 rounded shadow mb-4 border border-slate-700">
                <h2 className="text-xl font-bold mb-2">Tabla de Frecuencias</h2>
                <table className="border-collapse border border-slate-700 w-full">
                  <thead>
                    <tr className="bg-slate-900">
                      <th className="border border-slate-700 px-4 py-2">Carácter</th>
                      <th className="border border-slate-700 px-4 py-2">Frecuencia Absoluta</th>
                      <th className="border border-slate-700 px-4 py-2">Frecuencia Relativa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const total = Object.values(frecuencias).reduce((sum, f) => sum + f, 0);
                      return Object.entries(frecuencias).map(([caracter, frecuencia]) => (
                        <tr key={caracter}>
                          <td className="border border-slate-700 px-4 py-2 text-center text-slate-100">
                            {caracter === " " ? "Espacio" : caracter}
                          </td>
                          <td className="border border-slate-700 px-4 py-2 text-center text-slate-100">{frecuencia}</td>
                          <td className="border border-slate-700 px-4 py-2 text-center text-slate-100">
                            {((frecuencia / total) * 100).toFixed(2)}%
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>
        <div className="mb-4">
          {
            arbolHuffman && (
              <div className="bg-slate-800 text-slate-100 p-4 rounded shadow mb-4 border border-slate-700">
                <h2 className="text-xl font-bold mb-2">Árbol de Huffman</h2>
                <pre className="bg-slate-900 p-2 rounded text-sm overflow-x-auto text-slate-100">
                  {(() => {
                    const mostrarArbol = (nodo: HuffmanNode, prefijo = ""): string => {
                      if (!nodo) return "";
                      if (nodo.caracter !== null) return `${prefijo}${nodo.caracter} (${nodo.frecuencia})\n`;
                      return mostrarArbol(nodo.izquierda!, prefijo + "0-") + mostrarArbol(nodo.derecha!, prefijo + "1-");
                    };
                    return mostrarArbol(arbolHuffman);
                  })()}
                </pre>
              </div>
            )
          }
        </div>
        <div className="mb-4">
          {
            Object.keys(codificacion).length > 0 && (
              <div className="bg-slate-800 text-slate-100 p-4 rounded shadow mb-4 border border-slate-700">
                <h2 className="text-xl font-bold mb-2">Codificación Huffman</h2>
                <table className="border-collapse border border-slate-700 w-full">
                  <thead>
                    <tr className="bg-slate-900">
                      <th className="border border-slate-700 px-4 py-2">Carácter</th>
                      <th className="border border-slate-700 px-4 py-2">Código Binario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(codificacion).map(([caracter, codigo]) => (
                      <tr key={caracter}>
                        <td className="border border-slate-700 px-4 py-2 text-center text-slate-100">
                          {caracter === " " ? "Espacio" : caracter}
                        </td>
                        <td className="border border-slate-700 px-4 py-2 text-center font-mono text-slate-100">{codigo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>
        <div className="mb-4">
          {textoComprimido && (
            <div className="bg-slate-800 text-slate-100 p-4 rounded shadow mb-4 border border-slate-700">
              <h2 className="text-xl font-bold mb-2">Resultados de Compresión</h2>
              <div className="mb-4">
                <h3 className="font-semibold">Texto Comprimido:</h3>
                <p className="bg-slate-900 p-2 rounded font-mono text-sm break-all text-slate-100">{textoComprimido}</p>
              </div>
              <div className="mb-4">
                <h3 className="font-semibold">Texto Descomprimido:</h3>
                <p className="bg-slate-900 p-2 rounded text-slate-100">{textoDescomprimido}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 p-3 rounded border border-slate-700">
                  <p className="font-semibold">Bits Originales:</p>
                  <p className="text-lg">{texto.length * 8}</p>
                </div>
                <div className="bg-slate-900 p-3 rounded border border-slate-700">
                  <p className="font-semibold">Bits Comprimidos:</p>
                  <p className="text-lg">{textoComprimido.length}</p>
                </div>
                <div className="bg-slate-900 p-3 rounded border border-slate-700">
                  <p className="font-semibold">Reducción:</p>
                  <p className="text-lg">{((1 - textoComprimido.length / (texto.length * 8)) * 100).toFixed(2)}%</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
  );
}
