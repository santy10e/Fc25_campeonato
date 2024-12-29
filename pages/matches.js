// pages/matches.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/Matches.module.scss';

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const storedMatches = localStorage.getItem('fifa25-matches');
    if (storedMatches) {
      setMatches(JSON.parse(storedMatches));
    }
  }, []);

  const handleScoreChange = (matchId, homeScore, awayScore) => {
    const updatedMatches = matches.map((match) => {
      if (match.id === matchId) {
        return {
          ...match,
          homeScore: homeScore !== '' ? parseInt(homeScore, 10) : null,
          awayScore: awayScore !== '' ? parseInt(awayScore, 10) : null,
        };
      }
      return match;
    });
    setMatches(updatedMatches);
    localStorage.setItem('fifa25-matches', JSON.stringify(updatedMatches));
  };

  if (matches.length === 0) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Partidos</h1>
        <p>No hay partidos generados. Por favor, ve a Administración y genera el fixture.</p>
        <nav>
          <Link href="/" className="btn secondary">
            Volver al inicio
          </Link>
        </nav>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Ingresar Resultados</h1>

      <div className={styles.matchGrid}>
        {matches.map((match) => {
          // Para mostrar si es ida, vuelta o single:
          let matchLabel = 'Partido Único';
          if (match.id.includes('ida')) matchLabel = 'Ida';
          if (match.id.includes('vuelta')) matchLabel = 'Vuelta';

          return (
            <div key={match.id} className={styles.card}>
              <div className={styles.playersRow}>
                {/* Jugador Local */}
                <div className={styles.playerInfo}>
                  <img
                    src={match.homePlayer.imageUrl}
                    alt={match.homePlayer.name}
                    className={styles.playerImg}
                  />
                  <p>{match.homePlayer.name}</p>
                </div>

                {/* Marcadores */}
                <div className={styles.scoreSection}>
                  <input
                    type="number"
                    className={styles.scoreInput}
                    value={match.homeScore ?? ''}
                    onChange={(e) =>
                      handleScoreChange(match.id, e.target.value, match.awayScore ?? '')
                    }
                  />
                  <span className={styles.vsText}>vs</span>
                  <input
                    type="number"
                    className={styles.scoreInput}
                    value={match.awayScore ?? ''}
                    onChange={(e) =>
                      handleScoreChange(match.id, match.homeScore ?? '', e.target.value)
                    }
                  />
                </div>

                {/* Jugador Visitante */}
                <div className={styles.playerInfo}>
                  <img
                    src={match.awayPlayer.imageUrl}
                    alt={match.awayPlayer.name}
                    className={styles.playerImg}
                  />
                  <p>{match.awayPlayer.name}</p>
                </div>
              </div>

              {/* Etiqueta de Ida/Vuelta o Single */}
              <p className={styles.matchType}>{matchLabel}</p>
            </div>
          );
        })}
      </div>

      <nav style={{ marginTop: '2rem' }}>
        <Link href="/" className="btn secondary">
          Volver al inicio
        </Link>
      </nav>
    </div>
  );
}
