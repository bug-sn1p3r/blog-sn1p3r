---
title: "Casual bugs #1"
description: "En este post, compartiré algunos bugs que he encontrado de manera inesperada y fortuita. La intención es demostrar que las vulnerabilidades pueden estar en cualquier lugar; solo necesitas saber cómo buscarlas o quizás un poco de suerte."
pubDate: "Sept 02 2024"
heroImage: "/images/P4/images/P4/f1.jpg"
postType: "bugbounty"
tags: 
  - bugbounty
  - XSS-DOM
  - sessions
  - HTML-injection
---

# Casual bugs

¡Saludos a todos los lectores! Sé que los he tenido un poco abandonados últimamente, pero he estado ocupado con temas laborales y numerosos viajes relacionados con mi trabajo. Antes de continuar quiero aclarar que me gusta cazar en programas BBP y VDP, asi que no vengas a llorar sobre eso, Ahora, vayamos al grano. Los bugs que voy a exponer en este post ya han sido reportados y corregidos en programas como *Bugcrowd*, *HackerOne*, e *Intigriti*. La razón de este post es compartir las experiencias que me han dado conocimiento diario y han fortalecido mis habilidades para encontrar bugs de distintos tipos, riesgos y naturaleza.

## Bug #1 *Insufficient Session Expiration*

- Target - The coca Cola company
- Type - VDP
- Bounty - NA
- Status - Resuelto

En uno de mis proyectos recientes, mientras realizaba una auditoría de seguridad utilizando técnicas de RECON que he descrito en publicaciones anteriores, encontré un subdominio interesante: redacted.coca-cola.com. Siguiendo mi metodología habitual, comencé con un reconocimiento superficial, buscando configuraciones incorrectas, examinando archivos JavaScript, y validando inputs. Sin embargo, no encontré nada destacable en ese momento.


Para ampliar mi investigación, decidí explorar la estructura histórica del subdominio utilizando la Wayback Machine. Al revisar los registros archivados, encontré una URL peculiar: redacted.coca-cola.com/ads/visitar/MD5-HASH. Aunque al principio no parecía ser nada fuera de lo común, decidí investigarla más a fondo. Para mi sorpresa, al acceder a ese enlace, descubrí una grave vulnerabilidad: Insufficient Session Expiration.

Impacto:

Esta vulnerabilidad presentaba tres riesgos críticos: **secuestro de sesión**, **acceso no autorizado**, y **exposición de datos sensibles**. Un atacante podría utilizar sesiones que no caducaban correctamente para acceder a información sensible de los clientes, incluyendo nombres, apellidos, números de teléfono, direcciones de correo electrónico y fechas de nacimiento. Estos riesgos comprometían gravemente la privacidad y seguridad de los usuarios en la plataforma.

![alt text](/images/P4/image-1.png)

Para validar el alcance del problema, filtré todos los registros que coincidían con el patrón /ads/visitar/, identificando un total de 544 posibles sesiones. De estas, logré confirmar 103 sesiones activas. Esta evidencia fue suficiente para proceder con el reporte de la vulnerabilidad.

![alt text](/images/P4/image-2.png)


Inicialmente, la vulnerabilidad fue marcada como P3 en *Bugcrowd* y se reportó como solucionada:
![alt text](/images/P4/image-3.png)

Sin embargo, al verificar, noté que el problema no había sido resuelto adecuadamente:
![alt text](/images/P4/image-4.png)

Lamentablemente, el programa cerró en *Bugcrowd* antes de que pudiera seguir investigando, por lo que decidí reportar la vulnerabilidad en *Intigriti*, donde recibió una calificación de 9.1. A pesar de la gravedad, fue marcada como duplicado:
![alt text](/images/P4/image-5.png)


Este caso demuestra que incluso los bugs más sutiles y "casuales" pueden tener un impacto significativo en la seguridad de una plataforma. Nunca subestimes la importancia de investigar y validar cada hallazgo. La persistencia y el análisis detallado son esenciales en el proceso de caza de bugs, ya que una vulnerabilidad aparentemente menor puede tener consecuencias serias si no se aborda correctamente.


## Bug #2 *Html Injection via email reset password*

- Target - Hilton 
- Type - BBP
- Bounty - NA
- Status - Duplicado

Mientras exploraba los puntos finales de autenticación y los formularios de registro de usuarios en una auditoría de seguridad para Hilton, me encontré con una vulnerabilidad interesante en la funcionalidad de restablecimiento de contraseña. Después de varios intentos y la creación de algunas cuentas de prueba, noté un comportamiento inusual al utilizar dos direcciones de correo electrónico en el campo de restablecimiento de contraseña, por ejemplo: "corre1@test.com,victim@test.com". Sorprendentemente, el sistema envió correos electrónicos de restablecimiento a ambas direcciones, lo que me llevó a investigar más a fondo.

Aunque inicialmente no logré un Account Takeover (ATO) debido a que cada destinatario recibía un token de restablecimiento distinto, descubrí otro vector de ataque preocupante: una posible **inyección HTML** en el campo "name" del formulario.


Para comprobar esta vulnerabilidad, diseñé una carga útil HTML simple:
```html
click this ->> <a href="evil.com">click Here!!!</a>
```

Esta carga útil fue inyectada en el campo "name", resultando en un correo electrónico que se veía así:

![alt text](/images/P4/image-6.png)

Tras ejecutar la función de restablecimiento de contraseña, ambos destinatarios recibieron un correo electrónico con la inyección HTML exitosa, lo que demuestra la viabilidad del ataque:


![alt text](/images/P4/image-7.png)

Impacto:

Este bug permite que un atacante manipule el contenido de los correos electrónicos enviados por Hilton, otorgando la posibilidad de construir mensajes de correo electrónico más elaborados y convincentes. Un atacante podría insertar enlaces maliciosos que redirijan a sitios diseñados para capturar credenciales de usuarios, lo que representa un riesgo significativo para la seguridad. Dado que el correo proviene de una dirección oficial de Hilton, la apariencia de legitimidad se ve reforzada, aumentando la probabilidad de que los usuarios caigan en la trampa. Esta vulnerabilidad subraya la importancia de validar y sanitizar adecuadamente los inputs en todas las interacciones de usuario, especialmente en funcionalidades críticas como el restablecimiento de contraseñas.


## Bug #3 *XSS DOM Based via elementor CVE-2022-29455*

- Target - redacted 
- Type - VDP
- Bounty - NA
- Status - Pendiente por definir

Recientemente, descubrí dos vulnerabilidades de **XSS basadas en DOM** a través del **CVE-2022-29455** en el plugin de builder de páginas *Elementor*. Esta vulnerabilidad permite la inyección de código JavaScript malicioso, lo que podría ser explotado por atacantes.

Todo comenzó como de costumbre, revisando la *hacktivity* para mantenerme motivado. Accidentalmente, terminé en el menú de "CVE Discovery". Como saben, soy una aficionada del **XSS**, así que filtré los resultados y me llamó la atención el **CVE-2022-29455**, que afecta a sitios de *WordPress* utilizando *Elementor*. Rápidamente busqué un PoC (Proof of Concept) en línea y creé un dork personalizado para identificar esta vulnerabilidad en mis anteriores procesos de RECON.


Utilicé la siguiente expresión para buscar en mis antiguos registros:

```bash
cat */*.txt | grep -a "elementor" | grep -aE 'frontend\.min\.js\?ver=3\.(0\.[0-9]+|1\.[0-9]+|2\.[0-9]+|3\.[0-9]+|4\.[0-9]+|5\.[0-5])'
```

![alt text](/images/P4/image-14.png)

Encontré dos posibles coincidencias. Al probarlas con una carga útil, la vulnerabilidad se manifestó en los plugins afectados.

Payload

```
#elementor-action:action=lightbox&settings=eyJ0eXBlIjoibnVsbCIsImh0bWwiOiI8c2NyaXB0PmFsZXJ0KGRvY3VtZW50LmRvbWFpbik8L3NjcmlwdD4ifQo=
```

![alt text](/images/P4/image-13.png)

Ambos casos fueron reportados de inmediato:

![alt text](/images/P4/image-11.png) ![alt text](/images/P4/image-12.png)

este fue uno de los encuentros mas randoms que tuve ya que no esperaba que estuvieran tan faciles de explotarlos, esto reafirma la importancia de estar al tanto de las vulnerabilidades conocidas y cómo incluso CVEs aparentemente pasados por alto pueden ser explotados con éxito.