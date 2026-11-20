export interface ActivityRuleItem {
  label: string;
  value: string;
}

export interface ActivityGuide {
  summary: string;
  items: ActivityRuleItem[];
}

export const ACTIVITY_GUIDES: Record<string, ActivityGuide> = {
  valorant: {
    summary: 'Eliminación directa por equipos en partidas personalizadas Swiftplay.',
    items: [
      {
        label: 'Cómo se juega',
        value: 'Equipos de 4 jugadores (pueden mezclar carreras). Se juega 5v5 solo si hay 3 equipos completos de 5.',
      },
      {
        label: 'Cupos máximos',
        value: '4 equipos en 4v4 (16 jugadores) o 3 equipos en 5v5 (15 jugadores). Excedentes pasan a lista de espera.',
      },
      {
        label: 'Formato de partida',
        value: 'Swiftplay personalizada: gana quien llegue primero a 5 rondas. Cada serie es al mejor de 3 partidas.',
      },
      {
        label: 'Cuadro',
        value: '2 equipos: una serie. 3 equipos: uno pasa a la final por sorteo y los otros juegan semifinal. 4 equipos: 2 semis, final y 3.º lugar.',
      },
      {
        label: 'Salas y control',
        value: 'Cada equipo juega en una sala distinta para que el rival no escuche. Un integrante del staff entra como observador.',
      },
      {
        label: 'Llegada y premio',
        value: 'Todo el equipo listo 10 min antes o pierde por W.O. El equipo ganador decide cómo repartir el premio (mini 1v1 o acuerdo).',
      },
    ],
  },
  'rocket-league': {
    summary: 'Fútbol con autos en formato 2 contra 2 con duplas fijas durante todo el torneo.',
    items: [
      {
        label: 'Cómo se juega',
        value: 'Duplas fijas 2v2 que no cambian en el torneo. Quien se inscribe solo recibe pareja por sorteo.',
      },
      {
        label: 'Cupos máximos',
        value: '12 jugadores como máximo (6 duplas). Si hay más inscritos, pasan a lista de espera.',
      },
      {
        label: 'Configuración',
        value: 'Modo Soccar, 5 minutos, mapa DFH Stadium, sin mutadores ni bots. Empate se define con gol de oro en tiempo extra.',
      },
      {
        label: 'Cuadro y final',
        value: 'Con 6 duplas: 2 pasan directo a semifinales, 2 partidos de primera ronda, 2 semis, final (Bo3 si sobra tiempo) y partido por 3.º lugar.',
      },
      {
        label: 'Pausas y control',
        value: 'La partida la crea el staff. Pausar sin motivo da advertencia y si se repite se pierde el partido.',
      },
    ],
  },
  fortnite: {
    summary: 'Duelos 1 contra 1 sin construcción (Zero Build) por eliminación directa.',
    items: [
      {
        label: 'Mapa oficial',
        value: 'Rapid Zero Build 1v1: código de isla 9672-8216-8367.',
      },
      {
        label: 'Cupos máximos',
        value: '8 jugadores como máximo. Si hay más inscritos, pasan a lista de espera.',
      },
      {
        label: 'Cuadro',
        value: '4 cuartos de final a la vez, 2 semifinales a la vez, y la final junto al partido por el 3.º lugar (7 duelos, aprox. 40 min).',
      },
      {
        label: 'Final y llegada',
        value: 'La final es al mejor de 3 si sobra tiempo. Debes estar listo 10 minutos antes de tu primer duelo o pierdes por W.O.',
      },
    ],
  },
  brawl: {
    summary: 'Duelos clásicos 1 contra 1 en Wii, un combate a la vez sin necesidad de notebook.',
    items: [
      {
        label: 'Cupos y cuadro',
        value: 'Máximo 8 jugadores (7 duelos, aprox. 50 min). Quienes pierden en semifinales comparten el 3.º y 4.º lugar y se reparten los puntos.',
      },
      {
        label: 'Reglas del duelo',
        value: '3 vidas, 6 minutos, sin objetos y sin pausa. Escenarios por sorteo: Battlefield, Final Destination o Smashville.',
      },
      {
        label: 'Si se acaba el tiempo',
        value: 'Gana quien tenga más vidas. Si empatan, quien tenga menos daño. Si sigue igual: duelo extra de 1 vida y 3 minutos.',
      },
      {
        label: 'Final y llegada',
        value: 'Final al mejor de 3 si sobra tiempo. Tolerancia de 5 minutos al ser llamado o se pierde por W.O.',
      },
    ],
  },
  cazatesoros: {
    summary: '1 hora buscando tesoros de la Semana 3 en Fortnite Dúos (se juega a la vez que Brawl).',
    items: [
      {
        label: 'Cómo se juega',
        value: '1 dúo por alianza (6 jugadores en total) en Battle Royale dúos abriendo cofres Treasure Hunters. Si son eliminados vuelven a entrar.',
      },
      {
        label: 'Puntaje Semana 3',
        value: 'Gizmos: 1 pt, Pantalla de carga: 2 pts, Jam Track: 3 pts, Mochila: 4 pts, Corvette ZR1 dorado: 10 pts.',
      },
      {
        label: 'Victoria instantánea',
        value: 'Pirate Shop Access (1 en 137.500) o Solid Gold Miku (1 en 1.562.500) otorgan automáticamente el 1.º lugar.',
      },
      {
        label: 'Control y excepciones',
        value: 'Un tesoro cuenta solo si aparece en pantalla y lo ve el staff. Si nadie encuentra nada: 950 pts para las tres alianzas.',
      },
      {
        label: 'Trampas',
        value: 'Uso de bugs, macros, programas externos o ayuda de espectadores deja a la alianza con 0 puntos.',
      },
    ],
  },
  'just-dance': {
    summary: 'Competencia de baile en Wii a 5 canciones con puntaje del juego y jurado en la final.',
    items: [
      {
        label: 'Cómo se juega',
        value: 'En cada ronda baila 1 integrante por alianza, los tres a la vez con la misma canción elegida por la organización.',
      },
      {
        label: 'Rondas y bailarines',
        value: '5 canciones: 4 rondas normales y 1 final. Cada alianza debe presentar un bailarín distinto en cada ronda.',
      },
      {
        label: 'Cómo se puntúa',
        value: 'Rondas 1 a 4 (puntaje del juego): 1.º 3 pts, 2.º 2 pts, 3.º 1 pt. Ronda final (jurado de 3 personas): vale doble (6, 4 y 2 pts).',
      },
      {
        label: 'Reglas de baile',
        value: 'Se baila con todo el cuerpo, no solo con la mano del control. Prohibido empujar, bloquear o perder a propósito.',
      },
    ],
  },
  'mimica-gamer': {
    summary: 'Adivinanzas de videojuegos y personajes en 5 turnos de 60 segundos por alianza.',
    items: [
      {
        label: 'Participantes por turno',
        value: '4 personas por alianza en cada turno: 1 mimo distinto por turno y 3 adivinadores. El resto alienta en silencio.',
      },
      {
        label: 'Turnos y tarjetas',
        value: '5 turnos de 60 segundos por alianza. Cada acierto suma 1 punto. Mazo parejo con tarjetas difíciles desde el turno 4.',
      },
      {
        label: 'Comodín de paso',
        value: 'El mimo puede decir "paso" y saltar hasta 1 tarjeta por turno sin castigo.',
      },
      {
        label: 'Prohibido y desempate',
        value: 'Prohibido hablar, hacer sonidos, mover labios, escribir letras en el aire o señalar objetos. Empate en 1.º lugar: tarjeta extra.',
      },
    ],
  },
};
