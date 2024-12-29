// pages/standings.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/Standing.module.scss';

export default function StandingsPage() {
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [standings, setStandings] = useState([]);

  // Cargar inicialmente
  useEffect(() => {
    loadData();
  }, []);

  // Suscribirse a cambios en localStorage (para tiempo real)
  useEffect(() => {
    const handleStorage = (event) => {
      // Chequeamos si cambiaron la key de matches
      if (event.key === 'fifa25-matches') {
        loadData(); // recargar data
      }
      // Si quieres también escuchar cambios en 'fifa25-players', se hace algo similar
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const loadData = () => {
    const storedPlayers = localStorage.getItem('fifa25-players');
    const storedMatches = localStorage.getItem('fifa25-matches');
    if (storedPlayers) {
      setPlayers(JSON.parse(storedPlayers));
    }
    if (storedMatches) {
      const parsedMatches = JSON.parse(storedMatches);
      setMatches(parsedMatches);
      // Recalcular standings
      if (storedPlayers) {
        const parsedPlayers = JSON.parse(storedPlayers);
        const newTable = calculateStandings(parsedPlayers, parsedMatches);
        setStandings(newTable);
      }
    }
  };

  // Cada vez que 'players' o 'matches' cambien en este componente, recalculamos
  useEffect(() => {
    if (players.length && matches.length) {
      const newTable = calculateStandings(players, matches);
      setStandings(newTable);
    }
  }, [players, matches]);

  // Lógica de puntos
  const calculateStandings = (playersArr, matchesArr) => {
    const tableMap = {};
    playersArr.forEach((p) => {
      tableMap[p.name] = {
        name: p.name,
        imageUrl: p.imageUrl,
        points: 0,
        gf: 0,
        ga: 0,
        dg: 0,
      };
    });

    matchesArr.forEach((m) => {
      const { homePlayer, awayPlayer, homeScore, awayScore } = m;
      if (homeScore === null || awayScore === null) return;
      // Goles
      tableMap[homePlayer.name].gf += homeScore;
      tableMap[homePlayer.name].ga += awayScore;
      tableMap[awayPlayer.name].gf += awayScore;
      tableMap[awayPlayer.name].ga += homeScore;
      // dg
      tableMap[homePlayer.name].dg =
        tableMap[homePlayer.name].gf - tableMap[homePlayer.name].ga;
      tableMap[awayPlayer.name].dg =
        tableMap[awayPlayer.name].gf - tableMap[awayPlayer.name].ga;
      // Puntos
      if (homeScore > awayScore) {
        tableMap[homePlayer.name].points += 3;
      } else if (awayScore > homeScore) {
        tableMap[awayPlayer.name].points += 3;
      } else {
        tableMap[homePlayer.name].points += 1;
        tableMap[awayPlayer.name].points += 1;
      }
    });

    // Ordenar
    return Object.values(tableMap).sort((a, b) => {
      if (b.points === a.points) {
        return b.dg - a.dg;
      }
      return b.points - a.points;
    });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Tabla de Posiciones (Tiempo Real)</h1>
      {standings.length === 0 ? (
        <p>No hay datos suficientes o no se han ingresado resultados.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Pos</th>
              <th>Jugador</th>
              <th>Pts</th>
              <th>GF</th>
              <th>GC</th>
              <th>DG</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((player, index) => (
              <tr key={player.name}>
                <td>{index + 1}</td>
                <td className={styles.playerCell}>
                  <img
                    src={player.imageUrl}
                    alt={player.name}
                    className={styles.playerImg}
                  />
                  {player.name}
                </td>
                <td>{player.points}</td>
                <td>{player.gf}</td>
                <td>{player.ga}</td>
                <td>{player.dg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <nav style={{ marginTop: '2rem' }}>
        <Link href="/" className="btn primary">
          Volver al inicio
        </Link>
      </nav>
    </div>
  );
}
