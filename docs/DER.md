erDiagram
    USUARIOS ||--o{ PARTIDAS : "realiza (1:N)"
    PARTIDAS ||--o{ RELIQUIAS_PARTIDA : "obtiene (1:N)"
    PARTIDAS ||--o{ HABITACIONES_PARTIDA : "registra (1:N)"

    USUARIOS {
        int id PK "Identificador único de usuario"
        string username UK "Nombre único de usuario"
        string email UK "Correo electrónico único"
        string password_hash "Contraseña encriptada con bcrypt"
        timestamp fecha_registro "Fecha de alta"
    }

    PARTIDAS {
        int id PK "Identificador único de la partida"
        int usuario_id FK "Usuario que jugó la partida"
        string clase "Clase elegida (Caballero, Bárbaro, Pícaro, Mago)"
        int puntuacion "Cantidad de habitaciones superadas"
        int duracion_segundos "Tiempo total jugado"
        int monedas_obtenidas "Monedas ganadas"
        int monedas_gastadas "Monedas gastadas en tiendas"
        int danio_infligido "Daño total causado"
        int danio_recibido "Daño total recibido"
        int enemigos_derrotados "Enemigos comunes/élite derrotados"
        int jefes_derrotados "Jefes finales derrotados"
        string resultado "Resultado final (DERROTA o RETIRO)"
        timestamp fecha_partida "Fecha y hora de la partida"
    }

    RELIQUIAS_PARTIDA {
        int id PK "Identificador de la reliquia obtenida"
        int partida_id FK "Partida asociada"
        string nombre_reliquia "Nombre único de la reliquia"
        string efecto "Efecto o ventaja otorgada"
        int habitacion_obtenida "Número de habitación en la que se obtuvo"
    }

    HABITACIONES_PARTIDA {
        int id PK "Identificador del paso"
        int partida_id FK "Partida asociada"
        int numero_habitacion "Orden de la habitación (1, 2, 3...)"
        string tipo_evento "Tipo (combate, mercader, fuente_deseos, estatua, etc.)"
        jsonb detalle_evento "Metadatos detallados en formato JSONB"
        string resultado "Resultado del evento (ej: completado, victoria, huyó)"
        timestamp registrado_en "Estampa de tiempo del evento"
    }