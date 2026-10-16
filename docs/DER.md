# Diagrama Entidad-Relación (DER) - Videojuego Roguelike

Este documento define la estructura de las tablas del sistema para el almacenamiento de usuarios, partidas (runs), reliquias y la línea de tiempo interactiva.

```mermaid
erDiagram
    USUARIOS ||--o{ PARTIDAS : "realiza (1:N)"
    PARTIDAS ||--o{ RELIQUIAS_PARTIDA : "obtiene (1:N)"
    PARTIDAS ||--o{ HABITACIONES_PARTIDA : "registra (1:N)"

    USUARIOS {
        int id PK "Identificador único auto-incremental"
        string username UK "Nombre de usuario único"
        string email UK "Correo electrónico único"
        string password_hash "Contraseña encriptada con bcrypt"
        timestamp fecha_registro "Fecha de creación del usuario"
    }

    PARTIDAS {
        int id PK "Identificador único de la partida"
        int usuario_id FK "Relación con el usuario"
        string clase "Clase elegida (Caballero, Bárbaro, Pícaro, Mago)"
        int puntuacion "Puntos totales (habitaciones superadas)"
        int duracion_segundos "Tiempo total jugado"
        int monedas_obtenidas "Monedas recolectadas"
        int monedas_gastadas "Monedas gastadas"
        int danio_infligido "Daño infligido total"
        int danio_recibido "Daño recibido total"
        int enemigos_derrotados "Enemigos normales o élite derrotados"
        int jefes_derrotados "Jefes finales derrotados"
        string resultado "Estado final ('DERROTA' o 'RETIRO')"
        timestamp fecha_partida "Estampa de tiempo del juego"
    }

    RELIQUIAS_PARTIDA {
        int id PK "Identificador de la reliquia obtenida"
        int partida_id FK "Relación con la partida"
        string nombre_reliquia "Nombre de la reliquia"
        string efecto "Efecto o ventaja otorgada"
        int habitacion_obtenida "Número de habitación en la que se compró/obtuvo"
    }

    HABITACIONES_PARTIDA {
        int id PK "Identificador del evento"
        int partida_id FK "Relación con la partida"
        int numero_habitacion "Orden correlativo de la habitación"
        string tipo_evento "Tipo de habitación"
        jsonb detalle_evento "Detalles técnicos guardados en formato JSONB"
        string resultado "Resultado de la habitación"
        timestamp registrado_en "Estampa de tiempo"
    }