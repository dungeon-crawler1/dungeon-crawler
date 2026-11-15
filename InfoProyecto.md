Se me ocurrió una idea de un videojuego de navegador. El juego consiste en que el jugador entra en una especie de mazmorra en la que cada habitación es un nivel con eventos aleatorios que van entre enemigos, tesoros, tiendas, etc. Cada habitación tiene un solo evento que se genera aleatoriamente cada vez que se juega, al completar el evento se pasa a la siguiente habitación y se suma un punto a la puntuación final. La puntuación final es la suma de todas las habitaciones que el jugador superó, esta se tiene que guardar en una base de datos y en la página de inicio del juego se muestra un top de los mejores jugadores de todos los que hayan jugado en cualquier momento. La base de datos se puede expandir para poder ver las estadísticas específicas de cada partida en el top (enemigos derrotados, tiempo, monedas ganadas, monedas gastadas, objetos usados, etc) para que todos puedan ver cómo fue cada una de las partidas del top.

Aplicación web de videojuego tipo *Roguelike* interactivo por turnos y eventos procedurales. El jugador selecciona una clase de personaje e ingresa a una mazmorra donde avanza habitación por habitación enfrentando enemigos, recolectando tesoros, comprando en tiendas y tomando decisiones narrativas. Cada habitación superada otorga un punto a la puntuación final. Al finalizar la partida (por derrota o retiro), el resultado se registra en una base de datos centralizada, alimentando una tabla de clasificación global (*Leaderboard*) que permite a cualquier usuario visualizar un desglose detallado y una línea de tiempo paso a paso de las mejores partidas registradas.

1. ### **Sistema de Bifurcación (Elegir Camino)**

2 o 3 puertas con un icono descriptivo después de completar cada habitación:

* **mercader común:** una habitación en la que al tener suficientes monedas se pueden comprar distintos objetos (2 tipos de pociones o frascos uno de estos tiene que ser alguno de curación, un tipo de arma, una reliquia que no se haya obtenido cambiando los tipos cada vez que se le encuentra)  
  * objetos disponibles en esta tienda:  
    * frasco de curación pequeño (regenera 50 de vida al usar): 30 monedas  
    * poción de fuerza pequeña (aumenta todo el daño en un 30% durante el resto de la batalla): 50 monedas  
    * poción de evasión (otorga un 30% de probabilidad de esquivar ataques durante el resto de la batalla): 45 monedas  
    * poción de defensa (reduce el daño recibido en un 40% durante el resto de la batalla): 60 monedas  
    * poción de bloqueo (bloquea los siguientes 2 ataques recibidos en la batalla): 70 monedas  
    * porción media de curación (regenera 80 de vida al usar): 50 monedas  
    * reliquias de esta tienda (cada reliquia es única, al tener todas las reliquias disponibles de el mercader común aparece un cartel diciendo que no hay más objetos para vender en lugar de la reliquia):   
      * imán de oro (aumenta en 30% las monedas conseguidas en combates): 150 monedas  
      * afilador (aumenta el daño en un 15%, no sirve de nada en magos): 120 monedas  
      * bola de cristal (aumenta la cantidad de mana en un 30%, solo funciona en magos): 130 monedas  
      * escudo de acero (disminuye el daño recibido en un 25%): 140 monedas  
      * medalla de mercader (otorga un descuento del 10% en todos los mercaderes): 160 monedas  
      * anillo vampírico (al eliminar un enemigo recupera un 4% de vida): 170 monedas  
      * piedra de la vida (aumenta la vida en un 20%): 125 monedas  
* **combate:** habitación en la que hay un enemigo de nivel medio o varios de bajo nivel  
  * enemigos de nivel medio (los enemigos o enemigo que haya en la habitación se decide aleatoriamente cada vez que se elige entrar en este tipo de habitación):  
    * orco:  
      * vida: 50   
      * daño: 15  
      * monedas soltadas: 30  
      * habilidades especiales: ninguna  
    * esqueleto con armadura:   
      * vida: 40  
      * daño: 10  
      * monedas soltadas: 20  
      * habilidades especiales: ninguna  
    * bandido:  
      * vida: 45  
      * daño: 20  
      * monedas soltadas: 50  
      * habilidades especiales: ninguna  
    * mago corrupto:  
      * vida: 30  
      * daño: 25  
      * monedas soltadas: 40  
      * habilidades especiales: ninguna  
    * elfo malvado:  
      * vida: 35  
      * daño: 20  
      * monedas soltadas: 40  
      * habilidades especiales: ninguna  
  * enemigos de nivel bajo:  
    * duendes (3-4):  
      * vida por duende: 10  
      * daño por duende: 5  
      * monedas soltadas por duende: 10  
      * habilidades especiales: ninguna  
    * slimes (3-5):  
      * vida por slime: 12  
      * daño por slime: 3  
      * monedas soltadas por slime: 5  
      * habilidades especiales: ninguna  
    * esqueletos (4-6):  
      * vida por esqueleto: 5  
      * daño por esqueleto: 5  
      * monedas soltadas por esqueleto: 7  
      * habilidades especiales: ninguna  
    * jabalíes salvajes (2-3):  
      * vida: 15  
      * daño: 8  
      * monedas soltadas: 15  
      * habilidades especiales: ninguna  
* **combate de élite:** habitación en la que hay varios enemigos de nivel medio o hay un enemigo de alto nivel (aparece luego de tener 10 habitaciones superadas, los enemigos o enemigo que haya en la habitación se decide aleatoriamente cada vez que se elige entrar en este tipo de habitación, los ataques especiales son usados por los enemigos un 20% de las veces):  
  * enemigos de nivel medio:  
    * orco (2-3):  
      * vida por orco: 50   
      * daño por orco: 15  
      * monedas soltadas por orco: 30  
      * habilidades especiales: ninguna  
    * esqueleto con armadura (3-4):   
      * vida por esqueleto con armadura: 40  
      * daño por esqueleto con armadura: 10  
      * monedas soltadas por esqueleto con armadura: 20  
      * habilidades especiales: ninguna  
    * bandido (2-3):  
      * vida por bandido: 45  
      * daño por bandido: 20  
      * monedas soltadas por bandido: 50  
      * habilidades especiales: ninguna  
    * mago corrupto (2-4):  
      * vida por mago corrupto: 30  
      * daño por mago corrupto: 25  
      * monedas soltadas por mago corrupto: 40  
      * habilidades especiales: ninguna  
    * elfo malvado (3-5):  
      * vida por elfo malvado: 35  
      * daño por elfo malvado: 20  
      * monedas soltadas por elfo malvado: 40  
      * habilidades especiales: ninguna  
  * enemigos de nivel alto:  
    * armadura maldita  
      * vida: 90  
      * daño: 50  
      * monedas soltadas: 100  
      * habilidades especiales: 10% probabilidad de revivir con un 35% de vida luego de ser derrotado (en caso de tener el anillo vampírico no se regenera vida con este enemigo)  
    * ciclope  
      * vida: 80  
      * daño: 60  
      * monedas soltadas: 100  
      * habilidades especiales: 15% de probabilidad de ser aturdido al recibir un ataque de este enemigo  
    * arbol viviente  
      * vida: 100  
      * daño: 40  
      * monedas soltadas: 120  
      * habilidades especiales: 15% de probabilidad de que un ataque golpee 2 veces  
    * piromano loco  
      * vida: 50  
      * daño: 75  
      * monedas soltadas: 110  
      * habilidades especiales: 5% de probabilidad de hacer un ataque kamikaze (haciendo que el enemigo muera) que causa un 50% más de daño   
    * demonio  
      * vida: 70  
      * daño: 55  
      * monedas soltadas: 105  
      * habilidades especiales: probabilidad de 25% de atacar con un golpe crítico el cual causa 30% más daño al jugador  
    * espíritu perdido  
      * vida: 60  
      * daño: 45  
      * monedas soltadas: 95  
      * habilidades especiales: probabilidad de 30% de no recibir daño al recibir un ataque  
* **jefe:** habitación en la que hay un jefe especial (solo disponible luego de tener más de 20 habitaciones superadas, aparecen cada 10 habitaciones superadas después de eso, al derrotar un jefe este no vuelve a aparecer y al derrotarlos todos deja de aparecer la habitación de jefe, los ataques especiales son usados por los enemigos un 30% de las veces y es anunciado por el visor de eventos, las habilidades especiales son habilidades pasivas que tienen los jefes, las recompensas adicionales que sueltan los jefes son reliquias especiales, al derrotar el primer jefe las estadísticas de todos los enemigos aumentan en un 20% de su valor inicial y si están derrotados todos los jefes aumenta cada 10 habitaciones superadas):  
    
  * jefes disponibles:  
    * dragon:   
      * vida: 400  
      * daño: 140  
      * ataques especiales: lanza fuego y provoca 10% del daño del ataque normal del dragón al jugador por 5 turnos (no se acumula)  
      * monedas soltadas: 600  
      * recompensas adicionales: capa de piel de dragón (disminuye el daño recibido en un 50%)  
      * habilidades especiales: recibe un 30% menos de daño por la dureza de su piel  
    * emperador caído:   
      * vida: 350  
      * daño: 160  
      * ataques especiales: avanza rápidamente y ataca 2 veces en el mismo turno provocando el doble de daño  
      * monedas soltadas: 700  
      * recompensas adicionales: espada del emperador (al atacar hay un 65% de probabilidades de golpear 2 veces)  
      * habilidades especiales: 35% de probabilidad de esquivar los ataques del jugador  
    * criatura mutante gigante:   
      * vida: 450  
      * daño: 130  
      * ataques especiales: escupe ácido y causa un 15% del daño del ataque normal de la criatura mutante gigante al jugador por 4 turnos (no acumulable)  
      * monedas soltadas: 550  
      * recompensas adicionales: viseras ácidas (envenena tus armas y causa un aumento del daño de un 50%)  
      * habilidades especiales: cuando tiene menos de 30% de la vida todos sus ataques aplican ácido  
    * robot enorme descontrolado:   
      * vida: 550  
      * daño: 100  
      * ataques especiales: carga un ataque eléctrico que en el siguiente turno provoca un 200% de daño (cooldown de 3 turnos)  
      * monedas soltadas: 650  
      * recompensas adicionales: dispositivo de shock (al golpear hay un 40% de probabilidades de stunear al rival por un turno)  
      * habilidades especiales: cuando tiene menos del 50% de la vida se enoja y su ataque especial se hace en el mismo turno  
    * titan esquelético:   
      * vida: 500  
      * daño: 120  
      * ataques especiales: golpea el suelo haciendo que caigan rocas sobre el jugador causando 50 de daño 3-5 veces en un turno   
      * monedas soltadas: 800  
      * recompensas adicionales: mazo de hueso de titan (1 vez cada 3 turnos permite hacer un ataque especial que hace que además del golpe caigan rocas que hacen 30 de daño 2-4 veces)  
      * habilidades especiales: al hacer un ataque normal hay un 20% de probabilidades de stunear al jugador  
    * drácula:   
      * vida:  400  
      * daño: 130  
      * ataques especiales: te chupa la sangre y regenera el 100% del daño que te hace en su vida  
      * monedas soltadas: 500  
      * recompensas adicionales: vampirismo completo (al eliminar un enemigo en el primer turno del combate se suma la cantidad de vida de ese enemigo en vida del jugador, en caso de que sea el 2do turno se suma la mitad de la vida, en caso de que sea el 3er turno se suma un cuarto, y así indefinidamente)   
      * habilidades especiales: regenera un 40% de todo el daño que inflige   
* **fuente de los deseos:** fuente en la que se puede soltar una moneda con un 5% de que se te otorgue un buff permanente:  
  * buffs otorgados por la fuente:  
    * aumento del 30% de la vida del jugador  
    * aumento del 40% de todo el daño  
    * disminuye en 20% todo el daño recibido  
    * disminuye el precio de todos los mercaderes en un 20%   
* **estatua sagrada:** habitación en la que hay 1 o 2 estatuas que dan habilidades específicas solo si sos de la clase indicada (solo se puede activar una vez por partida):  
  * estatuas disponibles:  
    * estatua real (caballero): en vez de recibir 20% menos de daño recibe 40% menos de daño  
    * estatua barbarica (bárbaro): el efecto del aumento de daño está siempre activo  
    * estatua escurridiza (pícaro): en vez de 20% de probabilidades de esquivar ataques y 25% más monedas son 30% de probabilidad de esquivar ataques y 40% más monedas  
    * estatua mágica (mago): el costo de todos los hechizos se reduce a la mitad  
* **sala misteriosa:** habitación que puede ser cualquiera de las otras habitaciones según las restricciones de progreso de cada habitación (no puede ser jefe hasta tener 20 habitaciones superadas)  
* **sala de ayuda:** habitación de descanso o para obtener buffs pequeños variados  
  * tipo de habitaciones:  
    * hoguera: descansa y regenera 20 puntos de vida  
    * cabaña acogedora: descansa y regenera 40 puntos de vida   
    * estanque mágico: solo a los magos regenera 30 puntos de maná  
    * comedor: paga 15 monedas para regenerar 40 puntos de vida  
* **mercader de lujo:** habitacion con un mercader que vende mejores objetos por un precio más elevado (aparece luego de tener más de 10 habitaciones superadas, vende 2 tipos de pociones o frascos uno de estos tiene que ser de curación, un tipo de arma y una reliquia que no se haya obtenido diferentes cada vez que se le encuentra):   
  * objetos vendidos por este mercader:  
    * poción grande de curación (regenera toda la vida restante): 80 monedas  
    * super pocion de fuerza (aumenta todo el daño infligido en un 50% durante la batalla): 100  
    * super pocion de defensa (reduce el daño recibido en un 60% durante la batalla): 110  
    * super pocion de evasión (otorga un 40% de posibilidades de esquivar ataques durante la batalla): 90  
    * super pocion de bloqueo (bloques por completo los siguientes 3 ataques recibidos en la batalla): 100  
    * poción de escape (sale de la habitación hacia atrás para volver a elegir la habitación): 130  
    * reliquias avanzadas (cada reliquia es única, al tener todas las reliquias disponibles de el mercader de lujo aparece un cartel diciendo que no hay más objetos para vender en lugar de la reliquia):  
      * mano de midas (aumenta en un 50% las monedas obtenidas): 500 monedas  
      * esencia vampírica (aumenta la vida máxima en un 5% por cada enemigo derrotado): 550 monedas  
      * bendición del atacante (aumenta todo el daño infligido en un 40%): 520 monedas  
      * casco del emperador (disminuye el daño recibido en un 40%): 470 monedas  
      * capa de merlin (aumenta el mana máximo en un 50%): 450 monedas  
      * emblema del mercader (disminuye el precio de todos los mercaderes un 30%): 600 monedas  
      * telescopio trans físico (permite ver qué habitación en específico hay para escoger antes de escogerla, ej: en caso de un combate se puede ver que tipo de enemigo y que cantidad hay, en caso de una estatua se puede ver que tipo de estatua es, etc): 650 monedas  
      * sangre del berserker (el daño infligido en el primer turno es 50% mayor): 550 monedas  
* **sala del tesoro:** habitación con un cofre en el que pueden haber distintos objetos  
  * reliquias: las que se venden en el mercader común   
  * pociones: las que se venden en el mercader común  
  * monedas 60-120

2. ### **Clases de Personajes**

Permitir al jugador elegir una clase antes de iniciar la partida (*Run*):

* **Caballero:**  
  * vida: 150  
  * daño: 40  
  * habilidades especiales: recibe un 20% menos de daño, 20% de probabilidad de bloquear ataques   
* **Bárbaro**:  
  * vida: 120  
  * daño: 60  
  * habilidades especiales: al tener menos del 50% de vida aumenta todo el daño en un 40%  
* **Pícaro:**   
  * vida: 100  
  * daño: 50  
  * habilidades especiales: gana 25% más monedas, 20% probabilidad de esquivar ataques  
* **Mago:**   
  * vida: 80  
  * daño: 70  
  * habilidades especiales: tiene la capacidad de usar el maná para lanzar distintos hechizos.  
  * hechizos disponibles:   
    * bola de fuego (cantidad media de daño) 30 mana  
    * escape (escapa de la batalla a la habitación anterior sin perder puntuación para volver a elegir tu camino) 60 mana  
    * evasión (otorga 40% de evasión por 3 turnos) 30 mana  
    * escudo (otorga inmunidad durante 2 ataques recibidos) 40 mana  
    * rayo (alto daño) 55 maná  
    * fuerza (aumenta el daño en un 30% durante 5 turnos) 40 mana

3. ### **"Línea de Tiempo" Interactiva y Top de Jugadores**

   En el menú principal antes de empezar la partida va a haber un top global (primeras 10\) de todas las partidas jugadas en las cuales van a estar todas las estadísticas de cada una de esas partidas jugadas, también va a tener un apartado en el que se vean las mejores 10 partidas del usuario para poder compararlas con el top global.   
   Se va a poder entrar a una especie de ventanita emergente al tocar cualquiera de las partidas ya sea en el top global o en el top del usuario para ver las estadísticas exactas de esa partida (lista expandible de todas las habitaciones superadas una por una, cantidad de daño infligido, cantidad de daño recibido, cantidad de enemigos derrotados, lista de las reliquias en posesión, cantidad de monedas obtenidas, cantidad de monedas gastadas, cantidad de monedas finales, lista de jefes derrotados, y otros datos importantes).

## **🛠️ Flujo de Trabajo Obligatorio para el Proyecto**

Para mantener el proyecto en regla según las exigencias académicas, sigan este orden estricto:

1. **Aprobación Inicial:** Presenten esta idea al profesor para que valide el objetivo general.  
2. **Documento de Definición (`PROYECTO.md`):** Escriban los límites (qué entra y qué no), alcances funcionales/no funcionales y objetivos medibles.  
3. **Diseño de Issues:** En GitHub/GitLab creen las tareas ordenadas con dependencias y criterios de aceptación claros.  
4. **Git & Pull Requests:** Prohibido el push directo a `main`. Usen ramas asociadas a issues, mensajes con *Conventional Commits* (ej: `feat(game): agregar evento de tienda`) y esperen la aprobación del profesor en cada Pull Request.

