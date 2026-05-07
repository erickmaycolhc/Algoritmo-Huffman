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

import { Button, Input, Label } from "@heroui/react";



export default function Home() {
  return (
      <main className="container-ejer">
        <h1 className="text-center">ALGORITMO DE HUFFMAN</h1>
        <div className="flex flex-col mb-4 gap-1 w-80">
          <Label>Ingrese texto a comprimir:</Label>
            <Input
              type= "text"
              placeholder="ejm: Palabra"
              min={1}
            />
        </div>
        <div className="mb-4">
          <Button variant="primary">Comprimir</Button>
        </div>
        <div className="mb-4">
          <Button variant="primary">Descomprimir</Button>
        </div>
      </main>
  );
}
