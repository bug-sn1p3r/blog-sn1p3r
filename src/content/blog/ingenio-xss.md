---
title: "Detrás del escenario - Técnicas XSS #1"
description: "En este Post exploraremos el ingenio y las técnicas básicas detrás de la búsqueda de vulnerabilidades XSS, también usaremos herramientas para búsqueda masiva de endpoints donde posiblemente se pueda explotar XSS reflectivo."
pubDate: "Jun 02 2024"
postType: "hacking"
tags:
  - xss
  - payloads
  - tools
  - waymore
  - paramspider
---


## Introducción al XSS

En esta primer parte haremos un poco de *Recon* utilizando herramientas de **FingerPrinter** como **Waymore** y **Paramspider** con esto colectaremos todos los puntos finales, la explotación será manual donde utilizaremos un proxy para interceptar todas las peticiones para evaluacion o revision manual mas a profundidad.

El **Cross-Site Scripting** (**XSS**) es una vulnerabilidad de seguridad web o componentes webs, ya que el impacto se ve reflejado en el navegador de la víctima, esto lo que permite es a los atacantes **inyectar** 💉 scripts maliciosos en los navegadores de las víctimas.

Un análisis realizado por Owasp Top 10 2021 nos dice que la inyección en el 94% de las solicitudes fueron probadas para algún tipo de inyección, con una tasa de incidencia máxima del 19%, una tasa de incidencia promedio del 3% y 274,000 ocurrencias. Las enumeraciones de vulnerabilidades comunes (CWE) notables incluyen:

- CWE-79: **Cross-Site Scripting (XSS)**
- CWE-89: SQL Injection
- CWE-73: External Control of File Name or Path

[Fuente - owasp.org](https://owasp.org/Top10/A03_2021-Injection/)


## Tipos de XSS
El foco de este post sera en xss reflectivos, ya que existen varios tipos y variantes de XSS.

### - rXSS o Cross Site scripting reflective

El **Reflected XSS**, el script malicioso se refleja en la respuesta del servidor. Esto ocurre cuando los datos proporcionados por el usuario se devuelven inmediatamente en la respuesta sin ser adecuadamente validados o escapados.


### - sXSS o Cross Site scripting stored

El **Stored XSS**, el script malicioso se almacena en el servidor y se ejecuta cada vez que un usuario accede al dato almacenado. Esto es común en foros, comentarios y perfiles de usuario.


### - DOM-based XSS

El **XSS basado en DOM**, ocurre cuando el script malicioso se inyecta en el DOM de la página sin intervención del servidor. Esto ocurre cuando la inyección permite la manipulación del DOM del sitio web con datos no confiables del usuario.

### - Blind XSS

El **Blind XSS** este ocurre cuando la carga útil no se refleja directamente los resultados de la explotación del script malicioso en la interfaz de usuario. En lugar de eso, el payload de XSS es almacenado y ejecutado en un contexto diferente.



## Tools
una vez ya comprendiendo los tipos o contextos por los cuales se puede manifestar esta vulnerabilidad, herramientas que utilizaremos en esta primera parte son estas:
- [*Burpsuite*](https://portswigger.net/burp/communitydownload) From Portswigger
- [*Logger ++*](https://portswigger.net/bappstore/470b7057b86f41c396a97903377f3d81) From Portswigger
- [*paramspider*](https://github.com/devanshbatham/ParamSpider) From Github
- [*waymore*](https://github.com/xnl-h4ck3r/waymore) From Github
- [*gf*](https://github.com/tomnomnom/gf) From Github
- [*uro*](https://github.com/s0md3v/uro) From Github
- [*qsreplace*](https://github.com/tomnomnom/qsreplace) From Github
- [*freq*](https://github.com/takshal/freq) From Github
- [*Open Multiple URLS*](https://chromewebstore.google.com/detail/open-multiple-urls/oifijhaokejakekmnjmphonojcfkpbbh) From Extensions Google

La metodología se basa en usar todas las **fingerprints** posibles, para buscar **endpoints** y colectar todos los parámetros reflejados posibles, esto lo haremos con **paramspider** + **waymore**, luego filtraremos con **uro** y **gf**, para posteriormente usar **qsreplace** + **freq** para enviar cargas útiles buscando cuál se refleja, luego pasaremos todas las urls colectadas por **open Múltiple URLS** con el proxy **Burp**,al escuchar todas las peticiones echas a todas las urls, la idea es listar todas las urls que reflejan parámetros en el **Logger++** para luego realizar caza manual o validación manual.

### Collect endpoints

1. Primero seleccionamos el target y colectamos todos los puntos finales haciendo uso de **paramspider** y **waymore**.

---
### Waymore
```bash
#!/bin/bash
waymore -i "target.com" -mode U -url-filename -p 4
```
#### Output

![output waymore](/images/P2/1.png)

### Paramspider
```bash
#!/bin/bash
paramspider -d "target.com"
```
#### Output

![output paramspider](/images/P2/2.png)

---

## Unify endpoints

2. ahora lo que haremos será unificar los outputs.txt, con una simple línea en bash.


```bash
#!/bin/bash
cat paramspiders_output.txt waymore.txt > urls.txt
```

## Oneliner XSS check 

3. En esta linea haremos uso de las tools **gf** + **uro** + **qsreplace** + **freq** , sobre el archivo anteriormente generado *urls.txt*

```bash
#!/bin/bash
cat urls.txt | gf xss | uro | qsreplace '"><img src=X onerror=alert(1);>' | freq | grep "FOUND"
```

![alt text](/images/P2/3.png)

![alt text](/images/P2/4.png)

Aquí concluye una parte de la automatización. Como pueden ver, es bastante útil, pero no es infalible, ya que a veces puede generar falsos positivos. Yo no me desanimo de lo contrario, cuando el parámetro enviado a qsreplace se refleje en freq, pero la carga útil no se refleje, ahi es donde mas me enfoco mas en la caza manual para tratar de explotar todos los parámetros reflejados en busca de XSS y no confiar al 100% en los resultados de freq. Primero, abrimos el proxy Burp, instalamos la extensión Open Múltiple URLs en el navegador y Logger++ en Burp.


## check manual Burpsuite + Logger++ + Open Múltiple Urls

Esta metodología está basada en la revisión manual de 1x1 de todas las urls colectadas y revisión de sus parámetros, se trata de copiar todos los puntos finales recolectados gracias al "fingerprint" de paramspider y waymore o sea las urls.txt, vamos al open múltiple urls y pegamos todas las urls y le damos open.

![alt text](/images/P2/5.png)

me gusta marcar las opciones no cargar hasta abrir la pestaña, cargar en un orden aleatorio e ignorar urls duplicadas, para tener un mejor control y que cuando sean muchas urls no explote el navegador je, je, le damos open urls, ahora veremos todas las peticiones procesadas en el burpsuite y filtraremos por las que reflejan parámetros.

![alt text](/images/P2/6.png)

---
por ejemplo, típico parámetro que se refleja

![alt text](/images/P2/9.png)


Normalmente se comienza por tratar de romper la sintaxis, entonces se envian caracteres especiales como estos

```
'
"
">
\"
```

En esta parte es donde empiezas a construir la carga útil dependiendo de como te response el servidor según lo que le enviaste en el parámetro **reflejado**, puedes hacerlo no muy agresivo pero validando tags HTML como los siguientes

```javascript
<img src=X>
<embed src="X">
<a href="">click me</a>
```

de esta manera pude escapar de ahi
```javascript
XSS?';alert(1)
```

![alt text](/images/P2/10.png)

También puedes usar estas tools online para codificar(**Unicode**, **Hex code**, **HTML code**, **HTML entity**) caracteres especiales por si hay escape o codificación en los parámetros recibidos.



- [*code references*](https://www.toptal.com/designers/htmlarrows/symbols/)
- [*JsFuck*](https://jsfuck.com/)

Es muy importante entender que esta parte manual requiere enfoque en el comportamiento del servidor con los valores de parámetros que estamos enviando, por ejemplo, si se fijan en la siguiente imagen, la carga útil no se reflejó, pero al modificarla según el contexto BOOM explota el punto final.

```javascript
<img src="x"onerror=javascript:alert(document.domain)> // esta no se refleja
<img src="x"onerror=javascriptt:alert(document.domain)> // esta si se refleja
```

![alt text](/images/P2/7.png)

![alt text](/images/P2/8.png)

## Conclusión
Aunque no es un post con técnicas avanzadas ni para expertos, indico las bases o por lo menos como iniciar en la búsqueda de XSS, la combinación de herramientas automatizadas y verificación manual es crucial para identificar y explotar vulnerabilidades XSS de manera efectiva. Aunque la automatización ayuda a ahorrar tiempo y a identificar posibles puntos de inyección, la revisión manual asegura la precisión y la validez de los hallazgos. La seguridad web es un campo dinámico y en constante evolución, por lo que mantenerse actualizado con las últimas técnicas y herramientas es fundamental para cualquier pentester web.