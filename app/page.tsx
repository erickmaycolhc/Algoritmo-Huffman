"use client";

import { Button, FieldError, Input, Label, TextField } from "@heroui/react";
import { useState, useRef, type ChangeEvent } from "react";

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
    if (frecuencias[caracter]) { // Si el caracter ya existe en el objeto, incrementa su frecuencia
      frecuencias[caracter]++;  
    } else {
      frecuencias[caracter] = 1; // Si el caracter no existe, inicializa su frecuencia en 1
    }
  }
  return frecuencias; // ejm "aba" => { "a": 2, "b": 1 }
};

// funcion para construir el árbol de Huffman a partir de las frecuencias calculadas de los caracteres
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

  return nodos[0]; // el último nodo restante es la raíz del árbol de Huffman
};

// función para recorrer el árbol de Huffman para asignar un código binario a cada carácter.
const generarCodificacion = (nodo: HuffmanNode, codigo: string = "", codificacion: Record<string, string> = {}): Record<string, string> => {

  if (nodo.caracter != null) {
    codificacion[nodo.caracter] = codigo; // se asigna el código binario actual a ese caracter
  } else {
    generarCodificacion(nodo.izquierda!, codigo + "0", codificacion);
    generarCodificacion(nodo.derecha!, codigo + "1", codificacion);
  }
  return codificacion; // devuelve el objeto con la codificación de cada caracter, ejm: { "a": "0", "b": "10", "c": "11" }
};

// funcion para comprimir el texto orignal utilizando la codificación generada
const comprimirTexto = (texto: string, codificacion: Record<string, string>) =>{
  let textoComprimido = "";
  for (const caracter of texto) {
    textoComprimido += codificacion[caracter];
  }
  return textoComprimido; // devuelve una secuencia de bits comprimida si texto es "aba" y codificacion es { "a": "0", "b": "10" } => devuelve "0100"
};

// funcion para descomprimir y tomar la cadena de bits comprimida y usa el arbol de Huffman para recuperar el texto original
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
  return textoDescomprimido; // devuelve el texto original recuperado a partir de la secuencia de bits comprimida, ejm: si textoComprimido es "0100" y el árbol de Huffman asigna "a" a "0" y "b" a "10", devuelve "aba"
}

export default function Home() {
  const [texto, setTexto] = useState("");
  const [frecuencias, setFrecuencias] = useState<Record<string, number>>({});
  const [arbolHuffman, setArbolHuffman] = useState<HuffmanNode | null>(null);
  const [codificacion, setCodificacion] = useState<Record<string, string>>({});
  const [textoComprimido, setTextoComprimido] = useState("");
  const [textoDescomprimido, setTextoDescomprimido] = useState("");
  const [isInvalidInput, setInvalidInput] = useState(false);
  const [operacion, setOperacion] = useState<"ninguna" | "comprimir" | "cargar" | "flujo">("ninguna");
  const [mensajeOperacion, setMensajeOperacion] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /////////////////////////////////////
  const descargarTxt = () => {
    if (texto.trim() === "") {
      setInvalidInput(true);
      return;
    }
    setInvalidInput(false);

    const frecuenciasCalculadas = calcularFrencuencias(texto);
    setFrecuencias(frecuenciasCalculadas);

    const arbol = construirArbolHuffman(frecuenciasCalculadas);
    setArbolHuffman(arbol);

    const codificacionGenerada = generarCodificacion(arbol);
    setCodificacion(codificacionGenerada);

    const textoComprimidoGenerado = comprimirTexto(texto, codificacionGenerada);
    setTextoComprimido(textoComprimidoGenerado);

    const textoDescomprimidoGenerado = descomprimirTexto(textoComprimidoGenerado, arbol);
    setTextoDescomprimido(textoDescomprimidoGenerado);
    setOperacion("comprimir");
    setMensajeOperacion("Archivo generado y descargado. Cargue el archivo para ver la información de la descompresión.");

    const payload = {
      comprimido: textoComprimidoGenerado,
      codificacion: codificacionGenerada,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "huffman.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const cargarTxt = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        const data = JSON.parse(text);
        const comprimido = data.comprimido ?? "";
        const codificacionData: Record<string, string> | undefined = data.codificacion;
        const frecuenciasData: Record<string, number> | undefined = data.frecuencias;

        let arbol: HuffmanNode | null = null;

        if (frecuenciasData && Object.keys(frecuenciasData).length > 0) {
          setFrecuencias(frecuenciasData);
          arbol = construirArbolHuffman(frecuenciasData);
        } else if (codificacionData && Object.keys(codificacionData).length > 0) {
          const buildTreeFromCodificacion = (cod: Record<string, string>): HuffmanNode => {
            const root: HuffmanNode = { caracter: null, frecuencia: 0 };
            for (const [char, code] of Object.entries(cod)) {
              let node = root;
              for (const bit of code) {
                if (bit === "0") {
                  if (!node.izquierda) node.izquierda = { caracter: null, frecuencia: 0 };
                  node = node.izquierda;
                } else {
                  if (!node.derecha) node.derecha = { caracter: null, frecuencia: 0 };
                  node = node.derecha;
                }
              }
              node.caracter = char;
            }
            return root;
          };
          arbol = buildTreeFromCodificacion(codificacionData);
          setFrecuencias({});
        } else {
          alert("Archivo inválido. Asegúrese de que sea un .txt creado por la herramienta.");
          return;
        }

        setArbolHuffman(arbol);

        const codificacionGenerada = codificacionData ?? generarCodificacion(arbol!);
        setCodificacion(codificacionGenerada);
        setTextoComprimido(comprimido);

        const textoDescomprimidoGenerado = comprimido && arbol ? descomprimirTexto(comprimido, arbol) : "";
        setTextoDescomprimido(textoDescomprimidoGenerado);

        // Si el archivo no trae el texto original, usar el resultado de la descompresión
        const originalFromFile = data.original ?? textoDescomprimidoGenerado;
        setTexto(originalFromFile);

        // Determinar el mapa de frecuencias final (provisto en archivo o reconstruido desde el texto)
        let frecuenciasFinal: Record<string, number> = {};
        if (frecuenciasData && Object.keys(frecuenciasData).length > 0) {
          frecuenciasFinal = frecuenciasData;
        } else if (originalFromFile) {
          frecuenciasFinal = calcularFrencuencias(originalFromFile);
        }
        setFrecuencias(frecuenciasFinal);

        // Rellenar las frecuencias en los nodos del árbol para mostrar conteos correctos
        const actualizarFrecuenciasEnArbol = (nodo: HuffmanNode | undefined, freqMap: Record<string, number>): number => {
          if (!nodo) return 0;
          if (nodo.caracter != null) {
            nodo.frecuencia = freqMap[nodo.caracter] ?? 0;
            return nodo.frecuencia;
          }
          const izq = actualizarFrecuenciasEnArbol(nodo.izquierda, freqMap);
          const der = actualizarFrecuenciasEnArbol(nodo.derecha, freqMap);
          nodo.frecuencia = izq + der;
          return nodo.frecuencia;
        };

        if (arbol) actualizarFrecuenciasEnArbol(arbol, frecuenciasFinal);

        setOperacion("cargar");
        setMensajeOperacion("Archivo cargado. Mostrando resultados de la descompresión.");
      } catch (err) {
        alert("Archivo inválido. Asegúrese de que sea un .txt creado por la herramienta.");
      }
    };
    reader.readAsText(file);
    e.currentTarget.value = "";
  };

  const manejarComprimir = () => {
    if (texto.trim() === "") {
      setInvalidInput(true);
    } else {
      setInvalidInput(false);
      console.log("Texto ingresado:", texto);
    }

    const frecuenciasCalculadas  = calcularFrencuencias(texto);
    setFrecuencias(frecuenciasCalculadas);
    setOperacion("flujo");
    setMensajeOperacion("Mostrando el flujo completo directo.");

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
                  if (operacion !== "ninguna") {
                    setOperacion("ninguna");
                    setMensajeOperacion("");
                  }
                }}
              />
              <FieldError>Debe ingresar texto</FieldError>
            </TextField>
          </div>
          <div className="alerta">
            {operacion !== "ninguna" && (
              <div className="rounded border border-slate-700 bg-slate-900 p-3 text-slate-100">
                <p className="text-sm">{mensajeOperacion}</p>
              </div>
            )}
          </div>
          <div className="mb-4">
            <Button variant="primary" onClick={descargarTxt}>Comprimir y descargar</Button>
          </div>

          <div className="mb-4">
            <Button variant="primary" onClick={cargarTxt}>Cargar y descomprimir</Button>
            <input ref={fileInputRef} type="file" accept=".txt,text/plain" className="hidden" onChange={handleFileChange} />
          </div>

          <div className="mb-4">
            <Button variant="primary" onClick={manejarComprimir}>Ver flujo completo</Button>
          </div>
        </div>
        {(operacion === "cargar" || operacion === "flujo") && (
          <>
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
          </>
        )}
      </main>
  );
}
