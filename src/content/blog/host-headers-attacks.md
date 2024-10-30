---
title: "Ataques a los headers del host"
description: "En este post hablaremos un poco de los ataques de inyección de encabezados, como extra incluiré una herramienta sencilla que he creado con la intención de automatizar posibles inyecciones de encabezados."
pubDate: "Oct 30 2024"
heroImage: "/images/P4/images/P4/f1.jpg"
postType: "hacking"
tags: 
  - tools
  - host-header-injection
  - bash
---

## Introducción

Las aplicaciones web hoy en día son un componente vital del internet moderno y, como tal, están constantemente amenazadas por una variedad de ataques o técnicas que afecten su funcionamiento.

Uno de estos ataques es el "**Host Header Injection**" o la inyección de encabezado de host, esto permite que un atacante pueda eludir o evadir los controles de seguridad y obtener acceso no autorizado a datos confidenciales o funcionalidades en una aplicación web.
Esta vulnerabilidad está relacionada principalmente con varias categorías de **Common Weakness Enumeration (CWE)**.

[CWE-20: Improper Input Validation](https://cwe.mitre.org/data/definitions/20.html)
<br>
[CWE-74: Injection](https://cwe.mitre.org/data/definitions/74.html)
<br>
[CWE-441: Unintended Proxy or Intermediary](https://cwe.mitre.org/data/definitions/441.html)

En este Post, resumiremos un poco que es la **inyeccion de encabezado de host**, como funciona, como identificarla y como prevenirla.

### ¿Qué es Host Header Injection?

El **Host Header Injection** es un ataque que explota la forma en que los servidores web y las aplicaciones manejan el encabezado de host en las solicitudes HTTP. El encabezado *Host* forma parte del protocolo HTTP/1.1 y se utiliza para especificar el nombre de dominio del servidor (**host virtual**) al que el cliente desea conectarse.

Cuando un cliente envía una solicitud HTTP a un servidor web, incluye un encabezado Host en la solicitud que especifica el nombre de dominio del servidor al que desea conectarse. Por ejemplo, si un usuario escribe "www.example.com" en su navegador, el navegador enviará una solicitud HTTP con el encabezado Host establecido en "www.example.com".

Sin embargo, si un atacante puede **manipular** el encabezado **Host** en la solicitud **HTTP**, puede engañar al servidor web para que piense que la solicitud proviene de un dominio diferente. Esto puede permitirles eludir los controles de seguridad y obtener acceso no autorizado a datos confidenciales o funcionalidades de la aplicación web.

### ¿Cómo funciona la inyección de encabezado de host?

Hay varias formas en que un atacante puede realizar un ataque de inyección de encabezado de host. Estos son algunos métodos comunes:

---
Valor de encabezado de host con formato incorrecto: un atacante puede inyectar un valor de encabezado de host con formato incorrecto en la solicitud HTTP. Por ejemplo, pueden incluir un carácter de nueva línea en el valor del encabezado para crear un nuevo campo de encabezado.

Solicitud HTTP Original:
```
GET /index.html HTTP/1.1
Host: example.com
User-Agent: Mozilla/5.0
```
Solicitud HTTP Modificada por el Atacante:
```
GET /index.html HTTP/1.1
Host: example.com\nX-Injected-Header: evil.com.co
User-Agent: Mozilla/5.0
```

En este ejemplo, el atacante ha incluido un valor de encabezado Host malintencionado con un carácter de nueva línea seguido de un encabezado X-Forwarded-For. Si el servidor web no desinfecta correctamente el valor del encabezado Host, interpretará el encabezado X-Forwarded-For como parte de la solicitud, lo que podría permitir que el atacante inyecte contenido malicioso o robe información confidencial.

---
Varios valores de encabezado de host: un atacante puede inyectar varios valores de encabezado de host en la solicitud HTTP. Por lo general, el servidor web solo leerá el primer valor del encabezado Host, pero algunos servidores también pueden leer los valores posteriores.

Solicitud HTTP Original:
```
GET /index.html HTTP/1.1
Host: example.com
User-Agent: Mozilla/5.0
```
Solicitud HTTP Modificada por el Atacante:
```
GET /index.html HTTP/1.1
Host: example.com, evil.com.co
User-Agent: Mozilla/5.0
```

<br>
o
<br>

Solicitud HTTP Modificada por el Atacante:
```
GET /index.html HTTP/1.1
Host: example.com
Host: evil.com.co
User-Agent: Mozilla/5.0
```
En este ejemplo, el atacante ha suplantado o a sobreescrito el valor del encabezado Host para que parezca que la solicitud procede de un origen de confianza. Si el servidor web no valida correctamente el valor del encabezado Host, puede interpretar la solicitud como legítima y responder en consecuencia, lo que podría permitir que el atacante ejecute un ataque exitoso.

---
Encabezado de host suplantado: un atacante puede suplantar el encabezado de host en la solicitud HTTP para que parezca que la solicitud proviene de un dominio diferente. Por ejemplo, pueden establecer el encabezado Host en un subdominio del dominio de destino.

Solicitud HTTP Original:
```
GET /dashboard HTTP/1.1
Host: example.com
User-Agent: Mozilla/5.0
```

Solicitud HTTP Modificada por el Atacante:
```
GET /dashboard HTTP/1.1
Host: admin.example.com
User-Agent: Mozilla/5.0
```
---

En otro ejemplo el atacante puede incluir encabezados inesperados buscando que el servidor los interprete, si el servidor web no ignora o no esta correctamente configurado para ignorar encabezados no establecidos como por ejemplo X-Forwarded-Host o X-Forwarded-For, los puede interpretar como parte de la peticion, lo que podria permitir que el atacante ejecute un ataque exitoso.

Solicitud HTTP Original:
```
GET /home HTTP/1.1
Host: example.com
User-Agent: Mozilla/5.0
```

Solicitud HTTP modificada por el Atacante:
```
GET /home HTTP/1.1
Host: example.com
X-Forwarded-Host: evil.com.co
X-Forwarded-For: 192.168.1.100
User-Agent: Mozilla/5.0
```
---

### Impacto

Una vez el atacante ha inyectado con exito un valor de encabezado de host malicioso, puede realizar una series de ataques entre ellos estan o se conocen los siguientes:

<ul>
<li>Password reset poisoning</li>
<li>Web cache poisoning</li>
<li>Exploiting classic server-side vulnerabilities</li>
<li>Bypassing authentication </li>
<li>Virtual host brute-forcing</li>
<li>Routing-based SSRF</li>
<li>Connection state attacks</li>
</ul>

**Referencias**
<br>
[https://portswigger.net/web-security/host-header](https://portswigger.net/web-security/host-header)
[https://www.invicti.com/learn/host-header-attacks/](https://www.invicti.com/learn/host-header-attacks/)


### Host Header Checker Tool

Una vez contextualizados sobre el funcionamiento, la explotación y el impacto de la inyección de encabezados de host, he desarrollado un script en Bash que automatiza la búsqueda de servidores web susceptibles a la inyección de encabezados maliciosos en **solicitudes HTTP**. Esta herramienta, a la que he llamado **Host Header Checker**, permite a los usuarios evaluar las respuestas del servidor y determinar si existen configuraciones vulnerables. Aunque es una herramienta sencilla, su utilidad radica en que facilita la evaluación del comportamiento del servidor al recibir encabezados inesperados.

El repo de la tool la pueden encontrar en [Github](https://github.com/bug-sn1p3r/tools/tree/main/host_header_checker)

Esta herramienta que he creado es bastante simple, solo automatiza el envío de encabezados maliciosos vía curl y refleja si el contenido del encabezado malicioso se refleja, lo que permite una identificación rápida de posibles servidores que no están interpretando correctamente encabezados inesperados.

#### ¿Cómo Funciona?

El **Host Header Checker** sigue un enfoque sistemático para evaluar como se comporta un servidor al recibir encabezados inesperados. A continuación, se describen las funciones principales que componen el script:

El script incluye una opción de ayuda accesible con el flag -h, que muestra información sobre el uso y los parámetros disponibles.

Lectura de Dominios:
Utilizando la función read_domains, el script lee los dominios desde un archivo especificado por el usuario. 

Ejecución de Curl:
La función run_curl utiliza **curl** para realizar **solicitudes HTTP** a los dominios. Esta función permite agregar encabezados personalizados para probar diferentes métodos de inyección.

Métodos de Inyección:

El script incluye varios métodos para inyectar encabezados maliciosos, como:
- X-Forwarded-Host
- Forwarded
- X-Forwarded-For
- X-Client-IP
- X-Remote-Addr
- X-Forwarded-Proto
- X-Host

Verificación de Protocolos:
A través de la función check_protocols, el script intenta establecer conexiones HTTPS con los dominios listados y verifica si los encabezados inyectados tienen un efecto en la respuesta del servidor. Si el encabezado malicioso es reflejado, se registra como un hallazgo.

![alt text](/images/P5/image-1.png)


En la imagen anterior logran evidenciar como manifiesta la tool un hallazgo, ademas de una pequeña PoC, recuerden que el evil.com.co lo pueden modificar y poner lo que deseen.



La explotacion la veremos en la Segunda parte del POST pero aca les dejo un ejemplo rapido.

![alt text](/images/P5/image-2.png)

## Conclusión:

Los ataques de host header injection permiten a los atacantes eludir controles de seguridad y acceder a datos confidenciales o funciones no autorizadas en aplicaciones web. Para prevenirlos, es esencial seguir prácticas de codificación segura y configurar el servidor para analizar estrictamente los valores del encabezado de host e ignorar los inesperados.

Validar las entradas del usuario, usar listas blancas, definir explícitamente el valor del encabezado de host, evitar la concatenación de cadenas y utilizar HTTPS reduce significativamente el riesgo de estos ataques.