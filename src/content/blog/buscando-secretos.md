---
title: "Dorking, Fingerprints y mas Técnicas para Encontrar Información Sensible #1"
description: "En este Post quiero enseñar un poco de los métodos que utilizo para buscar secretos o credenciales, usando desde el google Dorking, hasta herramientas para colectar todo de los crawlers y tener mas posibilidad de éxito."
pubDate: "Jun 22 2024"
heroImage: "/images/P3/place-holder.jpg"
postType: "osint"
tags: 
  - osint
  - dorking
  - fingerprints
  - waymore
  - gau
---

# Buscando secretos y credenciales

Hoy en día los desarrolladores y las empresas de desarrollo deben luchar día a día con la cantidad cada vez mayor de datos confidenciales, los que conocemos como secretos, *tokens*, *APIkeys*, *certificados de seguridad* o *credenciales*, ademas de variables de entorno y otro tipo de información sensible que no puedes exponer libremente o por lo menos no hacerla fácil de encontrar, ya que los atacantes puede utilizar esa información.


En este post quiero enseñar un poco de los métodos que utilizo para buscar secretos o credenciales. La búsqueda de secretos y credenciales es una técnica vital en el **BugBounty**, esto nos permite a los investigadores encontrar *información sensible* para demostrar que puede ser utilizada por atacantes o por lo menos tomarlo como un punto inicial en el **reporte de vulnerabilidades** en sistemas y servicios. A continuación, un pequeño repaso de las herramientas que utilizaremos en este post.

## Herramientas y Métodos

### Google Dorking

El **Dorking** es una técnica que consiste en utilizar motores de búsqueda para encontrar información específica que no está adecuadamente protegida. Los motores de búsqueda, como *Google*, permiten utilizar operadores avanzados para refinar las búsquedas y encontrar archivos que contienen información sensible.

#### Operadores Comunes:
- `filetype:`,`ext`: Busca archivos de un tipo de formato específico. Ejemplo: `filetype:env` o `ext:env`
- `inurl:`: Busca una palabra específica en la URL. Ejemplo: `inurl:"/conf"`
- `intitle:`: Busca una palabra específica en el título de la página. Ejemplo: `intitle:"index of"`
  
Aquí unas cuantas dorks de las que mas utilizo en estos casos: 

- buscamos files .log: 
> ```site:target.com ext:log```

![alt text](/images/P3/log1.png)

![alt text](/images/P3/log2.png)

normalmente estos contienen rutas, variables de entorno, información del SO y otros detalles que pueden ser relevantes.

- buscamos todo tipo de posibles files de backups: 
> ```site:target.com ext:bkf | ext:bkp | ext:bak | ext:old | ext:backup```

![alt text](/images/P3/bak1.png)
![alt text](/images/P3/bak2.png)
![alt text](/images/P3/bak3.png)

esta búsqueda es especial por que te puedes encontrar desde *backups completos*, hasta archivos de *configuración antiguos*, *copias parciales de dbs*, estructuras y *esquemas de dbs*, *código fuente*, etc.

- buscando phpinfo exposed
> ```ext:php intitle:phpinfo 'published by the PHP Group```

![alt text](/images/P3/phpinfo.png)

![alt text](/images/P3/phpinfo3.png)

aunque para muchos el phpinfo no representa un peligro, hay organizaciones que se toman el mas mínimo dato expuesto muy enserio por ejemplo este encuentro reciente.

![alt text](/images/P3/phpinfo2.png)

esto permite extraer detalles sobre la configuración del PHP, version exacta del SO, ip internas, variables de entorno del servidor.

- buscando buckets
> ```site:atlassian.net | site:bitbucket.org "target.com"```
> ```site:.s3.amazonaws.com "target.com"```

- buscando users, passwords, host de conexiones, db_passwd.

> ```ext:txt | ext:php intext:"password:" site:"target.com" -robots```
> ```ext:txt | ext:php intext:"username:" site:"target.com" -robots```

> ```ext:php | ext:txt intext:"DB_HOST:"```

> ```ext:php | ext:txt intext:"DB_HOST ="```

![alt text](/images/P3/pwd_php.png)

![alt text](/images/P3/pwd_php2.png)

inclusive una de las anteriores me ayudo a encontrar un LFI.

![alt text](/images/P3/pwd_php3.png)


- También puedes usar esta para buscar archivos de configuración.

> ```site:target.com ext:xml | ext:conf | ext:cnf | ext:reg | ext:inf | ext:rdp | ext:cfg | ext:txt | ext:ora | ext:ini```

Todas estas dorks anteriores tienen mas éxito cuando la vas construyendo según el contexto y lo que necesites, ademas del tipo de objetivo.

### creando dork según contexto

#### Archivos .env

Los archivos `.env` contienen variables de entorno, que a menudo incluyen credenciales de bases de datos, tokens de API, y otros secretos. Un ejemplo de búsqueda para este tipo de archivo podría ser: `filetype:env "DB_PASSWORD"`

#### Configuración JSON

Los archivos JSON de configuración (`config.json`, `appsettings.json`, etc.) a menudo contienen parámetros de configuración que pueden incluir credenciales. Un ejemplo de búsqueda sería: `filetype:json "api_key"`


## Tools
Herramientas que utilizaremos en este post

- [*httpx*](https://github.com/projectdiscovery/httpx) From Github
- [*waymore*](https://github.com/xnl-h4ck3r/waymore) From Github
- [*gau*](https://github.com/lc/gau) From Github
- [*hakrawler*](https://github.com/hakluke/hakrawler) From Github
- [*gf*](https://github.com/tomnomnom/gf) From Github
- [*uro*](https://github.com/s0md3v/uro) From Github
- [*TruffleHog*](https://chromewebstore.google.com/detail/trufflehog/bafhdnhjnlcdbjcdcnafhdcphhnfnhjc) From Extensions google


La metodología se basa en recolectar todas las **fingerprints** con **waymore** + **hakrawler** + **gau**, para luego usar expresiones regulares **gf** y filtrar con los nombres de archivo a buscar con posible data sensible, para tratar de usarla y escalar de un simple exposed a algo mas.


### Waymore

Waymore es una herramienta que automatiza la búsqueda de URLs en la Wayback Machine. Esta herramienta permite encontrar versiones antiguas de un sitio web o todo el contenido encontrado por los crawlers, que a menudo contienen información sensible que ha sido eliminada o modificada en versiones más recientes.

```bash
waymore -i $domain -mode U -oU ./waymoreUrls.txt -url-filename -p 4
# -i = dominio o lista de dominios .txt
# -mode U = solo recibir URLs
# -oU = salida 
# -url-filename = salida en nombres de archivo
# -p 4 = cantidad de hilos en este caso 4 para mas agilidad
```

### Generalized Asset URL (GAU)

GAU es una herramienta que recopila URLs de múltiples fuentes, incluyendo la Wayback Machine, Common Crawl, y otros servicios de archivo. Esta herramienta es especialmente útil para encontrar endpoints de API y otros recursos que pueden contener credenciales o secretos.

### Hakrawler

Hakrawler es una herramienta diseñada para la recolección rápida de URLs y subdominios de una aplicación web. Es útil para mapear la superficie de ataque de una aplicación y descubrir recursos que podrían contener información sensible.

```bash
echo $domain | (gau || hakrawler) | grep -Ev "\.(jpeg|jpg|png|ico|woff|svg|css|ico|woff|ttf)$" > ./gaukrawler.txt
#aqui lo que hago es unir en un doble pipe (gau || hakrawler)
#grep -Ev "extensions" = con esto excluyo ese tipo de archivos, por que para esta búsqueda me parece irrelevante
```

Puedes unir todo lo anterior con lo siguiente

```bash
cat ./waymoreUrls.txt ./gaukrawler.txt | sort -u | uro > allUrls.txt
#unificamos con sort + uro
```

## Archivos de Configuración Comunes

Al buscar secretos y credenciales, es fundamental enfocarse en ciertos archivos de configuración que comúnmente contienen esta información. Algunos de los más comunes son:

- *JavaScript*: `app.js`, `config.js`, `dev.js`
- *Archivos de Entorno*: `.env`
- *JSON*: `default.json`, `config.json`, `appsettings.json`, `credentials.json`
- *PHP*: `config.php`
- *XML*: `config.xml`
- *YAML*: `config.yml`, `.travis.yml`, `docker-compose.yml`, `secrets.yml`
- *TypeScript*: `environment.ts`

Una vez entendido este método empezamos a ejecutar la búsqueda de los archivos, lo haremos buscando estos nombres de archivos en toda las urls colectadas anteriormente allUrls.txt, para luego validar cual esta activa y online.

```bash
cat allUrls.txt | grep "config\.js" | sort -u | uro | httpx -sc -title -mc 200
#grep = filter
# sort + uro = unificar
# httpx = -status-code -title -mc 200 , realizamos petición para validar que esta online con status code 200
```

![alt text](/images/P3/image-3.png)

![alt text](/images/P3/image-1.png)

![alt text](/images/P3/image-2.png)

![alt text](/images/P3/image.png)

También he encontrado cositas en env.js

```bash
cat allUrls.txt | grep "env\.js" |sort -u | uro| httpx -sc -title -mc 200
```
![alt text](/images/P3/env.png)

![alt text](/images/P3/env2.png)

![alt text](/images/P3/env3.png)



### TruffleHog Extension

La extensión de Chrome TruffleHog busca claves API y credenciales en los sitios web visitados, y te avisa si hay alguna presente. Esto resulta útil para realizar pentesting web y revisiones de código, ya que ayuda a identificar claves que, de otro modo, se pasarían por alto o habría que buscar manualmente.


## Escalado Horizontal y Vertical

Una vez que se han descubierto credenciales, puntos finales, rutas, variables de entorno y demás datos relevantes, el siguiente paso es utilizarlas para realizar un escalado horizontal o vertical, esto lo veremos en la parte #2 de buscando secretos.

## Conclusión

La búsqueda de secretos y credenciales es una habilidad esencial para cualquier cazador de bugs. Utilizando técnicas como el Dorking y herramientas OSINT como Waymore, GAU, y Hakrawler, es posible descubrir información sensible que puede ser utilizada para comprometer sistemas. Además, comprender cómo realizar un escalado horizontal y vertical es crucial para maximizar el impacto de la información descubierta. Espero que este post te haya proporcionado una visión clara de los métodos y del uso de unas cuantas herramientas que utilizo en mis investigaciones. ¡Feliz Hacking! Bugbounty Researchs

